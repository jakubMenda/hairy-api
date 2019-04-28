import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { DBService, EmailsService } from '../../di';
import { CONFLICT, OK, CREATED, NOT_FOUND, BAD_REQUEST } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import {
  newSpecialistValidation,
  newUserValidation,
  resetPasswordValidation,
  signInValidation,
  specialistsQueryValidation, specialistsTimetableParamsValidation,
} from './validation';
import { generatePassword } from '../../utils/passwordGenerator';
import { authenticate } from '../../middleware/authentication';
import { getRequestingUser } from '../../utils/authentication';
import { UserModel } from '../../services/db/users/model';
import { asyncForEach } from '../../utils/async';
import { OrderModel } from '../../services/db/order/model';
import moment = require('moment');
import { HolidayModel } from '../../services/db/holiday/model';

const usersController = Router();

usersController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Čapnu si tělo requestu
    const userData = _.get(req, 'body');
    if (userData.isSpecialist) {
      // yup validace
      await newSpecialistValidation.validate(userData);
    } else {
      userData.isSpecialist = false;
      await newUserValidation.validate(userData);
    }

    // nejdřív kontrola, jestli už není email v db
    const existingUser = await DBService.UsersService.getUserByEmail(_.get(userData, 'email', ''));
    if (existingUser) {
      // pokud user už existuje, zavolám fn next, která zabrání provádění dalšího kódu a předá handling dalšímu middlewaru.
      // pokud předám v next jako parametr error (vytvářím nový http error), bude ho handlovat až errorHandler (jediný
      // midleware, který má na vstupu i error)
      next(
        new HttpError({
          statusCode: CONFLICT,
          message: `Email (${_.get(userData, 'email', '')}) is already in use`,
        })
      );
    } else {
      // uložení nového uživatele
      const savedUser = await DBService.UsersService.saveUser(userData);

      // Naformátování modelu do objektu a vytáhnutí hesla - nechci ho posílat zpět
      const profile = await savedUser.getPublicProfile();

      await EmailsService.sendWelcomeAboardMail(savedUser.email);

      // odpověď klientovi
      res.status(CREATED).json(profile);
    }
  } catch (e) {
    // podobně jako výše. V případě, že nastane jakákoli chyba, jen jí předám dál a stará se o ní error handler
    return next(e);
  }
});

usersController.post('/specialist', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const admin = await getRequestingUser(token);
    if (!admin) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    const userData = _.get(req, 'body');
    userData.isSpecialist = true;
    await newSpecialistValidation.validate(userData);
    const adminsSalon = await DBService.SalonService.getSalonByUserId(admin._id);
    if (!adminsSalon) {
      next(
        new HttpError({
          statusCode: NOT_FOUND,
          message: 'You have no salon yet',
        })
      );
    }

    const existingUser = await DBService.UsersService.getUserByEmail(_.get(userData, 'email', ''));
    if (existingUser) {
      next(
        new HttpError({
          statusCode: CONFLICT,
          message: `Email (${_.get(userData, 'email', '')}) is already in use`,
        })
      );
    } else {
      const generatedPassword = generatePassword();
      userData.password = generatedPassword;

      if (req.body.services) {
        await asyncForEach(req.body.services, async (serviceId: string) => {
          const serviceInDb = await DBService.ServiceService.findServiceById(serviceId);

          if (!serviceInDb) {
            throw new HttpError({
              statusCode: NOT_FOUND,
              message: `Service ${serviceId} not found`,
            });
          }
        });
      }

      const savedUser = await DBService.UsersService.saveUser(userData);

      const specialistsIds = adminsSalon.specialists.map((user: UserModel) => user._id);
      const newSpecialists = [...specialistsIds, savedUser._id];
      await DBService.SalonService.updateSalon(adminsSalon._id, { specialists: newSpecialists });

      const profile = await savedUser.getPublicProfile();

      await EmailsService.sendSpecialistWelcomeAboardMail(savedUser.email, generatedPassword);

      res.status(CREATED).json(profile);
    }
  } catch (e) {
    return next(e);
  }
});

usersController.post('/sign-in', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Bezpečné vytáhnutí body requestu
    const reqBody = _.get(req, 'body');

    // yup validace
    await signInValidation.validate(reqBody);

    // metoda níže vytáhne usera z db a porovná heslo. V případě, že souhlasí, vrátí usera. Jinak vyhodí http error (403).
    const userModel = await DBService.UsersService.getUserByCredentials(
      _.get(reqBody, 'email'),
      _.get(reqBody, 'password')
    );

    // User je ověřen -> vytvořím jwt token
    const token = await userModel.generateAuthToken();

    // Vytáhnu z dat uživatele heslo - nechci ho posílat po síti
    const profile = await userModel.getPublicProfile();

    // pošlu zpět klientovi
    res.status(OK).json({
      token,
      user: profile,
    });
  } catch (e) {
    return next(e);
  }
});

usersController.put('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reqBody = _.get(req, 'body');
    await resetPasswordValidation.validate(reqBody);

    const userModel = await DBService.UsersService.getUserByEmail(reqBody.email);
    if (!userModel) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    const generatedPassword = generatePassword();
    userModel.password = generatedPassword;
    await EmailsService.sendResetPasswordMail(userModel.email, generatedPassword);
    await userModel.save();
    res.status(OK).json(await userModel.getPublicProfile());
  } catch (e) {
    return next(e);
  }
});

usersController.get('/specialists', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParams = _.get(req, 'query');

    await specialistsQueryValidation.validate(queryParams);

    const users = await DBService.UsersService.getSpecialistsByService(queryParams.serviceId);
    if (!users) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: `Failed. ServiceId query param (${queryParams.serviceId}) probably points to non-existent service.`,
      });
    }

    res.status(OK).json(users);
  } catch (e) {
    return next(e);
  }
});

usersController.get('/specialists/:specialistId/timetable', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = _.get(req, 'params');

    await specialistsTimetableParamsValidation.validate(params);

    const specialistInfo = await DBService.UsersService.getUserById(params.specialistId);

    if (!specialistInfo) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: `Specialist with id (${params.specialistId}) not found.`,
      });
    }

    if (!specialistInfo.isSpecialist) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: `User with id (${params.specialistId}) is not specialist.`,
      });
    }

    const orders = await DBService.OrderService.getUnpopulatedOrdersByUser(params.specialistId);
    const holidays = await DBService.HolidayService.getHolidayByUser(params.specialistId);

    const events: any[] = [];

    orders.forEach((order: any) => {
      if (typeof order.service !== 'string' && moment().isBefore(moment(order.date))) {
        const beforeTime = order.service.beforeTime ? order.service.beforeTime : 0;
        const afterTime = order.service.afterTime ? order.service.afterTime : 0;
        if ((!order.service.timeWindows || (Array.isArray(order.service.timeWindows) && !order.service.timeWindows.length))) {
          events.push({
            start: order.date,
            end: moment(order.date).add(order.service.duration, 'minutes')
                .add(beforeTime, 'minutes')
                .add(afterTime, 'minutes')
                .toISOString(),
          });
        }
        if (Array.isArray(order.service.timeWindows)) {
          order.service.timeWindows.forEach((timeWindow: any, index: number) => {
            if (!index) {
              events.push({
                start: order.date,
                end: moment(order.date).add(timeWindow.start, 'minutes')
                    .add(beforeTime, 'minutes')
                    .add(afterTime, 'minutes')
                    .toISOString(),
              });
            }

            events.push({
              start: moment(order.date)
                  .add(beforeTime, 'minutes')
                  .add(timeWindow.end, 'minutes')
                  .toISOString(),
              end: order.service.timeWindows[index + 1] ?
                moment(order.date).add(order.service.timeWindows[index + 1], 'minutes').toISOString() :
                moment(order.date).add(order.service.duration, 'minutes')
                    .add(afterTime, 'minutes')
                    .toISOString(),
            });
          });
        }
      }
    });

    holidays.forEach((holiday: HolidayModel) => {
      events.push({
        start: holiday.from,
        end: holiday.to,
      });
    });

    const responseObj = {
      specialistInfo: specialistInfo,
      scheduledEvents: events,
    };

    res.status(OK).json(responseObj);
  } catch (e) {
    return next(e);
  }
});

export default usersController;

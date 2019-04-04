import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { DBService, EmailsService } from '../../di';
import { CONFLICT, OK, CREATED, NOT_FOUND } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import { newSpecialistValidation, newUserValidation, resetPasswordValidation, signInValidation } from './validation';
import { generatePassword } from '../../utils/passwordGenerator';
import { authenticate } from '../../middleware/authentication';
import { getRequestingUser } from '../../utils/authentication';
import { UserModel } from '../../services/db/users/model';

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
  } catch(e) {
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

export default usersController;

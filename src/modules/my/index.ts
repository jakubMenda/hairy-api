import { NextFunction, Request, Response, Router } from 'express';
import { getRequestingUser } from '../../utils/authentication';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import {salonValidation} from '../salon/validation';
import _ from 'lodash';
import {DBService} from '../../di/services/DBService';

const myController = Router();

myController.get('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }
    res.status(OK).json(await user.getPublicProfile());
  } catch (e) {
    return next(e);
  }
});

myController.put('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = Object.keys(req.body);
    let allowedUpdates: string[] = [];

    if (req.body.isSpecialist) {
      allowedUpdates = ['firstName', 'lastName', 'password', 'practiceFrom', 'workingFromMinutes', 'workingToMinutes', 'workingDays', 'specialization', 'workingAtSalonId'];
    } else {
      allowedUpdates = ['firstName', 'lastName', 'password'];
    }

    const isValidOperation = updates.every((update: string) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'Bad request',
      });
    }

    const token = req.header('Authorization');
    const user: any = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    updates.forEach((update: string) => user[update] = req.body[update]);
    const updatedUser = await user.save();

    res.status(OK).json(await updatedUser.getPublicProfile());
  } catch(e) {
    return next(e);
  }
});

myController.get('/salon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Autorizační token
    const token = req.header('Authorization');
    // Instance uživatele
    const user = await getRequestingUser(token);

    // Uživatel nenalezen
    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }
    // Pokud je uživatel manažer nebo specialista, tak vracím jeho salón
    const salon = await DBService.SalonService.getSalonByUserId(user.id);
    if (!salon) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'Salon not found',
      });
    }
    res.status(OK).json(salon);
  } catch (e) {
    return next(e);
  }
});

// Put by se měl asi dělat ideálně podle identifikátoru - kdyby mohl být jeden uživatel specialistou ve dvou salónech (tzn nemusíme řešit)
// Vezmu data, která uživatel poslal, najdu jeho salón (buď ID nebo kde je manažer/specialista)
// Zvaliduju,jestli jsou změny přípustný
// Nastavím ho jako Salon.lastEditBy a upravím Salon.lastEdit na "teď"
// Vracím upravený salón
myController.put('/salon', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Tohle vytahování usera by šlo někam přesunout, je to dost redundantní (tzn serem na to)
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);
    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }
    const salon = await DBService.SalonService.getSalonByUserId(user.id);
    if (!salon) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'Salon not found',
      });
    }
    // Jaký je teda správný vytahování requeste (někde to je takhle _.get(req, 'body')
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'city', 'street', 'postCode', 'houseNumber', 'phone', 'deposit', 'serviceCancelDate'];
    const isValidOperation = updates.every((update: string) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'Bad request',
      });
    }
    // Validace by asi měla být updateSalonValidation, kde nic nebude required, jelikož se posílají pouze změny?
    await salonValidation.validate(updates);
    // Ještě provést změny TODO
    // updates.forEach((update: string) => user[update] = req.body[update]);
    salon.lastEdit = new Date();
    salon.lastEditBy = user.id;
    const updatedSalon = await salon.save();
    res.status(OK).json(updatedSalon);
  } catch (e) {
    return next(e);
  }
});

export default myController;

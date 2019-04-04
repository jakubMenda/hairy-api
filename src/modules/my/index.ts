import { NextFunction, Request, Response, Router } from 'express';
import { getRequestingUser } from '../../utils/authentication';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import { salonValidation, updateSalonValidation } from '../salon/validation';
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
    res.status(OK).json(salon);
  } catch (e) {
    return next(e);
  }
});

myController.put('/salon', async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    await updateSalonValidation.validate(req.body);

    req.body.updatedBy = user.id;

    await DBService.SalonService.updateSalon(salon._id, req.body);
    res.status(OK).json({});
  } catch (e) {
    return next(e);
  }
});

export default myController;

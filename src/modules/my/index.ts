import { NextFunction, Request, Response, Router } from 'express';
import { getRequestingUser } from '../../utils/authentication';
import {BAD_REQUEST, NOT_FOUND, OK, UNAUTHORIZED} from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import { updateSalonValidation } from '../salon/validation';
import {DBService} from '../../di/services/DBService';
import {newServiceValidation, updateServiceValidation} from '../service/validation';
import _ from 'lodash';

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

myController.get('/salon/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);
    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }
    const salon = await DBService.SalonService.getSalonByUserId(user._id);
    if (!salon) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'Salon not found',
      });
    }
    const services = await DBService.ServiceService.getServicesBySalonId(salon._id);

    res.status(OK).json(services);
  } catch (e) {
    return next(e);
  }
});

myController.post('/salon/services', async (req: Request, res: Response, next: NextFunction) => {
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
    await newServiceValidation.validate(req.body);
    req.body.salon = salon.id;
    const service = await DBService.ServiceService.createService(req.body);

    res.status(OK).json(service);
  } catch (e) {
    return next(e);
  }
});

myController.put('/salon/services/:id', async (req: Request, res: Response, next: NextFunction) => {
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
    const serviceId = req.params.id;
    const service = await DBService.ServiceService.findServiceById(serviceId);
    if (!service) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'Service not found',
      });
    }
    // Musí mít přístup k salonu (specialista nebo manažer)
    if (salon._id.toString() !== service.salon.toString()) {
      throw new HttpError({
        statusCode: UNAUTHORIZED,
        message: 'Unauthorized to edit this service',
      });
    }
    await updateServiceValidation.validate(req.body);
    await DBService.ServiceService.updateService(service._id, req.body);
    res.status(OK).json({});
  } catch (e) {
    return next(e);
  }
});

myController.delete('/salon/services/:id', async (req: Request, res: Response, next: NextFunction) => {
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
    const serviceId = req.params.id;
    const service = await DBService.ServiceService.findServiceById(serviceId);
    if (!service) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'Service not found',
      });
    }
    // Musí mít přístup k salonu (specialista nebo manažer)
    if (salon._id.toString() !== service.salon.toString()) {
      throw new HttpError({
        statusCode: UNAUTHORIZED,
        message: 'Unauthorized to edit this service',
      });
    }
    await DBService.ServiceService.removeServiceById(service._id);
    res.status(OK).json({});
  } catch (e) {
    return next(e);
  }
});

export default myController;

import {NextFunction, Request, Response, Router} from 'express';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from 'http-codes';
import _ from 'lodash';
import {salonValidation} from './validation';
import {HttpError} from '../../utils/errorHandling/errors';
import {getRequestingUser} from '../../utils/authentication';
import {DBService} from '../../di/services/DBService';
import {authenticate} from '../../middleware/authentication';
import myController from '../my';
import { serviceGetValidation } from '../service/validation';

const salonController = Router();

salonController.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
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
    if (salon) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'User can manage only up to 1 salon',
      });
    }

    const reqBody = _.get(req, 'body');
    await salonValidation.validate(reqBody);

    await DBService.SalonService.createSalon(reqBody, user._id, user.isSpecialist);

    res.status(OK).json();
  } catch (e) {
    return next(e);
  }
});

salonController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salons = await DBService.SalonService.getSalons();
    if (!salons) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'No salon',
      });
    }
    res.status(OK).json(salons);
  } catch (e) {
    return next(e);
  }
});

salonController.get('/:salonId/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salonId = _.get(req.params, 'salonId');

    if (!salonId) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'Salon id is required path parameter',
      });
    }

    const salon = await DBService.SalonService.getSalonById(salonId);

    if (!salon) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: `Salon with id ${salonId} not found`,
      });
    }

    const queryParams = _.get(req, 'query');
    await serviceGetValidation.validate(queryParams);

    const category = await DBService.CategoryService.getCategoryById(queryParams.category);

    if (!category) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: `Category with id ${queryParams.category} not found`,
      });
    }

    const hairType = await DBService.HairTypeService.getHairTypeById(queryParams.hairType);

    if (!hairType) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: `Hair type with id ${queryParams.hairType} not found`,
      });
    }

    const services = await DBService.ServiceService.getServicesByFilters(
      salonId,
      queryParams.hairType,
      queryParams.category,
    );

    if (!services) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'One of the params (salonId, hairType, category) is in a bad format',
      });
    }

    res.status(OK).json(services);
  } catch (e) {
    return next(e);
  }
});

export default salonController;

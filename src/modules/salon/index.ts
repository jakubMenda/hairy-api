import { NextFunction, Request, Response, Router } from 'express';
import { FORBIDDEN, NOT_FOUND, OK } from 'http-codes';
import _ from 'lodash';
import { salonValidation } from './validation';
import { HttpError } from '../../utils/errorHandling/errors';
import { getRequestingUser } from '../../utils/authentication';
import { DBService } from '../../di/services/DBService';
import { authenticate } from '../../middleware/authentication';

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

export default salonController;

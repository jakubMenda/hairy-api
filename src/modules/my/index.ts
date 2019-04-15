import { NextFunction, Request, Response, Router } from 'express';
import { getRequestingUser } from '../../utils/authentication';
import { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import { updateSalonValidation } from '../salon/validation';
import { DBService } from '../../di/services/DBService';
import { orderValidation, updateOrderValidation } from '../order/validation';
import { newServiceValidation, updateServiceValidation } from '../service/validation';
import { EmailsService } from '../../di/services/EmailsService';
import { OrderModel } from '../../services/db/order/model';
import moment = require('moment');
import { asyncForEach } from '../../utils/async';

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
      allowedUpdates = ['firstName', 'lastName', 'password', 'practiceFrom', 'workingFromMinutes', 'workingToMinutes', 'workingDays', 'specialization', 'workingAtSalonId', 'isSpecialist', 'services'];
    } else {
      allowedUpdates = ['firstName', 'lastName', 'password', 'isSpecialist'];
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

    updates.forEach((update: string) => user[update] = req.body[update]);
    const updatedUser = await user.save();

    res.status(OK).json(await updatedUser.getPublicProfile());
  } catch (e) {
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

    if (typeof salon.manager === 'string' || !salon.manager._id.equals(user.id)) {
      throw new HttpError({
        statusCode: UNAUTHORIZED,
        message: 'User has to be salon admin to manage services',
      });
    }

    await newServiceValidation.validate(req.body);
    if (req.body.timeWindows && req.body.timeWindows.length) {
      req.body.timeWindows.forEach((timeWindow: any) => {
        if (timeWindow.start > req.body.duration || timeWindow.end > req.body.duration) {
          throw new HttpError({
            statusCode: BAD_REQUEST,
            message: 'Time windows can only be set BEFORE the duration runs out',
          });
        }
      });
    }
    req.body.salon = salon.id;
    const service = await DBService.ServiceService.createService(req.body);

    res.status(CREATED).json(service);
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

    if (typeof salon.manager === 'string' || !salon.manager._id.equals(user.id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'User has to be salon admin to manage services',
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

    if (typeof salon.manager === 'string' || !salon.manager._id.equals(user.id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'User has to be salon admin to manage services',
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

    await DBService.ServiceService.removeServiceById(service._id);
    res.status(OK).json({});
  } catch (e) {
    return next(e);
  }
});

myController.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    const orders = await DBService.OrderService.getOrdersByUser(user.id);
    const sortedOrders = orders.sort((a: OrderModel, b: OrderModel) => moment(a.date).diff(b.date));

    res.status(OK).json(sortedOrders);
  } catch (e) {
    return next(e);
  }
});

myController.get('/salon/orders', async (req: Request, res: Response, next: NextFunction) => {
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

    const orders = await DBService.OrderService.getOrdersBySalon(salon.specialists);
    const sortedOrders = orders.sort((a: OrderModel, b: OrderModel) => moment(a.date).diff(b.date));

    res.status(OK).json(sortedOrders);
  } catch (e) {
    return next(e);
  }
});

myController.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    if (!user._id.equals(req.body.specialist) && !await isSalonManager(user._id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'Only salon managers can assign order to other specialists than themselves',
      });
    }

    await orderValidation.validate(req.body);

    const order = await DBService.OrderService.createOrder(req.body, user.id);

    await EmailsService.sendNewOrderCustomerEmail(req.body);

    const specialist = await DBService.UsersService.getUserById(req.body.specialist);
    await EmailsService.sendNewOrderSpecialistEmail(specialist.email, req.body);

    res.status(CREATED).json(order);
  } catch (e) {
    return next(e);
  }
});

myController.put('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    const orderId = req.params.orderId;
    const order = await DBService.OrderService.getOrder(orderId);

    if (!order) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: `Order with id ${orderId} not found`,
      });
    }

    if (!user._id.equals(order.specialist) && !await isSalonManager(user._id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'User can manage only own order',
      });
    }

    await updateOrderValidation.validate(req.body);
    await DBService.OrderService.updateOrder(orderId, req.body, user._id);
    res.status(OK).json();

  } catch (e) {
    return next(e);
  }
});

myController.delete('/orders/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    const orderId = req.params.orderId;
    const order = await DBService.OrderService.getOrder(orderId);

    if (!order) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: `Order with id ${orderId} not found`,
      });
    }

    if (!user._id.equals(order.specialist) && !await isSalonManager(user._id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'User can manage only own order',
      });
    }

    await DBService.OrderService.deleteOrder(orderId);
    res.status(OK).json();

  } catch (e) {
    return next(e);
  }
});

async function isSalonManager(userId: any) {
  const salon = await DBService.SalonService.getSalonByUserId(userId);

  if (salon) {
    if (typeof salon.manager === 'string') {
      return userId.equals(salon.manager);
    } else {
      return salon.manager._id.equals(userId);
    }
  }
  return false;
}

export default myController;

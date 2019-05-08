import { NextFunction, Request, Response, Router } from 'express';
import { getOrderCancellationLink, getRequestingUser } from '../../utils/authentication';
import { BAD_REQUEST, CONFLICT, CREATED, FORBIDDEN, NOT_FOUND, OK, UNAUTHORIZED } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';
import { updateSalonValidation } from '../salon/validation';
import { DBService } from '../../di/services/DBService';
import { orderValidation, updateOrderValidation } from '../order/validation';
import { newServiceValidation, updateServiceValidation } from '../service/validation';
import { EmailsService } from '../../di/services/EmailsService';
import { OrderModel } from '../../services/db/order/model';
import moment = require('moment');
import { asyncForEach } from '../../utils/async';
import { holidayValidation } from '../holiday/validation';

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

    const salon = await DBService.SalonService.getSalonByAdminId(user._id);
    const userData = await user.getPublicProfile();

    res.status(OK).json({ ...userData, isAdmin: Boolean(salon) });
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
    const cancellationLink = getOrderCancellationLink(order._id.toString());

    await EmailsService.sendNewOrderCustomerEmail(req.body, cancellationLink);

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
    EmailsService.sendOrderDeletionEmail(order.date, order.email);
    res.status(OK).json();

  } catch (e) {
    return next(e);
  }
});

myController.put('/specialists/:specialistId', async (req: Request, res: Response, next: NextFunction) => {
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
    const requestingUser = await getRequestingUser(token);

    if (!requestingUser || !await isSalonManager(requestingUser._id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'Only admin can edit specialists profile',
      });
    }

    const user: any = await DBService.UsersService.getUserById(req.params.specialistId);

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

myController.get('/specialists/:specialistId/holiday', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    if (!await isSalonManager(user._id)) {
      throw new HttpError({
        statusCode: FORBIDDEN,
        message: 'Only admin can see other specialists holiday',
      });
    }
    res.status(OK).json(await DBService.HolidayService.getHolidayByUser(req.params.specialistId));
  } catch (e) {
    return next(e);
  }
});

myController.get('/holiday', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }
    res.status(OK).json(await DBService.HolidayService.getHolidayByUser(user._id));
  } catch (e) {
    return next(e);
  }
});

myController.post('/holiday', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);
    const { body } = req;

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    await holidayValidation.validate(body);
    const orders = await DBService.OrderService.getOrdersByUser(user._id);

    if (!orders) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'Failed to retrieve users service. User is probably not a specialist.',
      });
    }

    const fromMoment = moment(body.from);
    const toMoment = moment(body.to);

    orders.forEach((order: OrderModel) => {
      const date = moment(order.date);

      if (typeof order.service !== 'string') {
        if ((fromMoment.isBefore(date) && toMoment.isAfter(date))
          || (fromMoment.isBefore(date.add(order.service.duration, 'minutes')) && toMoment.isAfter(date.add(order.service.duration, 'minutes')))) {
          throw new HttpError({
            statusCode: CONFLICT,
            message: 'There are conflicting scheduled orders at this time already',
          });
        }
      }
    });

    res.status(CREATED).json(await DBService.HolidayService.createHoliday(user._id, body));
  } catch (e) {
    return next(e);
  }
});

myController.put('/holiday/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);
    const { body } = req;

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    await holidayValidation.validate(body);
    const orders = await DBService.OrderService.getOrdersByUser(user._id);

    if (!orders) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'Failed to retrieve users service. User is probably not a specialist.',
      });
    }

    const fromMoment = moment(body.from);
    const toMoment = moment(body.to);

    orders.forEach((order: OrderModel) => {
      const date = moment(order.date);

      if (typeof order.service !== 'string') {
        if ((fromMoment.isBefore(date) && toMoment.isAfter(date))
          || (fromMoment.isBefore(date.add(order.service.duration, 'minutes')) && toMoment.isAfter(date.add(order.service.duration, 'minutes')))) {
          throw new HttpError({
            statusCode: CONFLICT,
            message: 'There are conflicting scheduled orders at this time already',
          });
        }
      }
    });

    await DBService.HolidayService.updateHoliday(user._id, req.params.id, body);
    res.status(OK).json({});
  } catch (e) {
    return next(e);
  }
});

myController.delete('/holiday/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    res.status(OK).json(await DBService.HolidayService.deleteHoliday(user._id, req.params.id));
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

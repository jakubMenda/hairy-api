import { NextFunction, Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, OK } from 'http-codes';
import { DBService } from '../../di/services/DBService';
import { orderValidation } from './validation';
import { EmailsService } from '../../di/services/EmailsService';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import moment from 'moment';
import { getOrderCancellationLink } from '../../utils/authentication';
import path from 'path';

const orderController = Router();

orderController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderValidation.validate(req.body);

    const order = await DBService.OrderService.createOrder(req.body);

    const cancellationLink = getOrderCancellationLink(order._id.toString());
    await EmailsService.sendNewOrderCustomerEmail(req.body, cancellationLink);

    const specialist = await DBService.UsersService.getUserById(req.body.specialist);
    await EmailsService.sendNewOrderSpecialistEmail(specialist.email, req.body);

    res.status(CREATED).json(order);
  } catch (e) {
    return next(e);
  }
});

orderController.get('/cancel/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!_.get(decodedToken, 'order')) {
      res.status(BAD_REQUEST).sendFile(path.join(__dirname, '../../../static/pages/orderCancellation/badRequest.html'));
    } else {
      const order = await DBService.OrderService.getOrderPopulated(_.get(decodedToken, 'order'));

      if (!order) {
        res.status(NOT_FOUND).sendFile(path.join(__dirname, '../../../static/pages/orderCancellation/notFound.html'));
      } else {
        if (moment().isAfter(moment(order.date).subtract(1, 'days'))) {
          res.status(FORBIDDEN).sendFile(path.join(__dirname, '../../../static/pages/orderCancellation/expired.html'));
        } else {
          await DBService.OrderService.deleteOrder(order._id);
          EmailsService.sendOrderDeletionEmail(order.date, order.email);
          if (typeof order.specialist !== 'string') {
            EmailsService.sendOrderDeletionSpecialistEmail(order.date, order.specialist.email, order.firstName, order.lastName);
          }

          res.status(OK).sendFile(path.join(__dirname, '../../../static/pages/orderCancellation/success.html'));
        }
      }
    }
  } catch (e) {
    res.status(500).sendFile(path.join(__dirname, '../../../static/pages/orderCancellation/serverError.html'));
  }
});

export default orderController;

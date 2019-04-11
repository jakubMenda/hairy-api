import { NextFunction, Request, Response, Router } from 'express';
import { CREATED } from 'http-codes';
import { DBService } from '../../di/services/DBService';
import { orderValidation } from './validation';
import { EmailsService } from '../../di/services/EmailsService';

const orderController = Router();

orderController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderValidation.validate(req.body);

    const order = await DBService.OrderService.createOrder(req.body);

    await EmailsService.sendNewOrderCustomerEmail(req.body);

    const specialist = await DBService.UsersService.getUserById(req.body.specialist);
    await EmailsService.sendNewOrderSpecialistEmail(specialist.email, req.body);

    res.status(CREATED).json(order);
  } catch (e) {
    return next(e);
  }
});

export default orderController;

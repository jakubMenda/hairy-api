import {NextFunction, Request, Response, Router} from 'express';
import {getRequestingUser} from '../../utils/authentication';
import {NOT_FOUND, OK} from 'http-codes';
import {HttpError} from '../../utils/errorHandling/errors';
import {DBService} from '../../di/services/DBService';
import {orderValidation} from '../my/validation';

const orderController = Router();

orderController.post('/order', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization');
        const user = await getRequestingUser(token);

        if (!user) {
            throw new HttpError({
                statusCode: NOT_FOUND,
                message: 'User not found',
            });
        }

        await orderValidation.validate(req.body);

        await DBService.OrderService.createOrder(req.body, user.id);

        res.status(OK).json();
    } catch (e) {
        return next(e);
    }
});

export default orderController;

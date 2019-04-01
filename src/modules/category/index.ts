import {NextFunction, Request, Response, Router} from 'express';
import {getRequestingUser} from '../../utils/authentication';
import {NOT_FOUND, OK} from 'http-codes';
import {HttpError} from '../../utils/errorHandling/errors';
import {DBService} from '../../di/services/DBService';

const categoryController = Router();

categoryController.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization');
        const user = await getRequestingUser(token);

        if (!user) {
            throw new HttpError({
                statusCode: NOT_FOUND,
                message: 'User not found',
            });
        }

        const categories = await DBService.CategoryService.getCategories();

        res.status(OK).json(categories);
        next();
    } catch (e) {
        return next(e);
    }
});

export default categoryController;

import {NextFunction, Request, Response, Router} from 'express';
import {getRequestingUser} from '../../utils/authentication';
import {NOT_FOUND, OK} from 'http-codes';
import {HttpError} from '../../utils/errorHandling/errors';
import {DBService} from '../../di/services/DBService';

const categoryController = Router();

categoryController.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await DBService.CategoryService.getCategories();
        res.status(OK).json(categories);
        next();
    } catch (e) {
        return next(e);
    }
});

export default categoryController;

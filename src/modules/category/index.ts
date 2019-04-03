import {NextFunction, Request, Response, Router} from 'express';
import {OK} from 'http-codes';
import {DBService} from '../../di/services/DBService';

const categoryController = Router();

categoryController.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await DBService.CategoryService.getCategories();
        res.status(OK).json(categories);
    } catch (e) {
        return next(e);
    }
});

export default categoryController;

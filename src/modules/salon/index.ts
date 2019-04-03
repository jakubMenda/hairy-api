import {NextFunction, Request, Response, Router} from 'express';
import {OK} from 'http-codes';
import _ from 'lodash';
import {newSalonValidation} from './validation';

const salonController = Router();

salonController.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(OK).json();
    } catch (e) {
        return next(e);
    }
});

salonController.put('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqBody = _.get(req, 'body');
        await newSalonValidation.validate(reqBody);

        res.status(OK).json();
    } catch (e) {
        return next(e);
    }
});

export default salonController;

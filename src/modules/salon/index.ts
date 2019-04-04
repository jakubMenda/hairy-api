import {NextFunction, Request, Response, Router} from 'express';
import {OK} from 'http-codes';
import _ from 'lodash';
import {salonValidation} from './validation';

const salonController = Router();

// Není potřeba, zatím jsem nedělal
salonController.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqBody = _.get(req, 'body');
        await salonValidation.validate(reqBody);

        res.status(OK).json();
    } catch (e) {
        return next(e);
    }
});

export default salonController;

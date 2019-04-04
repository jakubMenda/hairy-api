import { NextFunction, Request, Response, Router } from 'express';
import {OK} from 'http-codes';
import {DBService} from '../../di/services/DBService';

const HairTypeController = Router();

HairTypeController.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(OK).json(await DBService.HairTypeService.getTypes());
    } catch (e) {
      return next(e);
    }
});

export default HairTypeController;

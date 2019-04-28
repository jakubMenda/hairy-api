import {NextFunction, Request, Response, Router} from 'express';
import {authenticate} from '../../middleware/authentication';
import {OK} from 'http-codes';

const serviceController = Router();

serviceController.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(OK).json();
  } catch (e) {
    return next(e);
  }
});

export default serviceController;

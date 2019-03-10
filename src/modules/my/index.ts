import { NextFunction, Request, Response, Router } from 'express';
import { getRequestingUser } from '../../utils/authentication';
import { OK } from 'http-codes';

const myController = Router();

myController.get('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    res.status(OK).json(await user.getPublicProfile());
    next();
  } catch (e) {
    return next(e);
  }
});

export default myController;

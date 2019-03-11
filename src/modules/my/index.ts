import { NextFunction, Request, Response, Router } from 'express';
import { getRequestingUser } from '../../utils/authentication';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-codes';
import { HttpError } from '../../utils/errorHandling/errors';

const myController = Router();

myController.get('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }
    res.status(OK).json(await user.getPublicProfile());
    next();
  } catch (e) {
    return next(e);
  }
});

myController.put('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'password'];
    const isValidOperation = updates.every((update: string) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new HttpError({
        statusCode: BAD_REQUEST,
        message: 'Bad request',
      });
    }

    const token = req.header('Authorization');
    const user: any = await getRequestingUser(token);

    if (!user) {
      throw new HttpError({
        statusCode: NOT_FOUND,
        message: 'User not found',
      });
    }

    updates.forEach((update: string) => user[update] = req.body[update]);
    const updatedUser = await user.save();

    res.status(OK).json(await updatedUser.getPublicProfile());
    next();
  } catch(e) {
    return next(e);
  }
});

export default myController;

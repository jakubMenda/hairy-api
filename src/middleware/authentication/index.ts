import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../utils/errorHandling/errors';
import { UNAUTHORIZED } from 'http-codes';
import { getRequestingUser } from '../../utils/authentication';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');
    const user = await getRequestingUser(token);

    if (!user) {
      throw new Error();
    }
    next();
  } catch(e) {
    return next(
      new HttpError({
        statusCode: UNAUTHORIZED,
        message: 'Unauthorized',
      })
    );
  }
};

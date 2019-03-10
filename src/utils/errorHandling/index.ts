import { NextFunction, Request, Response } from 'express';
import { NOT_FOUND, OK, BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-codes';
import logger from '../logger';

// TODO this can definitely be improved
export default (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    // handle already formatted http errors
    if (err.statusCode) {
      logger.info({ status: err.statusCode, message: err.message, request: `${req.method} ${req.path}` });
      res.status(err.statusCode).json({ message: err.message });
    }
    // not found handler
    else if (!err && (res.statusCode === OK || res.statusCode === NOT_FOUND)) {
      logger.info({ status: NOT_FOUND, message: 'Entity not found', request: `${req.method} ${req.path}` });
      res.status(NOT_FOUND).json({ message: 'Entity not found' });
    }
    // if it's yup or mongoose validation error
    else if (err.name === 'ValidationError') {
      logger.info({ status: BAD_REQUEST, message: err.message, request: `${req.method} ${req.path}` });
      res.status(BAD_REQUEST).json({ message: err.message });
    }
    // otherwise this is a server error - go to catch
    else {
      throw new Error();
    }
  } catch (e) {
    logger.error({ error: e, request: `${req.method} ${req.path}` });
    res.status(INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
};

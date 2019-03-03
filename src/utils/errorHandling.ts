import { Response } from 'express';
import logger from './logger';

// TODO
export function handleErrors(res: Response, reason: string, message: string, code: number) {
  logger.error(reason);
  res.status(code || 500).json({error: message});
}

import { Response } from 'express';

// TODO
function handleError(res: Response, reason: string, message: string, code: number) {
  res.status(code || 500).json({error: message});
}

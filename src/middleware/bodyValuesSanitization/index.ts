import { NextFunction, Request, Response } from 'express';

export const sanitizeReqBody = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    const normalize = (valueObj: any) => {
      Object.keys(valueObj).forEach((key: string) => {
        if (typeof valueObj[key] === 'object' && !Array.isArray(valueObj[key])) {
          valueObj[key] = normalize(valueObj[key]);
        } else if (typeof valueObj[key] === 'string') {
          valueObj[key] = valueObj[key].trim();
        }
      });
    };

    normalize(req.body);
    next();
  }
};

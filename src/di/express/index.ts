import exp from 'express';
import bodyParser from 'body-parser';
import errorHandler from '../../utils/errorHandling/index';
import modules from '../../modules';
import { rateLimiter } from '../../middleware/rateLimiter';
import { sanitizeReqBody } from '../../middleware/bodyValuesSanitization';
import cors from 'cors';
import path from 'path';

export const express = exp()
  .enable('trust proxy')
  .use(rateLimiter)
  .use(cors())
  .options('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
  })
  .use(exp.static(path.join(__dirname, '../../../static')))
  .use(bodyParser.json())
  .use(sanitizeReqBody)
  .use('/', modules)
  .use(errorHandler);

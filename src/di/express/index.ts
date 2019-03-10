import exp from 'express';
import bodyParser from 'body-parser';
import errorHandler from '../../utils/errorHandling/index';
import modules from '../../modules';
import { rateLimiter } from '../../middleware/rateLimiter';

export const express = exp()
  .enable('trust proxy')
  .use(rateLimiter)
  .use(bodyParser.json())
  .use('/', modules)
  .use(errorHandler);

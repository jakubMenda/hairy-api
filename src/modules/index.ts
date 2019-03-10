import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('../../swagger.json');
import myController from './my';
import usersController from './users';
import { authenticate } from '../middleware/authentication';

export default Router()
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use('/users', usersController)
  .use(authenticate)
  .use('/my', myController);

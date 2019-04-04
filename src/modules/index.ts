import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import myController from './my';
import usersController from './users';
import { authenticate } from '../middleware/authentication';
import categoryController from './category';
import salonController from './salon';
import hairTypeController from './hairType';

const swaggerDocument = require('../../swagger.json');

export default Router()
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use('/users', usersController)
  .use('/category', categoryController)
  .use('/salon', salonController)
  .use('/hair-type', hairTypeController)
  .use(authenticate)
  .use('/my', myController);

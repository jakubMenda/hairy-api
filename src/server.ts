import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { express as app } from './di';
import logger from './utils/logger';

const port = process.env.PORT || 8081;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
}, () => {
  app.listen(port, () => {
    logger.info(`App is now running on port ${port}`);
  });
});

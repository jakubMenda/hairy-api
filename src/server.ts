import mongoose from 'mongoose';
import { express as app } from './di';
import logger from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
}, () => {
  app.listen(port, () => {
    logger.info(`App is now running on port ${port}`);
  });
});

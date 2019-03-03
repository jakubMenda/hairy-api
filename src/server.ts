import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import mongodb from 'mongodb';
import logger from './utils/logger';

const ObjectID = mongodb.ObjectID;
const port = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(bodyParser.json());

// TODO
// routes - to be splitted into modules!
app.get('/', (req: Request, res: Response) => {
  res.send({ test: 'Zdárek párek' });
});

// Start the app!!
app.listen(port, () => {
  logger.info(`App is now running on port ${port}`);
});

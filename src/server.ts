import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import mongodb, { Db, MongoClient } from 'mongodb';
import logger from './utils/logger';
import { handleErrors } from './utils/errorHandling';

const port = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(bodyParser.json());

// Set up Mongo
const ObjectID = mongodb.ObjectID;
const localDBUri = 'mongodb://localhost:27017/test';
let db: Db;

mongodb.MongoClient.connect(process.env.MONGODB_URI || localDBUri, (err: Error, client: MongoClient) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  logger.info('Database connection ready');

  // Start the app!!
  app.listen(port, () => {
    logger.info(`App is now running on port ${port}`);
  });
});

// TODO
// routes - to be splitted into modules!
app.get('/test', (req: Request, res: Response) => {
  db.collection('test').find({}).toArray((err: Error, data: any[]) => {
    if (err) {
      handleErrors(res, err.message, 'Test failed', 500);
    } else {
      res.status(200).json(data);
    }
  });
});

app.get('/insert', (req: Request, res: Response) => {
  db.collection('test').insertOne({ name: 'Testovací žblept v databázi' }, (err: Error) => {
    if (err) {
      handleErrors(res, err.message, 'Insert failed', 500);
    } else {
      res.status(204).send();
    }
  });
});

import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import mongodb, { Db, MongoClient } from 'mongodb';
import logger from './utils/logger';
import { handleErrors } from './utils/errorHandling';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = require('../swagger.json');

const port = process.env.PORT || 8080;
const app = express();

// Middleware
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set up Mongo
const localDBUri = 'mongodb://localhost:27017/hairy-api';
const mongoOptions = { useNewUrlParser: true };
let db: Db;

// TODO this should be in another file + solve 'synchronous' calling
mongodb.MongoClient.connect(process.env.MONGODB_URI || localDBUri, mongoOptions, (err: Error, client: MongoClient) => {
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

// FIXME
// routes - to be splitted into modules! Maybe use router
app.get('/test', (req: Request, res: Response) => {
  db.collection('test').find({}).toArray((err: Error, data: any[]) => {
    if (err) {
      handleErrors(res, err.message, 'Test failed', 500);
    } else {
      res.status(200).json(data);
    }
  });
});

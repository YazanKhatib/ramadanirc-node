import 'reflect-metadata';
import 'module-alias/register';
import express, { Application } from 'express';
import dotenv from 'dotenv';
import { logger } from 'utils';
import { userRouter } from 'routes';
import { initializeDB } from 'database';
const app: Application = express();

dotenv.config();

app.use(express.json());
const init = async () => {
  try {
    await initializeDB();
    logger.info('connection to DB established');
  } catch (error) {
    logger.error(error.mesage);
  }
};
init();
app.use('/user', userRouter);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  logger.info(`Listening on port ${port}`);
});

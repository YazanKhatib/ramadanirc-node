import 'reflect-metadata';
import 'module-alias/register';
import express, { Application } from 'express';
import dotenv from 'dotenv';
import { logger } from 'utils';
import { userRouter, taskRouter, prayerRouter } from 'routes';
import { initializeDB } from 'database';
import { quranRouter } from 'routes/quran';

const app: Application = express();

dotenv.config();

const init = async () => {
  try {
    await initializeDB();
    logger.info('Database connection established!');
  } catch (error) {
    logger.error(error.mesage);
  }
};
init();

app.use(express.json());
app.use('/public', express.static('public'));

app.use('/user', userRouter);
app.use('/task', taskRouter);
app.use('/prayer', prayerRouter);
app.use('/quran', quranRouter);

app.listen(process.env.PORT || 4000, async () => {
  logger.info(`🚀 Server ready at ${process.env.PORT}`);
});

import 'reflect-metadata';
import 'module-alias/register';
import cors from 'cors';
import express, { Application } from 'express';
import { initializeDB } from 'database';
import dotenv from 'dotenv';
import { initializeMesseging, logger } from 'utils';
import {
  userRouter,
  taskRouter,
  prayerRouter,
  tidbitRouter,
  duaRouter,
  tokenRouter,
  progressRouter,
  quranRouter,
  deedRouter,
  reflectionRouter,
  messageRouter,
} from 'routes';

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
initializeMesseging();

app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

app.use('/token', tokenRouter);
app.use('/user', userRouter);
app.use('/task', taskRouter);
app.use('/prayer', prayerRouter);
app.use('/quran', quranRouter);
app.use('/tidbit', tidbitRouter);
app.use('/dua', duaRouter);
app.use('/deedoftheday', deedRouter);
app.use('/progress', progressRouter);
app.use('/reflection', reflectionRouter);
app.use('/message', messageRouter);

app.listen(process.env.PORT || 4000, async () => {
  logger.info(`🚀 Server ready at ${process.env.PORT}`);
});

import 'reflect-metadata';
import 'module-alias/register';
import express, { Application } from 'express';
import dotenv from 'dotenv';
import { logger } from 'utils';
import {
  userRouter,
  taskRouter,
  prayerRouter,
  tidbitRouter,
  duaRouter,
} from 'routes';
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
app.use('/tidbit', tidbitRouter);
app.use('/dua', duaRouter);
app.listen(process.env.PORT || 4000, async () => {
  logger.info(`🚀 Server ready at ${process.env.PORT}`);
});

//TODO:route verify token
//TODO: selected instead of rakats
//TODO: user prayers split prayers into FARAD , SUNNAH , TARAWEH , QEIAM , double values(selected,value)
//TODO: change sunnah name to sunnah all .
//TODO: quran tracker limit with success message //https://alquran.cloud/api
//TODO: add icon in daily checklist CRUD
//TODO: daily checklist only not monthly
//TODO: icon selected or not
//TODO: update quran tacker then bool true daily quran
//TODO: daily quran date convert to post

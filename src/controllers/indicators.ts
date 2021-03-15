import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';

export const getIndicators = async (req: Request, res: Response) => {
  try {
    const value: any = await req.query.date;
    const date = new Date(decodeURIComponent(value));
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);

    const prayers = await user
      .$relatedQuery('prayers')
      .whereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.getUTCFullYear()}`)
      .andWhere('selected', true);
    const qurans = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.getUTCFullYear()}`)
      .andWhere('value', true);
    const task = await user
      .$relatedQuery('tasks')
      .whereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.getUTCFullYear()}`)
      .andWhere('value', true);

    const resData = new Map();
    let tempDate;
    for (let i = 0; i < 356; i++) {
      tempDate = new Date();
      tempDate.setDate(date.getDate() - i);
      resData[tempDate.toDateString()] = {
        prayers: {
          fajr: false,
          duhur: false,
          asr: false,
          maghrib: false,
          isha: false,
        },
        task: false,
        quran: false,
      };
    }
    prayers.forEach((prayer: any) => {
      tempDate = new Date(prayer.prayedAt);
      if (prayer.id === 1) resData[tempDate.toDateString()].prayers.fajr = true;
      if (prayer.id === 2)
        resData[tempDate.toDateString()].prayers.duhur = true;
      if (prayer.id === 3) resData[tempDate.toDateString()].prayers.asr = true;
      if (prayer.id === 4)
        resData[tempDate.toDateString()].prayers.maghrib = true;
      if (prayer.id === 5) resData[tempDate.toDateString()].prayers.isha = true;
    });
    qurans.forEach((quran: any) => {
      tempDate = new Date(quran.readAt);
      resData[tempDate.toDateString()].quran = true;
    });
    task.forEach((task: any) => {
      tempDate = new Date(task.createdAt);
      resData[tempDate.toDateString()].task = true;
    });
    return res.send({ data: resData });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ meesage: error.message });
  }
};

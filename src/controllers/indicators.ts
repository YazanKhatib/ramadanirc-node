import { Request, Response } from 'express';
import { Task, User } from 'models';
import { checkToken, logger } from 'utils';
import moment, { Moment } from 'moment';

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
    const allTasks = (await Task.query()).length;

    const resData = new Map();
    let tempDate: Moment;
    for (let i = 0; i < 356; i++) {
      tempDate = moment();
      tempDate.subtract(i, 'days');
      const partial = (
        await user
          .$relatedQuery('tasks')
          .whereRaw(` "createdAt"::Date = '${tempDate.format('YYYY MM DD')}'`)
          .andWhere('value', true)
      ).length;
      resData[tempDate.format('YYYY-MM-DD')] = {
        prayers: {
          fajr: false,
          duhur: false,
          asr: false,
          maghrib: false,
          isha: false,
        },
        task: (partial * 50) / allTasks,
        quran: false,
      };
    }
    prayers.forEach((prayer: any) => {
      tempDate = moment(prayer.prayedAt);
      if (prayer.id === 1)
        resData[tempDate.format('YYYY-MM-DD')].prayers.fajr = true;
      if (prayer.id === 2)
        resData[tempDate.format('YYYY-MM-DD')].prayers.duhur = true;
      if (prayer.id === 3)
        resData[tempDate.format('YYYY-MM-DD')].prayers.asr = true;
      if (prayer.id === 4)
        resData[tempDate.format('YYYY-MM-DD')].prayers.maghrib = true;
      if (prayer.id === 5)
        resData[tempDate.format('YYYY-MM-DD')].prayers.isha = true;
    });
    qurans.forEach((quran: any) => {
      tempDate = moment(quran.readAt);
      resData[tempDate.format('YYYY-MM-DD')].quran = true;
    });
    return res.send({ data: resData });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ meesage: error.message });
  }
};

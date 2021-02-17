import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';

export const getTracker = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const tracker = await user.$relatedQuery('quranTracker');
    if (!tracker) await user.$relatedQuery('quranTracker').insert({});
    res.send({ tracker: await user.$relatedQuery('quranTracker') });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const updateTracker = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { juz, surah, ayah } = req.body;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const tracker = await user.$relatedQuery('quranTracker');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any = {
      juz: juz,
      surah: surah,
      ayah: ayah,
    };
    if (tracker) await user.$relatedQuery('quranTracker').patch(input);
    else await user.$relatedQuery('quranTracker').insert(input);
    return res.send({ success: 'quran tracker has been updated' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const checkDailyQuran = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = new Date(Date.now());
    const dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`EXTRACT(DAY FROM "readAt") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "readAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.getUTCFullYear()}`);
    if (dailyQuran.length === 0) {
      const input: any = {
        value: true,
        readAt: date.toISOString(),
      };
      await user.$relatedQuery('dailyQuran').insert(input);
    }
    res.send({ success: 'Daily Quran is checked.' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const getDailyQuran = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = new Date(Date.now());
    const dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`EXTRACT(DAY FROM "readAt") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "readAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.getUTCFullYear()}`);
    return res.send({ dailyQuran: dailyQuran });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

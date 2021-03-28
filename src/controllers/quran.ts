import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

const getValues = async (oldValues, newValues) => {
  let juz, surah, ayah;
  if (oldValues.juz != newValues.juz) {
    const limit = await getMinLimit(newValues.juz, newValues.surah);
    return { juz: newValues.juz, surah: limit.surah, ayah: limit.ayah };
  }
  if (oldValues.surah != newValues.surah) {
    juz = oldValues.juz;
    surah = newValues.surah;
    ayah = 1;
    return { juz: juz, surah: surah, ayah: ayah };
  }
  return newValues;
};
const getMaxLimit = async (juz: number, surah: number) => {
  const metadata = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '..', '..', '/data/quranMetadata.json'),
      'utf-8',
    ),
  );
  const juzLimit = 30;
  const surahLimit = juz !== 30 ? metadata.juzs.references[juz].surah : 114;
  let ayahLimit;
  if (juz === 30) ayahLimit = metadata.surahs.references[surah].numberOfAyahs;
  else if (surah === surahLimit) ayahLimit = metadata.juzs.references[juz].ayah;
  else ayahLimit = metadata.surahs.references[surah].numberOfAyahs;
  return { juz: juzLimit, surah: surahLimit, ayah: ayahLimit };
};
const getMinLimit = async (juz: number, surah: number) => {
  const metadata = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '..', '..', '/data/quranMetadata.json'),
      'utf-8',
    ),
  );
  const juzLimit = 1;
  const surahLimit = metadata.juzs.references[juz - 1].surah;
  let ayahLimit;
  if (surah == surahLimit) ayahLimit = metadata.juzs.references[juz - 1].ayah;
  else ayahLimit = 1;
  //const ayahLimit = Math.max(1, metadata.juzs.references[juz - 1].ayah);
  return { juz: juzLimit, surah: surahLimit, ayah: ayahLimit };
};
const checkDailyQuran = async (req: Request) => {
  try {
    const { date } = req.body;
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const today = moment(date);
    const dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`"readAt"::Date = '${today.format('YYYY MM DD')}'`)
      .first();
    let input: any;
    if (!dailyQuran) {
      input = {
        value: true,
        readAt: today.toISOString(),
      };
      await user.$relatedQuery('dailyQuran').insert(input);
    } else {
      input = {
        value: true,
      };
      await user.$relatedQuery('dailyQuran').patch(input);
    }
  } catch (error) {
    logger.error(error.message);
  }
};
export const getTracker = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    let tracker: any = await user.$relatedQuery('quranTracker');
    if (!tracker)
      tracker = await user.$relatedQuery('quranTracker').insertAndFetch({});

    const maxLimit = await getMaxLimit(tracker.juz, tracker.surah);
    const minLimit = await getMinLimit(tracker.juz, tracker.surah);
    res.send({
      tracker: await user.$relatedQuery('quranTracker'),
      minLimit: minLimit,
      maxLimit: maxLimit,
    });
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
    const tracker: any = await user.$relatedQuery('quranTracker');

    const values = await getValues(
      { juz: tracker.juz, surah: tracker.surah, ayah: tracker.ayah },
      { juz: juz, surah: surah, ayah: ayah },
    );
    const maxLimit = await getMaxLimit(tracker.juz, tracker.surah);
    const minLimit = await getMinLimit(tracker.juz, tracker.surah);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any = values;
    if (tracker) await user.$relatedQuery('quranTracker').patch(input);
    else await user.$relatedQuery('quranTracker').insert(input);
    return res.send({
      success: 'quran tracker has been updated',
      tracker: input,
      minLimit: minLimit,
      maxLimit: maxLimit,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const getDailyQuran = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { value } = req.body;
    if (!value || value === '')
      res.status(400).send({ message: 'date required' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = moment(value);
    let dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`"readAt"::Date = '${date.format('YYYY MM DD')}'`)
      .first();
    if (!dailyQuran) {
      const input: any = {
        value: false,
        readAt: date.toISOString(),
      };
      dailyQuran = await user.$relatedQuery('dailyQuran').insertAndFetch(input);
    }
    return res.send({ dailyQuran: dailyQuran });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const setTimeRead = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { value, date } = req.body;
    if (!value || value === '')
      return res.status(400).send({ message: 'value is required' });
    await checkDailyQuran(req);
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const today = moment(date);
    const input: any = { readTime: value };
    await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`"readAt"::Date = '${today.format('YYYY MM DD')}'`)
      .patch(input);
    const dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`"readAt"::Date = '${today.format('YYYY MM DD')}'`)
      .first();
    return res.send({
      success: 'readTime has been updated',
      dailyQuran: dailyQuran,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

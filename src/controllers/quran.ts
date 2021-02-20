import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';
import fs from 'fs';
import path from 'path';

const getValues = async (oldValues, newValues) => {
  let juz, surah, ayah;
  if (oldValues.juz != newValues.juz) {
    const limit = await getMinLimit(newValues.juz, newValues.surah);
    return { juz: newValues.juz, surah: limit.surah, ayah: limit.ayah };
  }
  if (oldValues.surah != newValues) {
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
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = new Date(Date.now());
    const dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`EXTRACT(DAY FROM "readAt") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "readAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.getUTCFullYear()}`)
      .first();
    let input: any;
    if (!dailyQuran) {
      input = {
        value: true,
        readAt: date.toISOString(),
      };
      await user.$relatedQuery('dailyQuran').insert(input);
    } else {
      input = {
        value: true,
      };
      await user.$relatedQuery('dailyQuran').patch(input);
    }
  } catch (error) {
    logger.error(error);
  }
};
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
    const tracker: any = await user.$relatedQuery('quranTracker');
    if (
      juz > tracker.juz ||
      (juz === tracker.juz && surah > tracker.surah) ||
      (juz === tracker.juz && surah === tracker.surah && ayah > tracker.ayah)
    )
      await checkDailyQuran(req);
    const values = await getValues(
      { juz: tracker.juz, surah: tracker.surah, ayah: tracker.ayah },
      { juz: juz, surah: surah, ayah: ayah },
    );
    const maxLimit = await getMaxLimit(juz, surah);
    const minLimit = await getMinLimit(juz, surah);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any = values;
    if (tracker) await user.$relatedQuery('quranTracker').patch(input);
    else await user.$relatedQuery('quranTracker').insert(input);
    return res.send({
      success: 'quran tracker has been updated',
      values: input,
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
    const date = new Date(value);
    let dailyQuran = await user
      .$relatedQuery('dailyQuran')
      .whereRaw(`EXTRACT(DAY FROM "readAt") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "readAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.getUTCFullYear()}`)
      .first();
    if (!dailyQuran) {
      const input: any = {
        value: false,
      };
      dailyQuran = await user.$relatedQuery('dailyQuran').insertAndFetch(input);
    }
    return res.send({ dailyQuran: dailyQuran });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

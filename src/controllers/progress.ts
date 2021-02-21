import { Request, Response } from 'express';
import { Tidbit, User } from 'models';
import { checkToken, logger } from 'utils';

export const getMonthlyProgress = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = new Date(Date.now());
    const sunnah: any = await user
      .$relatedQuery('prayers')
      .where('type', 'SUNNAH')
      .andWhere('selected', true)
      .whereRaw(`EXTRACT(MONTH FROM "prayedAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.getUTCFullYear()}`)
      .count()
      .first();
    const nafls: any = await user
      .$relatedQuery('prayers')
      .where('type', 'TARAWEEH')
      .orWhere('type', 'QIYAM')
      .sum('value')
      .first();
    const deeds: any = await user
      .$relatedQuery('tasks')
      .where('value', true)
      .whereRaw(`EXTRACT(MONTH FROM "createdAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.getUTCFullYear()}`)
      .count()
      .first();
    const readTime: any = await user.$relatedQuery('quranTracker');
    logger.info(readTime);
    return res.send({
      'SUNNAHS PRAYED': sunnah.count,
      'GOOD DEEDS ACCOMPLISHED THIS MONTH': deeds.count,
      'NAFLS PRAYED': nafls.sum ?? '0',
      'TOTAL MINUTES OF QURAN READ': `${readTime.readTime}` ?? '0',
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

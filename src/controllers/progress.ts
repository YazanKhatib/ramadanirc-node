import { Request, Response } from 'express';
import { User } from 'models';
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
      .where('type', ['TARAWEEH', 'QIYAM'])
      .andWhereRaw(
        `EXTRACT(MONTH FROM "createdAt") = ${date.getUTCMonth() + 1}`,
      )
      .andWhereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.getUTCFullYear()}`)
      .sum('value')
      .first();
    const deeds: any = await user
      .$relatedQuery('tasks')
      .where('value', true)
      .whereRaw(`EXTRACT(MONTH FROM "createdAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.getUTCFullYear()}`)
      .count()
      .first();
    const readTime: any = await user
      .$relatedQuery('dailyQuran')
      .sum('readTime')
      .whereRaw(`EXTRACT(MONTH FROM "readAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.getUTCFullYear()}`);
    //const readTime: any = await user.$relatedQuery('quranTracker');
    return res.send({
      sunnahs: sunnah.count,
      deedsAccomplished: deeds.count,
      nafls: nafls.sum ?? '0',
      quranTime: readTime ? `${readTime[0].sum}` : '0',
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';
import moment from 'moment';

export const getMonthlyProgress = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = moment.utc();
    const sunnah: any = await user
      .$relatedQuery('prayers')
      .where('type', 'SUNNAH')
      .andWhere('selected', true)
      .whereRaw(`EXTRACT(MONTH FROM "prayedAt") = ${date.month() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.year()}`)
      .count()
      .first();
    const nafls: any = await user
      .$relatedQuery('prayers')
      .whereBetween('prayerId', [11, 12])
      .andWhereRaw(`EXTRACT(MONTH FROM "prayedAt") = ${date.month() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.year()}`)
      .sum('value')
      .first();
    const deeds: any = await user
      .$relatedQuery('tasks')
      .where('value', true)
      .whereRaw(`EXTRACT(MONTH FROM "createdAt") = ${date.month() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.year()}`)
      .count()
      .first();
    const readTime: any = await user
      .$relatedQuery('dailyQuran')
      .sum('readTime')
      .whereRaw(`EXTRACT(MONTH FROM "readAt") = ${date.month() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "readAt") = ${date.year()}`);
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

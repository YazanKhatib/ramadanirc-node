import { Request, Response, NextFunction } from 'express';
import { checkToken, logger, sendMessage } from 'utils';
import { Prayer, User } from 'models';
import { ForeignKeyViolationError } from 'objection';
import moment from 'moment';
export const fillPrayer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.header('accessToken');
  const data = await checkToken(accessToken);
  const user = await User.query().findById(data.id);
  const { value } = req.body;
  const date = new Date(value);
  const prayers = await user
    .$relatedQuery('prayers')
    .whereRaw(`EXTRACT(DAY FROM "prayedAt") = ${date.getUTCDate()}`)
    .andWhereRaw(`EXTRACT(MONTH FROM "prayedAt") = ${date.getUTCMonth() + 1}`)
    .andWhereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.getUTCFullYear()}`);
  const allPrayers = await Prayer.query();
  if (prayers.length !== allPrayers.length) {
    await Promise.all(
      allPrayers.map(async (prayer: Prayer) => {
        const tempPrayer = await user
          .$relatedQuery('prayers')
          .findById(prayer.id)
          .whereRaw(`EXTRACT(DAY FROM "prayedAt") = ${date.getUTCDate()}`)
          .andWhereRaw(
            `EXTRACT(MONTH FROM "prayedAt") = ${date.getUTCMonth() + 1}`,
          )
          .andWhereRaw(
            `EXTRACT(YEAR FROM "prayedAt") = ${date.getUTCFullYear()}`,
          );
        if (!tempPrayer) {
          const input: any = {
            id: prayer.id,
            prayedAt: date.toISOString(),
          };
          await user.$relatedQuery('prayers').relate(input);
        }
      }),
    );
  }
  next();
};
export const userPrayers = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { value } = req.body;

    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = new Date(value);
    const prayers = await user
      .$relatedQuery('prayers')
      .whereRaw(`EXTRACT(DAY FROM "prayedAt") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "prayedAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.getUTCFullYear()}`)
      .orderBy('id');
    const fared = prayers.filter((value: Prayer) => value.type === 'FARD');
    const sunnah = prayers.filter((value: Prayer) => value.type === 'SUNNAH');
    const taraweeh = prayers.filter(
      (value: Prayer) => value.type === 'TARAWEEH',
    );
    const qiyam = prayers.filter((value: Prayer) => value.type === 'QIYAM');
    return res.send({
      fared: fared,
      sunnah: sunnah,
      taraweeh: taraweeh[0],
      qiyam: qiyam[0],
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: 'invalid date format' });
  }
};
export const checkPrayer = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { id, selected, value } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'id is required' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    let prayer = await user
      .$relatedQuery('prayers')
      .findById(id)
      .whereRaw(
        `EXTRACT(DAY FROM "prayedAt") = ${new Date(Date.now()).getUTCDate()}`,
      )
      .andWhereRaw(
        `EXTRACT(MONTH FROM "prayedAt") = ${
          new Date(Date.now()).getUTCMonth() + 1
        }`,
      )
      .andWhereRaw(
        `EXTRACT(YEAR FROM "prayedAt") = ${new Date(
          Date.now(),
        ).getUTCFullYear()}`,
      );
    if (!prayer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = {
        id: id,
        value: value ?? +(selected === true),
        selected: selected ?? value > 0,
        prayedAt: new Date(Date.now()).toISOString(),
      };
      await user.$relatedQuery('prayers').relate(input);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = {
        value: value ?? +(selected === true),
        selected: selected ?? value > 0,
      };
      await user.$relatedQuery('prayers').findById(id).patch(input);
    }
    prayer = await user
      .$relatedQuery('prayers')
      .findById(id)
      .whereRaw(
        `EXTRACT(DAY FROM "prayedAt") = ${new Date(Date.now()).getUTCDate()}`,
      )
      .andWhereRaw(
        `EXTRACT(MONTH FROM "prayedAt") = ${
          new Date(Date.now()).getUTCMonth() + 1
        }`,
      )
      .andWhereRaw(
        `EXTRACT(YEAR FROM "prayedAt") = ${new Date(
          Date.now(),
        ).getUTCFullYear()}`,
      );
    const today = moment();
    if (user.notify === true) {
      const PrayerNum: any = await user
        .$relatedQuery('prayers')
        .andWhereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`)
        .andWhere('prayerId', '<=', '5')
        .count()
        .first();
      const notified = await user
        .$relatedQuery('notified')
        .whereRaw(`"date"::Date = '${today.format('YYYY MM DD')}'`);
      if (PrayerNum.count === '5' && notified.length === 0) {
        //TODO: message title and body
        await sendMessage(
          user.registrationToken,
          '5 prayers streak',
          '5 prayers body',
        );
        const input: any = {
          isNotified: true,
          date: new Date(Date.now()).toISOString(),
        };
        await user.$relatedQuery('notified').insert(input);
      }
    }
    res.send({ success: 'prayer had been updated', prayer: prayer });
  } catch (error) {
    logger.error(error);
    if (error instanceof ForeignKeyViolationError)
      return res.status(400).send({ message: "prayer id doesn't exist" });
    return res.status(400).send({ message: error.message });
  }
};

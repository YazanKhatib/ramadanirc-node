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
  const today = moment.utc(value);

  const prayers = await user
    .$relatedQuery('prayers')
    .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`);
  const allPrayers = await Prayer.query();
  if (prayers.length !== allPrayers.length) {
    await Promise.all(
      allPrayers.map(async (prayer: Prayer) => {
        const tempPrayer = await user
          .$relatedQuery('prayers')
          .findById(prayer.id)
          .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`);
        if (!tempPrayer) {
          const input: any = {
            id: prayer.id,
            prayedAt: today.toISOString(),
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
    const today = moment.utc(value);

    //fill prayers
    const userPrayers = await user
      .$relatedQuery('prayers')
      .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`);
    const allPrayers = await Prayer.query();
    if (userPrayers.length !== allPrayers.length) {
      await Promise.all(
        allPrayers.map(async (prayer) => {
          const tempPrayer = await user
            .$relatedQuery('prayers')
            .findById(prayer.id)
            .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`);
          if (!tempPrayer) {
            const input: any = {
              id: prayer.id,
              prayedAt: today.toISOString(),
            };
            await user.$relatedQuery('prayers').relate(input);
          }
        }),
      );
    }
    const prayers = await user
      .$relatedQuery('prayers')
      .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`)
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
    const { id, selected, value, date } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'id is required' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const today = moment.utc(date);
    let prayer = await user
      .$relatedQuery('prayers')
      .findById(id)
      .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`);
    if (!prayer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = {
        id: id,
        value: value ?? +(selected === true),
        selected: selected ?? value > 0,
        prayedAt: today.toISOString(),
      };
      await user.$relatedQuery('prayers').relate(input);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any

      const val = value ?? +(selected === true);
      const sel = selected ?? value > 0;
      const knex = User.knex();
      await knex.raw(
        `update users_prayers SET selected = ${sel},value=${val} where "prayedAt"::Date ='${today.format(
          'YYYY MM DD',
        )}' and "prayerId" = ${id} and "userId" = ${user.id}`,
      );
    }
    prayer = await user
      .$relatedQuery('prayers')
      .findById(id)
      .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`);
    //5 streak notification
    if (user.notify === true) {
      const PrayerNum: any = await user
        .$relatedQuery('prayers')
        .whereRaw(`"prayedAt"::Date = '${today.format('YYYY MM DD')}'`)
        .andWhere('type', 'FARD')
        .andWhere('selected', true)
        .count()
        .first();
      const notified = await user
        .$relatedQuery('notified')
        .whereRaw(`"date"::Date = '${today.format('YYYY MM DD')}'`);
      if (PrayerNum.count === '5' && notified.length === 0) {
        let body, title;
        if (user.language == 'English') {
          body =
            '🤩 5/5 prayers today, aren’t you amazing! Let’s see if we can do it again tomorrow inshaAllah!';
          title = 'Well Done 👍';
        } else {
          body =
            "🤩 5/5 prières aujourd'hui,vous êtes génial! Voyons voir si nous pouvons le refaire demain inshaAllah!";
          title = 'bien fait 👍';
        }
        await sendMessage(user.registrationToken, title, body);
        const input: any = {
          isNotified: true,
          date: today.toISOString(),
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

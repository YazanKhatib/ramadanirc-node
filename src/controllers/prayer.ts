import { Request, Response } from 'express';
import { checkToken, logger } from 'utils';
import { Prayer, User } from 'models';
import { ForeignKeyViolationError } from 'objection';

export const getPrayers = async (req: Request, res: Response) => {
  try {
    const prayers = await Prayer.query();
    return res.send({ prayers: prayers });
  } catch (error) {
    logger.error(error);
    return res.send({ message: error.message });
  }
};
export const userPrayers = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { value } = req.body;

    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = new Date(value);
    logger.info(date.getUTCDate());
    const prayers = await user
      .$relatedQuery('prayers')
      .whereRaw(`EXTRACT(DAY FROM "prayedAt") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "prayedAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "prayedAt") = ${date.getUTCFullYear()}`);
    return res.send({ prayers: prayers });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: 'invalid date format' });
  }
};
export const checkPrayer = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { id, rakats } = req.body;
    if (!id || id === '' || !rakats || rakats === '')
      return res.status(400).send({ message: 'id and rakats are required' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const prayer = await user
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
        rakats: rakats,
        prayedAt: new Date(Date.now()).toISOString(),
      };
      await user.$relatedQuery('prayers').relate(input);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = {
        rakats: rakats,
      };
      await user.$relatedQuery('prayers').findById(id).patch(input);
    }
    res.send({ success: 'prayer had been updated' });
  } catch (error) {
    logger.error(error);
    if (error instanceof ForeignKeyViolationError)
      return res.status(400).send({ message: "prayer id doesn't exist" });
    return res.status(400).send({ message: error.message });
  }
};

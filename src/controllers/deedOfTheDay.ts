import { Request, Response } from 'express';
import { Tidbit, User } from 'models';
import { checkToken, logger, SQLWhereClause } from 'utils';
import moment from 'moment';
export const getDeedOfTheDay = async (req: Request, res: Response) => {
  try {
    const date: any = req.query.date;
    const value = moment(decodeURIComponent(date)).utcOffset(
      decodeURIComponent(date),
    );
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const tidbit = await Tidbit.query()
      .whereRaw(
        SQLWhereClause(
          'deedOfTheDayDate',
          user.timezone,
          value.format('YYYY MM DD'),
        ),
      )
      .first();
    if (!tidbit) return res.send({ deedOfTheDay: 'No deed for the day' });
    return res.send({ deedOfTheDay: tidbit });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const setDeedOfTheDay = async (req: Request, res: Response) => {
  try {
    const { id, value } = req.body;
    if (!id || !value || id === '' || value === '')
      return res.status(400).send({ message: 'Id and date are required' });
    const deedoftheday = await Tidbit.query().patchAndFetchById(id, {
      deedOfTheDayDate: value,
    });
    return res.send({
      message: `Tidbit has been set as deed for the day ${value}`,
      deedoftheday: deedoftheday,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

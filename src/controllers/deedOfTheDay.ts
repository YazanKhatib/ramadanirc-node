import { Request, Response } from 'express';
import { Tidbit } from 'models';
import { logger } from 'utils';

export const getDeedOfTheDay = async (req: Request, res: Response) => {
  try {
    const value = new Date(Date.now());
    const tidbit = await Tidbit.query()
      .whereRaw(`EXTRACT(DAY FROM "deedOfTheDayDate") = ${value.getUTCDate()}`)
      .andWhereRaw(
        `EXTRACT(MONTH FROM "deedOfTheDayDate") = ${value.getUTCMonth() + 1}`,
      )
      .andWhereRaw(
        `EXTRACT(YEAR FROM "deedOfTheDayDate") = ${value.getUTCFullYear()}`,
      )
      .first();
    if (!tidbit) return res.send({ text: 'no deed for the day' });
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
      return res.status(400).send({ message: 'id and date are required' });
    const deedoftheday = await Tidbit.query().patchAndFetchById(id, {
      deedOfTheDayDate: value,
    });
    return res.send({
      message: `tidbit has been set as deed for the day ${value}`,
      deedoftheday: deedoftheday,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

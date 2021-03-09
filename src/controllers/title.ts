import { Request, Response } from 'express';
import { Title } from 'models/title';
import { logger } from 'utils';

export const getTitle = async (req: Request, res: Response) => {
  try {
    const value: any = req.query.date;
    const date = new Date(value);
    const title = await Title.query()
      .whereRaw(`EXTRACT(DAY FROM "date") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "date") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "date") = ${date.getUTCFullYear()}`)
      .first();
    return res.send({ title: title });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const updateTitle = async (req: Request, res: Response) => {
  try {
    const { id, textEnglish, textFrench, date } = req.body;
    const title = await Title.query().patchAndFetchById(id, {
      textEnglish,
      textFrench,
      date,
    });
    return res.send({ success: 'title has been updaetd', title: title });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const addTitle = async (req: Request, res: Response) => {
  try {
    const { textEnglish, textFrench, date } = req.body;
    const title = await Title.query().insertAndFetch({
      textEnglish,
      textFrench,
      date,
    });
    return res.send({ success: 'title has been added', title: title });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const removeTitle = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const title = await Title.query().findById(id);
    await Title.query().deleteById(id);
    return res.send({ success: 'title has been deleted.', title: title });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

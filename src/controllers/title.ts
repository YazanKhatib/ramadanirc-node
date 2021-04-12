import { Request, Response } from 'express';
import { Title } from 'models/title';
import { checkToken, logger } from 'utils';
import moment from 'moment';
import { SQLWhereClause } from 'utils';
import { User } from 'models';
export const getTitle = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const value: any = req.query.date;
    const date = moment(decodeURIComponent(value)).utcOffset(
      decodeURIComponent(value),
    );
    const title = await Title.query()
      .whereRaw(
        SQLWhereClause('date', user.timezone, date.format('YYYY MM DD')),
      )
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
    return res.send({ success: 'Title has been updaetd', title: title });
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
    return res.send({ success: 'Title has been added', title: title });
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
    return res.send({ success: 'Title has been deleted.', title: title });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

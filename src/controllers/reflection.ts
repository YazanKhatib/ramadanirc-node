import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';
import moment from 'moment';
import { Title } from 'models/title';

export const getReflections = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    let reflections;
    if (!id) reflections = await user.$relatedQuery('reflections');
    else reflections = await user.$relatedQuery('reflections').findById(id);
    if (reflections && reflections.length === 0)
      return res.send({ success: 'no reflections yet.' });
    const date = new Date(Date.now());
    const title = await Title.query()
      .whereRaw(`EXTRACT(DAY FROM "date") = ${date.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "date") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "date") = ${date.getUTCFullYear()}`)
      .first();
    return res.send({ reflections: reflections, title: title });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const addReflection = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { text } = req.body;
    if (!text || text === '')
      return res.status(400).send({ message: 'title and text are required.' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const preview = text.length <= 30 ? text : text.substring(0, 30) + '...';
    const date = moment().format('MMMM DD YYYY');

    const input: any = {
      preview,
      text,
      date,
    };
    const reflection = await user
      .$relatedQuery('reflections')
      .insertAndFetch(input);
    const tempDate = new Date(Date.now());
    const reflectionTitle = await Title.query()
      .whereRaw(`EXTRACT(DAY FROM "date") = ${tempDate.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "date") = ${tempDate.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "date") = ${tempDate.getUTCFullYear()}`)
      .first();
    return res.send({
      success: 'reflection has been added',
      reflection: reflection,
      title: reflectionTitle,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const updateReflection = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { id, text, date } = req.body;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const preview = text.length <= 30 ? text : text.substring(0, 30) + '...';
    const input: any = {
      preview,
      text,
      date,
    };
    const reflection = await user
      .$relatedQuery('reflections')
      .patchAndFetchById(id, input);
    const tempDate = new Date(Date.now());
    const reflectionTitle = await Title.query()
      .whereRaw(`EXTRACT(DAY FROM "date") = ${tempDate.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "date") = ${tempDate.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "date") = ${tempDate.getUTCFullYear()}`)
      .first();
    return res.send({
      success: 'reflection has been updated',
      reflection: reflection,
      title: reflectionTitle,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const deleteReflection = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const id = req.params.id;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const reflection = await user.$relatedQuery('reflections').findById(id);
    await user.$relatedQuery('reflections').deleteById(id);
    const tempDate = new Date(Date.now());
    const reflectionTitle = await Title.query()
      .whereRaw(`EXTRACT(DAY FROM "date") = ${tempDate.getUTCDate()}`)
      .andWhereRaw(`EXTRACT(MONTH FROM "date") = ${tempDate.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "date") = ${tempDate.getUTCFullYear()}`)
      .first();
    return res.send({
      success: 'reflection has been deleted',
      reflection: reflection,
      title: reflectionTitle,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';
import moment from 'moment';
import { Title } from 'models';

export const getReflections = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    let reflections: any;
    const language = user.language === 'English' ? 'en' : 'fr';
    if (!id) reflections = await user.$relatedQuery('reflections');
    else reflections = await user.$relatedQuery('reflections').findById(id);
    if (reflections && reflections.length === 0)
      return res.send({ success: 'no reflections yet.' });
    const date = moment();
    const title = await Title.query()
      .whereRaw(`"date"::Date = '${date.format('YYYY MM DD')}'`)
      .first();
    if (reflections.length)
      await Promise.all(
        reflections.map(async (reflection) => {
          reflection.date = moment(reflection.date)
            .locale(language)
            .format('MMMM DD ,YYYY');
        }),
      );

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
    const date = moment().format('MMMM DD ,YYYY');
    const input: any = {
      preview,
      text,
      date,
    };
    const reflection = await user
      .$relatedQuery('reflections')
      .insertAndFetch(input);
    const tempDate = moment();
    const reflectionTitle = await Title.query()
      .whereRaw(`"date"::Date = '${tempDate.format('YYYY MM DD')}'`)
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
    const tempDate = moment();
    const reflectionTitle = await Title.query()
      .whereRaw(`"date"::Date = '${tempDate.format('YYYY MM DD')}'`)
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
    const tempDate = moment();
    const reflectionTitle = await Title.query()
      .whereRaw(`"date"::Date = '${tempDate.format('YYYY MM DD')}'`)
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

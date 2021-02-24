import { Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';
import moment from 'moment';

export const getReflections = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const reflections = await user.$relatedQuery('reflections');
    if (reflections.length === 0)
      return res.send({ success: 'no reflections yet.' });
    return res.send({ reflections: reflections });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const addReflection = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { title, text } = req.body;
    if (!text || text === '' || !title || title === '')
      return res.status(400).send({ message: 'title and text are required.' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const preview = text.length <= 30 ? text : text.substring(0, 30) + '...';
    const date = moment().format('MMMM DD YYYY');

    const input: any = {
      preview,
      title,
      text,
      date,
    };
    await user.$relatedQuery('reflections').insert(input);
    return res.send({ success: 'reflection has been added' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

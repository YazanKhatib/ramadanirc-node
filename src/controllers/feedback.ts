import { Request, Response } from 'express';
import { User } from 'models';
import { Feedback } from 'models/feedback';
import moment from 'moment';
import { checkToken, logger } from 'utils';

export const addFeedback = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const username = user.username;
    const email = user.email;
    const { body, value, version } = req.body;
    const date = moment(value).utcOffset(value).toISOString();
    const feedback = await Feedback.query().insertAndFetch({
      username,
      body,
      date,
      version,
      email,
    });
    return res
      .status(201)
      .send({ success: 'Thank you for your feedback ', feedback: feedback });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.query();
    return res.send({ feedbacks: feedbacks });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

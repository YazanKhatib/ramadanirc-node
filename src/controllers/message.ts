import { Request, Response } from 'express';
import { User } from 'models';
import { logger } from 'utils';
import { sendMessage } from 'utils';

export const sendAll = async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;
    if (!title || title === '' || !body || body === '')
      return res.status(400).send({ message: 'title and body are required' });
    const users = await User.query().where('notify', true);
    await Promise.all(
      users.map(async (user) => {
        await sendMessage(user.registrationToken, title, body);
      }),
    );
    return res.send({ success: 'messages had been sent' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

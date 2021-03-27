import { Request, Response } from 'express';
import { Notification, User } from 'models';
import { logger, sendMessage } from 'utils';

export const sendAll = async (req: Request, res: Response) => {
  try {
    const { titleEnglish, titleFrench, bodyEnglish, bodyFrench } = req.body;
    if (
      titleEnglish === '' ||
      titleFrench === '' ||
      bodyEnglish === '' ||
      bodyFrench === ''
    )
      return res.status(400).send({ message: 'title and body are required' });
    const users = await User.query().where('notify', true);
    await Promise.all(
      users.map(async (user) => {
        let title, body;
        if (user.language === 'English') {
          title = titleEnglish;
          body = bodyEnglish;
        } else {
          title = titleFrench;
          body = bodyFrench;
        }
        await sendMessage(user.registrationToken, title, body);
      }),
    );
    return res.send({ success: 'messages had been sent' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.query().orderBy('id');
    return res.send({ notifications: notifications });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

export const addNotificaiton = async (req: Request, res: Response) => {
  try {
    const {
      titleEnglish,
      titleFrench,
      bodyEnglish,
      bodyFrench,
      date,
    } = req.body;
    const notification = await Notification.query().insertAndFetch({
      titleEnglish,
      titleFrench,
      bodyEnglish,
      bodyFrench,
      date,
    });
    return res.send({
      success: 'notification has been added',
      notification: notification,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const updateNotification = async (req: Request, res: Response) => {
  try {
    const {
      id,
      titleEnglish,
      titleFrench,
      bodyEnglish,
      bodyFrench,
      date,
    } = req.body;
    const notification = await Notification.query().updateAndFetchById(id, {
      titleEnglish,
      titleFrench,
      bodyEnglish,
      bodyFrench,
      date,
    });
    return res.send({
      success: 'notification has been updated',
      notification: notification,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const removeNotification = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const notification = await Notification.query().findById(id);
    await Notification.query().deleteById(id);
    return res.send({
      success: 'notification has been deleted.',
      notification: notification,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

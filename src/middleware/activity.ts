import { NextFunction, Request, Response } from 'express';
import { User } from 'models';
import { checkToken, logger } from 'utils';

export const updateActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const activity = await user.$relatedQuery('activity');
    if (!activity) {
      const input: any = {
        lastActivity: new Date(Date.now()).toISOString(),
        quranActivity: new Date(Date.now()).toISOString(),
      };
      logger.info(input);
      await user.$relatedQuery('activity').insert(input);
    } else {
      const input: any = {
        lastActivity: new Date(Date.now()).toISOString(),
      };
      await user.$relatedQuery('activity').patch(input);
    }
    next();
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

export const quranActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const activity = await user.$relatedQuery('activity');

    if (!activity) {
      const input: any = {
        lastActivity: new Date(Date.now()).toISOString(),
        quranActivity: new Date(Date.now()).toISOString(),
      };
      await user.$relatedQuery('activity').relate(input);
    } else {
      const input: any = {
        lastActivity: new Date(Date.now()).toISOString(),
        quranActivity: new Date(Date.now()).toISOString(),
      };
      await user.$relatedQuery('activity').patch(input);
    }
    next();
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

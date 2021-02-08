import { User } from 'models';
import { logger, generateAccessToken, tokenIsExpired } from 'utils';
import { Request, Response, NextFunction, response } from 'express';

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.header('accessToken');
    const refreshToken = req.header('refreshToken');

    if (
      accessToken &&
      accessToken != '' &&
      !(await tokenIsExpired(accessToken))
    ) {
      return next();
    }
    if (!refreshToken || refreshToken === '')
      return res.status(400).send({ message: 'refresh Token needed' });

    const user = await User.query().findOne('refreshToken', refreshToken);

    if (!user)
      return res.status(400).send({ message: 'user must login first.' });

    const expired = +user.expirationDate < Date.now();

    if (expired)
      return res.status(400).send({ message: 'user must login first.' });

    const newAccessToken = await generateAccessToken({ id: user.id });
    res.send({
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

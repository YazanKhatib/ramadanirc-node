import { User } from 'models';
import { logger, generateAccessToken, tokenIsExpired, checkToken } from 'utils';
import { Request, Response, NextFunction } from 'express';

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
      return res.status(403).send({ message: 'refresh Token needed' });

    const user = await User.query().findOne('refreshToken', refreshToken);

    if (!user)
      return res.status(403).send({ message: 'user must login first.' });

    const expired = new Date(user.expirationDate).getTime() < Date.now();

    if (expired)
      return res.status(401).send({ message: 'user must login first.' });

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
export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const isAdmin = (await User.query().findById(data.id)).admin;
    if (isAdmin) return next();
    else return res.status(403).send({ message: 'not authorized.' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

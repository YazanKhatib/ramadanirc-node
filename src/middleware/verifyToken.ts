import jwt from 'jsonwebtoken';
import { logger } from 'utils';
import { Request, Response, NextFunction } from 'express';

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header('authorization');

  if (!token) return res.status(401).send('Access Denied');

  try {
    const data = jwt.verify(token, 'SECRET');
    (req as any).headers.data = data;
    next();
  } catch (error) {
    logger.error(error.message);
    res.status(401).send('Invalid Token');
  }
};

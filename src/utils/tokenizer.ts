import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
const secret = 'MY_TOKEN_SECRET';
export const generateAccessToken = async (data: object) => {
  const token = jwt.sign(data, secret, { expiresIn: 15 * 60 }); // 15 minutes
  return token;
};
export const generateToken = async (data: object, exipration: number) => {
  const token = jwt.sign(data, secret, { expiresIn: exipration }); // 15 minutes
  return token;
};
export const generateRefreshToken = async (username: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = crypto
    .createHash('md5')
    .update(username + salt)
    .digest('hex');
  return hash;
};

export const checkToken = async (token: string) => {
  const decodedToken: any = jwt.verify(token, secret);
  return decodedToken;
};

import objection from 'objection';
import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';
import { User } from 'models';
import {
  logger,
  checkToken,
  checkPassword,
  generateToken,
  hashedPassword,
  generateAccessToken,
  generateRefreshToken,
} from 'utils';
import { JsonWebTokenError } from 'jsonwebtoken';

const refreshTokenLifeSpan = 86400; //24 hours in seconds

export const register = async (req: Request, res: Response) => {
  // 1-extract data from req
  // 2-generate salt
  // 3-generate password hash
  // 4-inster new user
  // 5-generate token
  // 6-return success or error
  try {
    const {
      id,
      username,
      email,
      password,
      age,
      gender,
      city,
      state,
      country,
    } = req.body;
    let passwordHash = undefined;
    if (password != '') passwordHash = await hashedPassword(password);
    else if (password === '' && id != '')
      passwordHash = await hashedPassword(id);

    const refreshToken = await generateRefreshToken(username);

    await User.query().insert({
      username,
      email,
      password: passwordHash,
      location: {
        city,
        state,
        country,
      },
      age,
      gender,
      refreshToken,
      expirationDate: new Date(
        Date.now() + refreshTokenLifeSpan * 1000,
      ).toISOString(), // in miliseconds
    });
    const user = await User.query()
      .select('id', 'username', 'email', 'location', 'age', 'gender')
      .where('email', email)
      .first();

    const accessToken = await generateAccessToken({ id: user.id });

    // 201 Created
    res.status(201).send({
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.UniqueViolationError)
      res.status(400).send({ message: 'username, email must be unique' });
    if (error instanceof objection.NotNullViolationError)
      res.status(400).send({ message: `${error.column} is required` });
    else res.status(400).send({ message: error.name });
  }
};
export const login = async (req: Request, res: Response) => {
  //   1- extract data from req
  //   2- check database for user
  //   3- check for password
  //   4- generate token
  //   5- renew refresh token
  //   6- send success of failure
  try {
    const { id, email } = req.body;
    let { password } = req.body;
    if (!email) return res.status(400).send({ message: 'email required' });
    let user = await User.query().findOne('email', email);

    //login with facebook state
    if (id != '' && password === '') {
      if (!user) {
        await register(req, res);
      }
      password = id;
    }

    if (!user || !password)
      return res
        .status(400)
        .send({ message: 'email or password is not correct!' });
    const valid = await checkPassword(password, user.password);
    if (!valid)
      return res
        .status(400)
        .send({ message: 'email or password is not correct!' });

    const refreshToken = await generateRefreshToken(user.username);
    const accessToken = await generateAccessToken({ id: user.id });

    await User.query()
      .findById(user.id)
      .patch({
        refreshToken: refreshToken,
        expirationDate: new Date(
          Date.now() + refreshTokenLifeSpan * 1000,
        ).toISOString(),
      });

    user = await User.query()
      .select('id', 'username', 'email', 'location', 'age', 'gender')
      .where('email', email)
      .first();

    res.status(200).send({
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(error);
    res.status(400).send({
      message: error.message,
    });
  }
};
export const forgetPassword = async (req: Request, res: Response) => {
  //   1- extract data from req
  //   2- check for user existance
  //   3- setup mail settings
  //   4- send email
  //   5- success or failure
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: 'email required' });
    const user = await User.query().findOne('email', email);
    if (!user) return res.status(400).send({ message: 'user not found' });

    const token = await generateToken({ id: user.id }, 20 * 60); //20minutes
    const smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'zainkhatib9@gmail.com',
        pass: 'hshxcbmrpoeyprzc',
      },
    });
    const mailinfo = {
      from: 'noreplay@ramadanapp.com',
      to: user.email,
      subject: 'Password Reset',
      text:
        'You are reciving this because you (or someone else) have requested the reset of the password for your account. \n\n' +
        'Please click on the following link, or paste this into your browser to complete the process: \n\n' +
        `http://${req.headers.host}/user/reset-password/${token}` +
        '\n\nif you did not request this, please ignore this email and your password will remain unchanged.\n',
    };
    await smtpTransport.sendMail(mailinfo);
    res.send({ message: 'a link to your email has been sent' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  //1-extract data from body
  //2-check for token and user
  //3-update password
  //4- send success or failure
  try {
    const { token, newPassword } = req.body;

    const data = await checkToken(token);
    if (!data) res.status(400).send({ message: 'token is invalid' });
    if (!newPassword) res.status(400).send({ message: 'password is required' });

    const newHashedPassword = await hashedPassword(newPassword);

    await User.query().findById(data.id).patch({
      password: newHashedPassword,
    });
    res.send({ message: 'password updated successfully!' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
//TODO: validators
// id must be an id of facebook user
// typical validator for input fields
//token must be jwt token

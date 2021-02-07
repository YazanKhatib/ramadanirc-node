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
    if (password) passwordHash = await hashedPassword(password);
    else if (!password && id) passwordHash = await hashedPassword(id);

    const refreshToken = await generateRefreshToken(username);

    const user = await User.query().insert({
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
    const accessToken = await generateAccessToken({ id: user.id });

    // 201 Created
    res.status(201).send({
      //TODO : remove user form res
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
  //   1-extract data from req
  //   2-check database for user
  //   3- check for password
  //   4-generate token
  //   5- send success of failure
  try {
    const { id, email } = req.body;
    let { password } = req.body;
    const user = await User.query().findOne('email', email);

    //login with facebook state
    if (id && !password) {
      if (!user) register(req, res);
      password = id;
    }
    const valid = await checkPassword(password, user.password);
    if (!valid)
      return res
        .status(400)
        .send({ message: 'username or password is not correct!' });

    const refreshToken = await generateRefreshToken(user.username);
    const accessToken = await generateAccessToken({ id: user.id });
    const responseData = {
      //TODO:remove user from res
      user,
      accessToken,
      refreshToken,
    };
    res.status(200).send(responseData);
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
    const user = await User.query().findOne('email', email);
    if (!user) throw new Error('user not found');

    const token = await generateToken({ id: user.id }, 20 * 60); //20minutes
    const smtpTransport = nodemailer.createTransport({
      //TODO: fill the smtp service options from gmail
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
    if (!data) throw new Error('link has expired');

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

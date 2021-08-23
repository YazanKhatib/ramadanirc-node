import objection, { NotFoundError, NotNullViolationError } from 'objection';
import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
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
import appleAuth from 'utils/appleAuth';
import jwt from 'jsonwebtoken';

const refreshTokenLifeSpan = 86400 * 7; //7 days in seconds

const returnUser = async (matchName, matchData) => {
  const user = await User.query()
    .select(
      'id',
      'username',
      'email',
      'location',
      'language',
      'age',
      'gender',
      'admin',
      'notify',
      'timezone',
    )
    .where(matchName, matchData)
    .first();
  return user;
};
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
      password,
      age,
      gender,
      location,
      adminSecret,
      registrationToken,
      date,
    } = req.body;
    let { email } = req.body;
    email = email.toLowerCase();
    let passwordHash = undefined;
    if (password != '') passwordHash = await hashedPassword(password);
    else if (password === '' && id != '')
      passwordHash = await hashedPassword(id);

    const refreshToken = await generateRefreshToken(username);
    const admin = adminSecret === process.env.adminSecret;
    const timezone = date.substring(date.length - 6);
    await User.query().insert({
      username,
      email,
      password: passwordHash,
      location,
      age,
      admin,
      gender,
      refreshToken,
      expirationDate: new Date(
        Date.now() + refreshTokenLifeSpan * 1000,
      ).toISOString(), // in miliseconds
      registrationToken,
      timezone,
    });
    const user = await returnUser('email', email);

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
      res.status(400).send({ message: 'email already exists.' });
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
    const { id, language, registrationToken, date } = req.body;
    let { password, email } = req.body;
    email = email.toLowerCase();
    if (!email) return res.status(400).send({ message: 'email required' });
    let user = await User.query().findOne('email', email);
    const timezone = date.substring(date.length - 6);
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
        language,
        timezone,
        registrationToken,
        refreshToken: refreshToken,
        expirationDate: new Date(
          Date.now() + refreshTokenLifeSpan * 1000,
        ).toISOString(),
      });

    user = await returnUser('email', email);

    return res.status(200).send({
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof NotNullViolationError)
      return res.status(400).send({ message: `${error.column} is required` });
    return res.status(400).send({ message: error.message });
  }
};
export const appleLogin = async (req: Request, res: Response) => {
  try {
    const { token: appleToken } = req.body;
    if (!appleToken) throw new NotFoundError([]);
    const apple = await appleAuth.accessToken(appleToken);
    const appleData = jwt.decode(apple.id_token);

    const { sub: appleId } = appleData;
    Object.assign(req.body, [
      { password: '', id: appleId, email: appleData['email'] },
    ]);
    await login(req, res);
  } catch (error) {
    if (error instanceof NotFoundError)
      return res.status(400).send({ message: 'Apple Token Not Found' });
    return res.status(400).send({ message: error.message });
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
    if (!email) return res.status(400).send({ message: 'Email required' });
    const user = await User.query().findOne('email', email);
    if (!user) return res.status(400).send({ message: 'User not found' });

    const token = await generateToken({ id: user.id }, 20 * 60); //20minutes
    const smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'app@islamicreliefcanada.org',
        pass: 'islamicrelief1',
      },
    });
    const mailinfo = {
      from: 'noreplay@ramadanapp.com',
      to: user.email,
      subject: 'Password Reset',
      html:
        'You are reciving this because you (or someone else) have requested the reset of the password for your account. <br>' +
        'Please click on the following link, or paste this into your browser to complete the process:<br>' +
        `<a href="https://www.ircanada.net/reset-password/${token}">Click here <a>` +
        '<br> if you did not request this, please ignore this email and your password will remain unchanged.<br>',
    };
    await smtpTransport.sendMail(mailinfo);
    res.send({ success: 'A link to your email has been sent' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  //1-extract data from body
  //2-check for accesstoken and user
  //3-update password
  //4- send success or failure
  try {
    const accessToken = req.params.accessToken;
    const { newPassword } = req.body;

    const data = await checkToken(accessToken);
    if (!data) res.status(400).send({ message: 'Access token is invalid' });
    if (!newPassword) res.status(400).send({ message: 'Password is required' });

    const newHashedPassword = await hashedPassword(newPassword);

    await User.query().findById(data.id).patch({
      password: newHashedPassword,
    });
    res.send({ success: 'Password updated successfully!' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const getProfile = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await returnUser('id', data.id);

    if (!user) return res.status(400).send({ message: "User doesn't exist" });
    else
      return res.send({
        user: user,
      });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};
export const postProfile = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { username, password, email, age, gender, location } = req.body;

    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);

    if (!user) return res.status(400).send({ message: "User doesn't exist" });
    await User.query().patchAndFetchById(data.id, {
      username,
      email,
      age,
      gender,
      location,
    });
    if (password && password != '')
      await User.query()
        .findById(data.id)
        .patch({
          password: await hashedPassword(password),
        });
    return res.send({ user: await returnUser('id', data.id) });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.UniqueViolationError)
      return res.status(400).send({ message: 'Email must be unique' });
    if (error instanceof objection.NotNullViolationError)
      return res.status(400).send({ message: `${error.column} is required` });
    return res.status(400).send({ message: error.name });
  }
};
export const setNotify = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { value } = req.body;
    if (value === null)
      return res.status(400).send({ message: 'Value is required' });
    const data = await checkToken(accessToken);
    await User.query().findById(data.id).patch({ notify: value });
    return res.send({ success: 'Notification status has been updated' });
  } catch (error) {
    logger.error(error);
    return res.send(400).send({ message: error.message });
  }
};
export const setLanguage = async (req: Request, res: Response) => {
  try {
    const { language } = req.body;
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    await User.query().patch({ language }).where('id', data.id);
    const user = await returnUser('id', data.id);
    return res.send({ success: 'Language has been updated', user: user });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
//ADMIN

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let users;
    if (id) {
      users = await User.query()
        .select(
          'id',
          'username',
          'email',
          'admin',
          'location',
          'age',
          'gender',
          'language',
          'refreshToken',
          'expirationDate',
          'registrationToken',
          'notify',
        )
        .where('id', id)
        .first();
    } else {
      users = await User.query().select(
        'id',
        'username',
        'email',
        'admin',
        'location',
        'age',
        'gender',
        'language',
        'refreshToken',
        'expirationDate',
        'registrationToken',
        'notify',
      );
    }
    return res.send({ users: users });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const {
      id,
      username,
      email,
      age,
      gender,
      language,
      location,
      password,
      admin,
    } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: ' Id is required' });
    await User.query().findById(id).patch({
      username,
      email,
      age,
      gender,
      language,
      admin,
      location,
    });
    if (password && password != '')
      await User.query()
        .findById(id)
        .patch({
          password: await hashedPassword(password),
        });
    const user = await returnUser('id', id);
    return res.send({ success: 'User has been updated ', user: user });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.UniqueViolationError)
      return res.status(400).send({ message: 'Email must be unique' });
    if (error instanceof objection.NotNullViolationError)
      return res.status(400).send({ message: `${error.column} is required` });
    return res.status(400).send({ message: error.message });
  }
};

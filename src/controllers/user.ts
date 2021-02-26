import objection, { NotNullViolationError } from 'objection';
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

const refreshTokenLifeSpan = 86400; //24 hours in seconds

const returnUser = async (matchName, matchData) => {
  const user = await User.query()
    .select('id', 'username', 'email', 'location', 'age', 'gender')
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
      email,
      password,
      age,
      gender,
      location,
      adminSecret,
      registrationToken,
    } = req.body;
    let passwordHash = undefined;
    if (password != '') passwordHash = await hashedPassword(password);
    else if (password === '' && id != '')
      passwordHash = await hashedPassword(id);

    const refreshToken = await generateRefreshToken(username);
    const admin = adminSecret === process.env.adminSecret;
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
    const { id, email, registrationToken } = req.body;
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
        pass: 'pmclkvbjhhckhaam',
      },
    });
    const mailinfo = {
      from: 'noreplay@ramadanapp.com',
      to: user.email,
      subject: 'Password Reset',
      text:
        'You are reciving this because you (or someone else) have requested the reset of the password for your account. \n\n' +
        'Please click on the following link, or paste this into your browser to complete the process: \n\n' +
        `<a href="http://${req.headers.host}/user/reset-password/${token}">Click here <a>` +
        '\n\nif you did not request this, please ignore this email and your password will remain unchanged.\n',
    };
    await smtpTransport.sendMail(mailinfo);
    res.send({ success: 'a link to your email has been sent' });
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
    if (!data) res.status(400).send({ message: 'access token is invalid' });
    if (!newPassword) res.status(400).send({ message: 'password is required' });

    const newHashedPassword = await hashedPassword(newPassword);

    await User.query().findById(data.id).patch({
      password: newHashedPassword,
    });
    res.send({ success: 'password updated successfully!' });
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

    if (!user) return res.status(400).send({ message: "user doesn't exist" });
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

    if (!user) return res.status(400).send({ message: "user doesn't exist" });
    await User.query().patchAndFetchById(data.id, {
      username: username,
      email: email,
      age: age,
      gender: gender,
      location: location,
    });
    if (password && password != '')
      await User.query().patch({
        password: await hashedPassword(password),
      });
    return res.send({ user: await returnUser('id', data.id) });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.UniqueViolationError)
      return res
        .status(400)
        .send({ message: 'username, email must be unique' });
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
      return res.status(400).send({ message: 'value is required' });
    const data = await checkToken(accessToken);
    await User.query().findById(data.id).patch({ notify: value });
    return res.send({ success: 'notification status has been updated' });
  } catch (error) {
    logger.error(error);
    return res.send(400).send({ message: error.message });
  }
};

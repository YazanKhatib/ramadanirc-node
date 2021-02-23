import Router from 'express';
import { verifyToken } from 'middleware';
import {
  register,
  login,
  resetPassword,
  forgetPassword,
  getProfile,
  postProfile,
  setNotify,
} from 'controllers';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password/:accessToken', resetPassword);
router.post('/forget-password', forgetPassword);
router.post('/profile', verifyToken, postProfile);
router.post('/notify', verifyToken, setNotify);
router.get('/profile', verifyToken, getProfile);

export { router as userRouter };

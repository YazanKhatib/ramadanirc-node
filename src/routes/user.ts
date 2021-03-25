import Router from 'express';
import { verifyAdmin, verifyToken, updateActivity } from 'middleware';
import {
  register,
  login,
  resetPassword,
  forgetPassword,
  getProfile,
  postProfile,
  setNotify,
  getUser,
  updateUser,
  setLanguage,
} from 'controllers';

const router = Router();

//ADMIN
router.get('/:id(\\d+)', verifyToken, verifyAdmin, getUser);
router.post('/update', verifyToken, verifyAdmin, updateUser);

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password/:accessToken', resetPassword);
router.post('/forget-password', forgetPassword);
router.post('/profile', verifyToken, updateActivity, postProfile);
router.post('/notify', verifyToken, updateActivity, setNotify);
router.post('/language', verifyToken, updateActivity, setLanguage);
router.get('/profile', verifyToken, updateActivity, getProfile);

router.get('/', verifyToken, verifyAdmin, getUser);
export { router as userRouter };

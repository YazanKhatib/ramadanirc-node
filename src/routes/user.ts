import Router from 'express';
import { verifyAdmin, verifyToken } from 'middleware';
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
} from 'controllers';

const router = Router();

//ADMIN
router.get('/:id(\\d+)', verifyToken, verifyAdmin, getUser);
router.post('/update', verifyToken, verifyAdmin, updateUser);

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password/:accessToken', resetPassword);
router.post('/forget-password', forgetPassword);
router.post('/profile', verifyToken, postProfile);
router.post('/notify', verifyToken, setNotify);
router.get('/profile', verifyToken, getProfile);

router.get('/', verifyToken, verifyAdmin, getUser);
export { router as userRouter };

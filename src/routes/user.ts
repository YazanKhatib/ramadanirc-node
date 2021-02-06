import Router from 'express';
import { register, login, resetPassword, forgetPassword } from 'controllers';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/forget-password', forgetPassword);

export { router as userRouter };

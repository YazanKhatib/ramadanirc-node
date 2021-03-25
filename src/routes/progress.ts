import { getMonthlyProgress } from 'controllers';
import { Router } from 'express';
import { verifyToken, updateActivity } from 'middleware';

const router = Router();

router.get('/', verifyToken, updateActivity, getMonthlyProgress);

export { router as progressRouter };

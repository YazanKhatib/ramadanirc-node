import { getMonthlyProgress } from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.get('/', verifyToken, getMonthlyProgress);

export { router as progressRouter };

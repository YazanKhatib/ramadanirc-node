import { getIndicators } from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();
router.get('/', verifyToken, getIndicators);
export { router as indicatorsRouter };

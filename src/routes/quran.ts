import {
  checkDailyQuran,
  getDailyQuran,
  getTracker,
  updateTracker,
} from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.get('/tracker', verifyToken, getTracker);
router.get('/daily', verifyToken, getDailyQuran);
router.post('/update', verifyToken, updateTracker);
router.post('/check', verifyToken, checkDailyQuran);

export { router as quranRouter };

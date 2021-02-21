import {
  getDailyQuran,
  getTracker,
  setTimeRead,
  updateTracker,
} from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.get('/tracker', verifyToken, getTracker);
router.post('/daily', verifyToken, getDailyQuran);
router.post('/update', verifyToken, updateTracker);
router.post('/readtime', verifyToken, setTimeRead);
export { router as quranRouter };

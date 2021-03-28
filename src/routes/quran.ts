import {
  getDailyQuran,
  getTracker,
  setTimeRead,
  updateTracker,
} from 'controllers';
import { Router } from 'express';

const router = Router();

router.get('/tracker', getTracker);
router.post('/daily', getDailyQuran);
router.post('/update', updateTracker);
router.post('/readtime', setTimeRead);
export { router as quranRouter };

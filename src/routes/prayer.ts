import { checkPrayer, userPrayers } from 'controllers';
import { Router } from 'express';

const router = Router();

router.post('/myprayers', userPrayers);
router.post('/check', checkPrayer);

export { router as prayerRouter };

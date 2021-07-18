import { checkPrayers, userPrayers } from 'controllers';
import { Router } from 'express';

const router = Router();

router.post('/myprayers', userPrayers);
router.post('/check', checkPrayers);

export { router as prayerRouter };

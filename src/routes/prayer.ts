import { checkPrayer, userPrayers } from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.post('/myprayers', verifyToken, userPrayers);
router.post('/check', verifyToken, checkPrayer);

export { router as prayerRouter };

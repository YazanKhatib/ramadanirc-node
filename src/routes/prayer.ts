import { checkPrayer, getPrayers, userPrayers } from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.get('/', verifyToken, getPrayers);
router.post('/myprayers', verifyToken, userPrayers);
router.post('/check', verifyToken, checkPrayer);

export { router as prayerRouter };

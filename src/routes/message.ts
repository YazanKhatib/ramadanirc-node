import { sendAll } from 'controllers';
import { Router } from 'express';
import { verifyAdmin, verifyToken } from 'middleware';

const router = Router();

router.post('/send', verifyToken, verifyAdmin, sendAll);
export { router as messageRouter };

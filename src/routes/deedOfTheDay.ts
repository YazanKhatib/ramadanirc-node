import { getDeedOfTheDay, setDeedOfTheDay } from 'controllers';
import { Router } from 'express';
import { verifyAdmin, verifyToken, updateActivity } from 'middleware';

const router = Router();

router.get('/', verifyToken, updateActivity, getDeedOfTheDay);
router.post('/set', verifyToken, verifyAdmin, setDeedOfTheDay);

export { router as deedRouter };

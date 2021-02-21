import { getDeedOfTheDay, setDeedOfTheDay } from 'controllers';
import { Router } from 'express';
import { verifyAdmin, verifyToken } from 'middleware';

const router = Router();

//TODO: implement route
router.get('/', verifyToken, getDeedOfTheDay);
router.post('/set', verifyToken, verifyAdmin, setDeedOfTheDay);

export { router as deedRouter };

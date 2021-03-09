import { addTitle, getTitle, removeTitle, updateTitle } from 'controllers';
import { Router } from 'express';
import { verifyAdmin, verifyToken } from 'middleware';

const router = Router();

router.get('/', verifyToken, getTitle);
router.get('/delete/:id(\\d+)', verifyToken, verifyAdmin, removeTitle);
router.post('/update', verifyToken, verifyAdmin, updateTitle);
router.post('/add', verifyToken, verifyAdmin, addTitle);
export { router as titleRouter };

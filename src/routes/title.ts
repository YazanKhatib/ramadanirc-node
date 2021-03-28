import { addTitle, getTitle, removeTitle, updateTitle } from 'controllers';
import { Router } from 'express';
import { verifyAdmin } from 'middleware';

const router = Router();

router.get('/', getTitle);
router.get('/delete/:id(\\d+)', verifyAdmin, removeTitle);
router.post('/update', verifyAdmin, updateTitle);
router.post('/add', verifyAdmin, addTitle);
export { router as titleRouter };

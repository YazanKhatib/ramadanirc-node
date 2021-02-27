import {
  addReflection,
  deleteReflection,
  getReflections,
  updateReflection,
} from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.get('/', verifyToken, getReflections);
router.get('/delete/:id(\\d+)', verifyToken, deleteReflection);
router.post('/add', verifyToken, addReflection);
router.post('/update', verifyToken, updateReflection);
export { router as reflectionRouter };

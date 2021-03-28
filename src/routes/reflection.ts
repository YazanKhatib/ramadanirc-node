import {
  addReflection,
  deleteReflection,
  getReflections,
  updateReflection,
} from 'controllers';
import { Router } from 'express';

const router = Router();

router.get('/', getReflections);
router.get('/:id(\\d+)', getReflections);
router.get('/delete/:id(\\d+)', deleteReflection);
router.post('/add', addReflection);
router.post('/update', updateReflection);
export { router as reflectionRouter };

import { addReflection, getReflections } from 'controllers';
import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();

router.get('/', verifyToken, getReflections);
router.post('/add', verifyToken, addReflection);
export { router as reflectionRouter };

import { getIndicators } from 'controllers';
import { Router } from 'express';

const router = Router();
router.get('/', getIndicators);
export { router as indicatorsRouter };

import { Router } from 'express';
import { verifyAdmin } from 'middleware';
import { addFeedback, getFeedbacks } from 'controllers';

const router = Router();

router.get('/', verifyAdmin, getFeedbacks);
router.post('/add', addFeedback);
export { router as feedbackRouter };

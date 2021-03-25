import {
  addNotificaiton,
  getNotifications,
  removeNotification,
  sendAll,
  updateNotification,
} from 'controllers';
import { Router } from 'express';
import { verifyAdmin, verifyToken } from 'middleware';

const router = Router();

router.post('/send', verifyToken, verifyAdmin, sendAll);
router.post('/add', verifyToken, verifyAdmin, addNotificaiton);
router.post('/update', verifyToken, verifyAdmin, updateNotification);
router.get('/get', verifyToken, verifyAdmin, getNotifications);
router.get('/delete/:id(\\d+)/', verifyToken, verifyAdmin, removeNotification);
export { router as messageRouter };

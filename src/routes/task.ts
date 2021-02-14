import Router from 'express';
import { verifyAdmin, verifyToken } from 'middleware';
import {
  getTask,
  addTask,
  userTasks,
  updateTask,
  deleteTask,
} from 'controllers';
const router = Router();

//admin routes
router.get('/', verifyToken, verifyAdmin, getTask);
router.get('/:id(\\d)', verifyToken, verifyAdmin, getTask);
router.get('/delete/:id', verifyToken, verifyAdmin, deleteTask);

router.post('/add', verifyToken, verifyAdmin, addTask);
router.post('/update', verifyToken, verifyAdmin, updateTask);

//user routes
router.post('/myTasks', verifyToken, userTasks);

export { router as taskRouter };

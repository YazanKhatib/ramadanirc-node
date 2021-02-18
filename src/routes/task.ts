import Router from 'express';
import { verifyAdmin, verifyToken } from 'middleware';
import {
  getTask,
  addTask,
  userTasks,
  updateTask,
  deleteTask,
  checkTask,
} from 'controllers';
const router = Router();

//admin routes

router.get('/:id(\\d+)', verifyToken, verifyAdmin, getTask);
router.get('/delete/:id', verifyToken, verifyAdmin, deleteTask);

router.post('/add', verifyToken, verifyAdmin, addTask);
router.post('/update', verifyToken, verifyAdmin, updateTask);

//user routes
router.post('/myTasks', verifyToken, userTasks);
router.post('/check', verifyToken, checkTask);

//common routes
router.get('/', verifyToken, getTask);
export { router as taskRouter };

import Router from 'express';
import { verifyAdmin, verifyToken, updateActivity } from 'middleware';
import {
  getTask,
  addTask,
  userTasks,
  updateTask,
  deleteTask,
  checkTasks,
  fillTasks,
} from 'controllers';
const router = Router();

//admin routes

router.get('/:id(\\d+)', verifyToken, verifyAdmin, getTask);
router.get('/delete/:id', verifyToken, verifyAdmin, deleteTask);

router.post('/add', verifyToken, verifyAdmin, addTask);
router.post('/update', verifyToken, verifyAdmin, updateTask);

//user routes
router.post('/myTasks', verifyToken, updateActivity, fillTasks, userTasks);
router.post('/check', verifyToken, updateActivity, checkTasks);

//common routes
router.get('/', verifyToken, updateActivity, getTask);
export { router as taskRouter };

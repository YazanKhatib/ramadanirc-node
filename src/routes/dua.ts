import { Router } from 'express';
import {
  addDua,
  addFavoriteDua,
  deleteDua,
  getDuas,
  getFavoriteDua,
  removeFavoriteDua,
  updateDua,
} from 'controllers';
import { verifyToken, verifyAdmin } from 'middleware';
const router = Router();

//COMMON ROUTE
router.get('/', verifyToken, getDuas);

//ADMIN CRUD
router.get('/delete/:id(\\d+)/', verifyToken, verifyAdmin, deleteDua);
router.post('/add', verifyToken, verifyAdmin, addDua);
router.post('/update', verifyToken, verifyAdmin, updateDua);

//USER FUNC
router.get('/favorite', verifyToken, getFavoriteDua);
router.get('/favorite/delete/:id(\\d+)', verifyToken, removeFavoriteDua);
router.post('/favorite/add', verifyToken, addFavoriteDua);

export { router as duaRouter };

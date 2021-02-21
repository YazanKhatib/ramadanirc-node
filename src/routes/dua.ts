import { Router } from 'express';
import {
  addDua,
  addFavoriteDua,
  deleteDua,
  getDuas,
  getFavoriteDua,
  removeFavoriteDua,
  getUserDuas,
  updateDua,
} from 'controllers';
import { verifyToken, verifyAdmin } from 'middleware';
const router = Router();

//ADMIN CRUD
router.get('/', verifyToken, getDuas);
router.get('/delete/:id(\\d+)/', verifyToken, verifyAdmin, deleteDua);
router.post('/add', verifyToken, verifyAdmin, addDua);
router.post('/update', verifyToken, verifyAdmin, updateDua);

//USER FUNC
router.get('/myduas', verifyToken, getUserDuas);
router.get('/favorite', verifyToken, getFavoriteDua);
router.get('/favorite/delete/:id(\\d+)', verifyToken, removeFavoriteDua);
router.post('/favorite/add', verifyToken, addFavoriteDua);

export { router as duaRouter };

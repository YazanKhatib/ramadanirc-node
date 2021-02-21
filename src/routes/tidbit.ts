import {
  addFavoriteTidbit,
  addTidbit,
  deleteTidbit,
  getFavoriteTidbit,
  getTidbits,
  getUserTidbits,
  removeFavoriteTidbit,
  updateTidbit,
} from 'controllers';
import { Router } from 'express';
import { verifyAdmin, verifyToken } from 'middleware';

const router = Router();

//ADMIN CRUD
router.get('/', verifyToken, getTidbits);
router.get('/delete/:id(\\d+)/', verifyToken, verifyAdmin, deleteTidbit);
router.post('/add', verifyToken, verifyAdmin, addTidbit);
router.post('/update', verifyToken, verifyAdmin, updateTidbit);

//USER FUNC
router.get('/mytidbits', verifyToken, getUserTidbits);
router.get('/favorite', verifyToken, getFavoriteTidbit);
router.get('/favorite/delete/:id(\\d+)', verifyToken, removeFavoriteTidbit);
router.post('/favorite/add', verifyToken, addFavoriteTidbit);
export { router as tidbitRouter };

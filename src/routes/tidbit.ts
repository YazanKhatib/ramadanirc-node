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
import { verifyAdmin, verifyToken, updateActivity } from 'middleware';

const router = Router();

//ADMIN CRUD
router.get('/', verifyToken, getTidbits);
router.get('/delete/:id(\\d+)/', verifyToken, verifyAdmin, deleteTidbit);
router.post('/add', verifyToken, verifyAdmin, addTidbit);
router.post('/update', verifyToken, verifyAdmin, updateTidbit);

//USER FUNC
router.get('/mytidbits', verifyToken, updateActivity, getUserTidbits);
router.get('/favorite', verifyToken, updateActivity, getFavoriteTidbit);
router.get(
  '/favorite/delete/:id(\\d+)',
  verifyToken,
  updateActivity,
  removeFavoriteTidbit,
);
router.post('/favorite/add', verifyToken, updateActivity, addFavoriteTidbit);
export { router as tidbitRouter };

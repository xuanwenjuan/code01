import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategoryList,
  getCategoryTree,
  getCategoryTreeLazy
} from '../controllers/categoryController';
import { authenticate, requireStaff } from '../middleware/auth';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/tree-lazy', getCategoryTreeLazy);
router.get('/', getCategoryList);
router.get('/:id', getCategory);

router.use(authenticate, requireStaff);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;

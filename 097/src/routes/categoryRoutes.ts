import { Router } from 'express';
import {
  createCategory,
  getCategoryTree,
  getCategoryList,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryPath,
  createCategorySchema,
  updateCategorySchema
} from '../controllers/categoryController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/', getCategoryList);
router.get('/:id/path', getCategoryPath);
router.get('/:id', getCategoryById);
router.post('/', authMiddleware, validate(createCategorySchema), createCategory);
router.put('/:id', authMiddleware, validate(updateCategorySchema), updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

export default router;

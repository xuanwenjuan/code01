import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  getCategory,
  getCategoryList,
  getCategoryTree,
  getCategoryWithChildren,
  createCategorySchema,
  updateCategorySchema,
} from '../controllers/category.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/tree', getCategoryTree);
router.get('/:id/children', getCategoryWithChildren);
router.get('/:id', getCategory);
router.get('/', getCategoryList);

router.use(roleAuth(UserRole.ADMIN));

router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.patch('/:id/status', updateCategoryStatus);
router.delete('/:id', deleteCategory);

export default router;

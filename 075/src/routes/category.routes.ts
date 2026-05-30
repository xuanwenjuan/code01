
import { Router } from 'express';
import {
  categoryValidationRules,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getFlatCategoryList,
  getCategoryList,
  getCategoryDetail
} from '../controllers/category.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/flat', getFlatCategoryList);
router.get('/', getCategoryList);
router.get('/:id', categoryValidationRules.getDetail, getCategoryDetail);

router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  categoryValidationRules.create,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  categoryValidationRules.update,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  categoryValidationRules.delete,
  deleteCategory
);

export default router;

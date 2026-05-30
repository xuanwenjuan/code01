import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { validate } from '../middleware/validate';
import { auth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserRole } from '../types';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryListSchema,
  categoryIdSchema
} from '../validations/categoryValidation';

const router = Router();

router.get('/list', validate(categoryListSchema), asyncHandler(categoryController.getCategoryList));
router.get('/active', asyncHandler(categoryController.getAllActiveCategories));
router.get('/:categoryId', validate(categoryIdSchema), asyncHandler(categoryController.getCategoryDetail));
router.get('/:categoryId/statistics', auth, requireRole(UserRole.ADMIN), validate(categoryIdSchema), asyncHandler(categoryController.getCategoryStatistics));

router.post('/create', auth, requireRole(UserRole.ADMIN), validate(createCategorySchema), asyncHandler(categoryController.createCategory));
router.put('/:categoryId', auth, requireRole(UserRole.ADMIN), validate(updateCategorySchema), asyncHandler(categoryController.updateCategory));
router.delete('/:categoryId', auth, requireRole(UserRole.ADMIN), validate(categoryIdSchema), asyncHandler(categoryController.deleteCategory));
router.put('/:categoryId/status', auth, requireRole(UserRole.ADMIN), validate(categoryIdSchema), asyncHandler(categoryController.updateCategoryStatus));

export default router;

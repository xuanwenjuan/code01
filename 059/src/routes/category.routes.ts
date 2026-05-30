import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryList,
  getCategoryDetail,
  getSubCategories
} from '../controllers/category.controller';
import { authenticate, authorizeManager, authorizeAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { categoryValidationRules, idParam } from '../validations/category.validation';

const router = Router();

router.get('/tree', authenticate, getCategoryTree);
router.get('/sub/:parentId', authenticate, getSubCategories);
router.get('/', authenticate, getCategoryList);
router.get('/:id', authenticate, validate(idParam), getCategoryDetail);
router.post('/', authenticate, authorizeManager, validate(categoryValidationRules.create), createCategory);
router.put('/:id', authenticate, authorizeManager, validate(categoryValidationRules.update), updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, validate(idParam), deleteCategory);

export default router;

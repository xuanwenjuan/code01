import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  getCategoryListSchema,
  categoryIdSchema
} from '../validations/category.validation';

const router = Router();

router.get('/tree', CategoryController.getCategoryTree);
router.get('/list', validateQuery(getCategoryListSchema), CategoryController.getCategoryList);
router.get('/:id/path', validateParams(categoryIdSchema), CategoryController.getCategoryPath);
router.get('/:id', validateParams(categoryIdSchema), CategoryController.getCategoryById);

router.use(authenticate);

router.post('/', authorize('category:create'), validateBody(createCategorySchema), CategoryController.createCategory);
router.put('/:id', authorize('category:update'), validateParams(categoryIdSchema), validateBody(updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', authorize('category:delete'), validateParams(categoryIdSchema), CategoryController.deleteCategory);
router.patch('/:id/status', authorize('category:update'), validateParams(categoryIdSchema), validateBody(updateCategoryStatusSchema), CategoryController.updateCategoryStatus);

export default router;
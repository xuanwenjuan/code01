import { Router } from 'express';
import ServiceCategoryController from '../controllers/serviceCategory.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  updateSortOrderSchema,
  getCategoryListSchema
} from '../validations/serviceCategory.validation';

const router = Router();

router.get('/tree', ServiceCategoryController.getCategoryTree);
router.get('/', validate(getCategoryListSchema), ServiceCategoryController.getCategoryList);
router.get('/:id', ServiceCategoryController.getCategoryById);

router.use(authenticate, requireAdmin);
router.post('/', validate(createServiceCategorySchema), ServiceCategoryController.createCategory);
router.put('/:id', validate(updateServiceCategorySchema), ServiceCategoryController.updateCategory);
router.delete('/:id', ServiceCategoryController.deleteCategory);
router.patch('/:id/sort', validate(updateSortOrderSchema), ServiceCategoryController.updateSortOrder);

export default router;

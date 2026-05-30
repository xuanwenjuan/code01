import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authMiddleware, roleGuard } from '../middlewares/auth';
import * as categoryController from '../controllers/category.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/tree', categoryController.getCategoryTree);
router.get('/list', categoryController.getCategoryList);
router.get('/:id', validate(categoryController.getCategoryByIdSchema), categoryController.getCategoryById);

router.use(authMiddleware);
router.use(roleGuard(UserRole.ADMIN));

router.post('/', validate(categoryController.createCategorySchema), categoryController.createCategory);
router.put('/:id', validate(categoryController.updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', validate(categoryController.deleteCategorySchema), categoryController.deleteCategory);

export default router;

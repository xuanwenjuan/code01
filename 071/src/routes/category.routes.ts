import express from 'express';
import categoryController from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  deleteCategorySchema
} from '../validations/category.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.get('/tree', categoryController.getTree);
router.get('/list', categoryController.getList);
router.get('/:id/path', validate(getCategorySchema), categoryController.getPath);
router.get('/:id', validate(getCategorySchema), categoryController.getById);

router.use(authMiddleware([UserRole.ADMIN]));
router.post('/', validate(createCategorySchema), categoryController.create);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', validate(deleteCategorySchema), categoryController.delete);
router.patch('/:id/status', categoryController.updateStatus);

export default router;

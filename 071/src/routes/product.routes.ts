import express from 'express';
import productController from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema
} from '../validations/product.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.get('/list', productController.getList);
router.get('/:id', validate(getProductSchema), productController.getById);
router.get('/category/:categoryId', productController.getByCategoryId);

router.use(authMiddleware([UserRole.ADMIN, UserRole.SUPPLIER]));
router.post('/', validate(createProductSchema), productController.create);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', validate(getProductSchema), productController.delete);
router.patch('/:id/status', productController.updateStatus);

export default router;

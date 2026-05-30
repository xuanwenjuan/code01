import { Router } from 'express';
import {
  createProduct,
  getProductList,
  getProductById,
  getProductSelectList,
  updateProduct,
  deleteProduct,
  batchUpdateStock,
  createProductSchema,
  updateProductSchema
} from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/select', getProductSelectList);
router.get('/', getProductList);
router.get('/:id', getProductById);
router.post('/', authMiddleware, validate(createProductSchema), createProduct);
router.post('/batch-stock', authMiddleware, batchUpdateStock);
router.put('/:id', authMiddleware, validate(updateProductSchema), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;

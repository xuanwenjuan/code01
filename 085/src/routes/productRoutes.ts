import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  toggleProductStatus,
  batchUpdateProductStatus
} from '../controllers/productController';
import { authenticate, requireMerchant } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate, schemas } from '../middleware/validate';

const router = express.Router();

router.get('/', validate(schemas.product.getList, 'query'), getProducts);
router.get('/:id', getProductById);

router.use(authenticate);
router.use(requireMerchant);
router.post('/', validate(schemas.product.create, 'body'), operationLog('product', '创建商品'), createProduct);
router.get('/my/list', getMyProducts);
router.put('/:id', validate(schemas.product.update, 'body'), operationLog('product', '更新商品'), updateProduct);
router.delete('/:id', operationLog('product', '删除商品'), deleteProduct);
router.patch('/:id/toggle-status', operationLog('product', '切换商品状态'), toggleProductStatus);
router.patch('/batch/status', validate(schemas.product.batchUpdateStatus, 'body'), operationLog('product', '批量更新商品状态'), batchUpdateProductStatus);

export default router;

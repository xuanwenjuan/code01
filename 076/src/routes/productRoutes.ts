import { Router } from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProductList,
  getProductsForCustomer
} from '../controllers/productController';
import { authenticate, requireStaff } from '../middleware/auth';

const router = Router();

router.get('/customer', getProductsForCustomer);

router.use(authenticate);
router.get('/', getProductList);
router.get('/:id', getProduct);

router.use(requireStaff);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

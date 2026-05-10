import express from 'express';
import * as controller from '../controllers/product.controller';

const router = express.Router();

router.get('/', controller.getProducts);
router.get('/low-stock', controller.getLowStockProducts);
router.get('/aging', controller.getAgingProducts);
router.get('/:id', controller.getProduct);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

export default router;

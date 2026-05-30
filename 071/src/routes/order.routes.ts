import express from 'express';
import orderController from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createOrderSchema,
  updateOrderSchema,
  getOrderSchema,
  updateOrderStatusSchema
} from '../validations/order.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.use(authMiddleware());
router.post('/', validate(createOrderSchema), orderController.create);
router.get('/my/orders', orderController.getMyOrders);
router.get('/leader/orders', orderController.getLeaderOrders);
router.get('/statistics', orderController.getStatistics);
router.get('/:id', validate(getOrderSchema), orderController.getById);
router.get('/', orderController.getList);
router.put('/:id', validate(updateOrderSchema), orderController.update);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateStatus);
router.post('/:id/cancel', orderController.cancel);

export default router;

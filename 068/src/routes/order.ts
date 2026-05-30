import { Router } from 'express';
import Joi from 'joi';
import {
  createOrder,
  getOrderList,
  getOrderById,
  payOrder,
  cancelOrder,
  updateOrderStatus,
  getAdminOrderList,
} from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { validate, validateIdParam, paginationSchema } from '../middlewares/validate';
import { OrderStatus } from '../models/Order';

const router = Router();

const orderItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
});

const createOrderSchema = Joi.object({
  addressId: Joi.number().integer().positive().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  remark: Joi.string().optional(),
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(OrderStatus)).required(),
});

const adminOrderQuerySchema = paginationSchema.concat(
  Joi.object({
    status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
    orderNo: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  })
);

router.use(authMiddleware);
router.post('/', validate({ body: createOrderSchema }), createOrder);
router.get('/list', validate({ query: paginationSchema }), getOrderList);
router.get('/:id', validate({ params: validateIdParam }), getOrderById);
router.post('/:id/pay', validate({ params: validateIdParam }), payOrder);
router.post('/:id/cancel', validate({ params: validateIdParam, body: cancelOrderSchema }), cancelOrder);

router.use(adminMiddleware);
router.get('/admin/list', validate({ query: adminOrderQuerySchema }), getAdminOrderList);
router.put('/:id/status', validate({ params: validateIdParam, body: updateOrderStatusSchema }), updateOrderStatus);

export default router;

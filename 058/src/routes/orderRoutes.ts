import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { validate } from '../middleware/validate';
import { auth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserRole } from '../types';
import {
  createOrderSchema,
  orderIdSchema,
  cancelOrderSchema,
  orderListSchema,
  calculatePriceSchema
} from '../validations/orderValidation';
import Joi from 'joi';

const router = Router();

router.get('/price', auth, validate(calculatePriceSchema), asyncHandler(orderController.calculatePrice));
router.post('/create', auth, requireRole(UserRole.USER, UserRole.ADMIN), validate(createOrderSchema), asyncHandler(orderController.createOrder));

router.put('/assign', auth, requireRole(UserRole.ADMIN), validate({
  orderId: Joi.number().required(),
  riderId: Joi.number()
}), asyncHandler(orderController.assignOrder));
router.post('/batch-assign', auth, requireRole(UserRole.ADMIN), asyncHandler(orderController.batchAssignOrders));

router.put('/:orderId/accept', auth, requireRole(UserRole.RIDER), validate(orderIdSchema), asyncHandler(orderController.acceptOrder));
router.put('/pickup', auth, requireRole(UserRole.RIDER), validate({
  orderId: Joi.number().required(),
  lat: Joi.number(),
  lng: Joi.number()
}), asyncHandler(orderController.pickupOrder));
router.put('/deliver', auth, requireRole(UserRole.RIDER), validate({
  orderId: Joi.number().required(),
  lat: Joi.number(),
  lng: Joi.number()
}), asyncHandler(orderController.deliverOrder));
router.put('/:orderId/complete', auth, requireRole(UserRole.USER), validate(orderIdSchema), asyncHandler(orderController.completeOrder));
router.post('/cancel', auth, requireRole(UserRole.USER, UserRole.ADMIN), validate(cancelOrderSchema), asyncHandler(orderController.cancelOrder));

router.get('/list', auth, requireRole(UserRole.ADMIN), validate(orderListSchema), asyncHandler(orderController.getOrderList));
router.get('/my', auth, validate(orderListSchema), asyncHandler(orderController.getMyOrders));
router.get('/rider', auth, requireRole(UserRole.RIDER), validate(orderListSchema), asyncHandler(orderController.getRiderOrders));
router.get('/available', auth, requireRole(UserRole.RIDER), validate(orderListSchema), asyncHandler(orderController.getAvailableOrders));
router.get('/statistics', auth, requireRole(UserRole.RIDER), asyncHandler(orderController.getOrderStatistics));
router.get('/:orderId', auth, asyncHandler(orderController.getOrderDetail));

export default router;

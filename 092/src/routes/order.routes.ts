import { Router } from 'express';
import { body } from 'express-validator';
import {
  getOrderList,
  getOrderById,
  createOrder,
  confirmOrder,
  outboundOrder,
  returnOrder,
  completeOrder,
  cancelOrder,
  recordPayment,
  updateOrderItem,
  getOrderStatistics,
} from '../controllers/order.controller';
import { authMiddleware, validationMiddleware, roleMiddleware } from '../middleware';
import { UserRole } from '../common/enums';

const router = Router();

router.get('/', authMiddleware, getOrderList);
router.get('/statistics', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.FINANCE), getOrderStatistics);
router.get('/:id', authMiddleware, getOrderById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.BUSINESS),
  [
    body('eventName').notEmpty().withMessage('活动名称不能为空'),
    body('eventLocation').notEmpty().withMessage('活动地点不能为空'),
    body('startTime').notEmpty().withMessage('开始时间不能为空'),
    body('endTime').notEmpty().withMessage('结束时间不能为空'),
    body('customerName').notEmpty().withMessage('客户姓名不能为空'),
    body('customerPhone').notEmpty().withMessage('客户电话不能为空'),
    body('items').isArray({ min: 1 }).withMessage('租赁设备不能为空'),
    body('depositAmount').optional().isFloat({ min: 0 }).withMessage('定金金额必须为非负数'),
  ],
  validationMiddleware,
  createOrder
);

router.put(
  '/:id/confirm',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.BUSINESS),
  [
    body('paidAmount').optional().isFloat({ min: 0 }).withMessage('支付金额必须为非负数'),
  ],
  validationMiddleware,
  confirmOrder
);

router.put(
  '/:id/outbound',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE),
  outboundOrder
);

router.put(
  '/:id/return',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE),
  [
    body('returnItems').isArray({ min: 1 }).withMessage('归还设备不能为空'),
  ],
  validationMiddleware,
  returnOrder
);

router.put(
  '/:id/complete',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.FINANCE),
  completeOrder
);

router.put(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.BUSINESS),
  cancelOrder
);

router.put(
  '/:id/payment',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.FINANCE),
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('支付金额必须大于0'),
  ],
  validationMiddleware,
  recordPayment
);

router.put(
  '/:id/items/:itemId',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.BUSINESS),
  updateOrderItem
);

export default router;

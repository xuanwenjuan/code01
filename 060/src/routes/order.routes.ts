import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validationRules } from '../middleware/validation';
import { UserRole } from '../types/common';
import { OperationType } from '../database/models/operationLog.model';

const router = Router();

router.use(authenticate);

router.get(
  '/statistics',
  orderController.getStatistics
);
router.get(
  '/:id',
  [...validationRules.idParam, validate],
  orderController.getById
);
router.get(
  '/',
  [...validationRules.pagination, ...validationRules.order.query, validate],
  orderController.getList
);

router.post(
  '/',
  [...validationRules.order.create, validate],
  logOperation('订单', OperationType.CREATE),
  orderController.create
);
router.post(
  '/:id/pay',
  [...validationRules.idParam, validate],
  logOperation('订单', OperationType.UPDATE),
  orderController.pay
);
router.post(
  '/:id/cancel',
  [...validationRules.idParam, validate],
  logOperation('订单', OperationType.UPDATE),
  orderController.cancel
);

router.post(
  '/process-expired',
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  logOperation('订单', OperationType.UPDATE),
  orderController.processExpired
);

export default router;

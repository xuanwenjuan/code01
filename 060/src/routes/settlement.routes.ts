import { Router } from 'express';
import { settlementController } from '../controllers/settlement.controller';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validationRules } from '../middleware/validation';
import { UserRole } from '../types/common';
import { OperationType } from '../database/models/operationLog.model';

const router = Router();

router.use(authenticate);

router.get(
  '/statistics',
  settlementController.getStatistics
);
router.get(
  '/:id/orders',
  [...validationRules.idParam, validate],
  settlementController.getSettlementOrders
);
router.get(
  '/:id',
  [...validationRules.idParam, validate],
  settlementController.getById
);
router.get(
  '/',
  [...validationRules.pagination, ...validationRules.settlement.query, validate],
  settlementController.getList
);

router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post(
  '/generate',
  [...validationRules.settlement.generate, validate],
  logOperation('结算', OperationType.SETTLE),
  settlementController.generate
);
router.post(
  '/:id/confirm',
  [...validationRules.idParam, validate],
  logOperation('结算', OperationType.SETTLE),
  settlementController.confirm
);
router.post(
  '/:id/pay',
  [...validationRules.settlement.pay, validate],
  logOperation('结算', OperationType.SETTLE),
  settlementController.pay
);
router.delete(
  '/:id',
  [...validationRules.idParam, validate],
  logOperation('结算', OperationType.DELETE),
  settlementController.cancel
);

export default router;

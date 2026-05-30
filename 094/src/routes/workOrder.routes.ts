import { Router } from 'express';
import {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder,
  getWorkOrderStatistics,
  payDeposit,
} from '../controllers/workOrder.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  updateStatusSchema,
  payDepositSchema,
} from '../validators/workOrder.validator';
import { ROLES } from '../config';

const router = Router();

router.get('/', authenticate, getWorkOrders);
router.get('/statistics', authenticate, getWorkOrderStatistics);
router.get('/:id', authenticate, getWorkOrderById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.OPERATION, ROLES.ADMIN),
  validate(createWorkOrderSchema),
  createWorkOrder
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.OPERATION, ROLES.ADMIN),
  validate(updateWorkOrderSchema),
  updateWorkOrder
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.OPERATION, ROLES.ADMIN, ROLES.ARTISAN, ROLES.MATERIAL_ADMIN, ROLES.FINANCE),
  validate(updateStatusSchema),
  updateWorkOrderStatus
);

router.patch(
  '/:id/pay-deposit',
  authenticate,
  authorize(ROLES.OPERATION, ROLES.ADMIN, ROLES.FINANCE),
  validate(payDepositSchema),
  payDeposit
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.OPERATION, ROLES.ADMIN),
  deleteWorkOrder
);

export default router;

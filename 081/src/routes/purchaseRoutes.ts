import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { UserRole } from '../types';
import {
  createPurchaseOrder,
  createPurchaseOrderValidation,
  reviewPurchaseOrder,
  reviewPurchaseOrderValidation,
  shipPurchaseOrder,
  receivePurchaseOrder,
  receivePurchaseOrderValidation,
  cancelPurchaseOrder,
  getPurchaseOrderList,
  getPurchaseOrderListValidation,
  getPurchaseOrderDetail
} from '../controllers/purchaseController';

const router = Router();

router.use(authenticate);

router.get('/', validate(getPurchaseOrderListValidation), getPurchaseOrderList);
router.get('/:id', getPurchaseOrderDetail);
router.post(
  '/',
  validate(createPurchaseOrderValidation),
  operationLog('创建采购订单'),
  createPurchaseOrder
);
router.patch(
  '/:id/cancel',
  operationLog('取消采购订单'),
  cancelPurchaseOrder
);

router.patch(
  '/:id/review',
  requireRoles(UserRole.HEADQUARTERS),
  validate(reviewPurchaseOrderValidation),
  operationLog('审核采购订单'),
  reviewPurchaseOrder
);

router.patch(
  '/:id/ship',
  requireRoles(UserRole.HEADQUARTERS),
  operationLog('采购订单发货'),
  shipPurchaseOrder
);

router.patch(
  '/:id/receive',
  validate(receivePurchaseOrderValidation),
  operationLog('采购订单收货'),
  receivePurchaseOrder
);

export default router;

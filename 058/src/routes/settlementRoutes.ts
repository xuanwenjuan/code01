import { Router } from 'express';
import * as settlementController from '../controllers/settlementController';
import { validate } from '../middleware/validate';
import { auth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserRole } from '../types';
import {
  createSettlementSchema,
  batchCreateSettlementSchema,
  settlementIdSchema,
  settlementListSchema
} from '../validations/settlementValidation';

const router = Router();

router.post('/create', auth, requireRole(UserRole.ADMIN), validate(createSettlementSchema), asyncHandler(settlementController.createSettlement));
router.post('/batch', auth, requireRole(UserRole.ADMIN), validate(batchCreateSettlementSchema), asyncHandler(settlementController.batchCreateSettlements));
router.put('/confirm', auth, requireRole(UserRole.ADMIN), validate(settlementIdSchema), asyncHandler(settlementController.confirmSettlement));
router.put('/cancel', auth, requireRole(UserRole.ADMIN), validate(settlementIdSchema), asyncHandler(settlementController.cancelSettlement));

router.get('/list', auth, requireRole(UserRole.ADMIN), validate(settlementListSchema), asyncHandler(settlementController.getSettlementList));
router.get('/statistics', auth, requireRole(UserRole.ADMIN), asyncHandler(settlementController.getSettlementStatistics));
router.get('/:settlementId', auth, requireRole(UserRole.ADMIN, UserRole.RIDER), validate(settlementIdSchema), asyncHandler(settlementController.getSettlementDetail));
router.get('/:settlementId/orders', auth, requireRole(UserRole.ADMIN, UserRole.RIDER), validate(settlementIdSchema), asyncHandler(settlementController.getSettlementOrders));
router.get('/rider/:riderId/summary', auth, requireRole(UserRole.ADMIN, UserRole.RIDER), asyncHandler(settlementController.getRiderSettlementSummary));

export default router;

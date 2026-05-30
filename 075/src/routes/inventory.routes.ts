import { Router } from 'express';
import {
  inventoryValidationRules,
  createInventoryRecord,
  batchCreateInventory,
  getInventoryList,
  getInventoryStatistics,
  getInventoryReport,
  getDepreciationReport,
  getInventoryDetail,
  calculateMonthlyDepreciation
} from '../controllers/inventory.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, inventoryValidationRules.getList, getInventoryList);
router.get('/statistics', authenticate, getInventoryStatistics);
router.get('/report', authenticate, inventoryValidationRules.getReport, getInventoryReport);
router.get('/depreciation-report', authenticate, inventoryValidationRules.getDepreciationReport, getDepreciationReport);
router.get('/:id', authenticate, inventoryValidationRules.getDetail, getInventoryDetail);

router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  inventoryValidationRules.create,
  createInventoryRecord
);

router.post(
  '/batch',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  inventoryValidationRules.batchCreate,
  batchCreateInventory
);

router.post(
  '/calculate-depreciation',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  calculateMonthlyDepreciation
);

export default router;

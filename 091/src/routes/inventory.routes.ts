import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { operationLogMiddleware } from '../middlewares/operation-log.middleware';
import { OperationType } from '../models/operation-log.model';
import { UserRole } from '../constants/role.constants';

const router = Router();

router.use(authMiddleware);

router.get('/ledgers', ...inventoryController.getLedgers);

router.get('/summary', ...inventoryController.getCategorySummary);

router.get('/material/:materialId', ...inventoryController.getMaterialLedgers);

router.post(
  '/stock-out',
  requireRoles([UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.OPERATION]),
  operationLogMiddleware({ module: 'inventory', operation: OperationType.UPDATE, description: '原料出库' }),
  ...inventoryController.stockOut
);

export default router;

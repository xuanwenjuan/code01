import { Router } from 'express';
import { distributorController } from '../controllers/distributor.controller';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validationRules } from '../middleware/validation';
import { UserRole } from '../types/common';
import { OperationType } from '../database/models/operationLog.model';

const router = Router();

router.use(authenticate);

router.get('/all', distributorController.getAll);
router.get(
  '/:id/statistics',
  [...validationRules.idParam, validate],
  distributorController.getStatistics
);
router.get(
  '/:id',
  [...validationRules.idParam, validate],
  distributorController.getById
);
router.get(
  '/',
  [...validationRules.pagination, validate],
  distributorController.getList
);

router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post(
  '/',
  [...validationRules.distributor.create, validate],
  logOperation('分销商', OperationType.CREATE),
  distributorController.create
);
router.put(
  '/:id',
  [...validationRules.distributor.update, validate],
  logOperation('分销商', OperationType.UPDATE),
  distributorController.update
);
router.delete(
  '/:id',
  [...validationRules.idParam, validate],
  logOperation('分销商', OperationType.DELETE),
  distributorController.delete
);
router.patch(
  '/:id/toggle-status',
  [...validationRules.idParam, validate],
  logOperation('分销商', OperationType.UPDATE),
  distributorController.toggleStatus
);

export default router;

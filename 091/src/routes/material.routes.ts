import { Router } from 'express';
import * as materialController from '../controllers/material.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { operationLogMiddleware } from '../middlewares/operation-log.middleware';
import { OperationType } from '../models/operation-log.model';
import { UserRole } from '../constants/role.constants';

const router = Router();

router.use(authMiddleware);

router.get('/', ...materialController.findAll);

router.get('/:id', ...materialController.findOne);

router.get('/traceability/:batchNo', ...materialController.getTraceability);

router.post(
  '/',
  requireRoles([UserRole.ADMIN, UserRole.OPERATION, UserRole.WAREHOUSE]),
  operationLogMiddleware({ module: 'material', operation: OperationType.CREATE, description: '创建原料档案' }),
  ...materialController.create
);

router.put(
  '/:id',
  requireRoles([UserRole.ADMIN, UserRole.OPERATION, UserRole.WAREHOUSE]),
  operationLogMiddleware({ module: 'material', operation: OperationType.UPDATE, description: '更新原料档案' }),
  ...materialController.update
);

router.patch(
  '/:id/status',
  requireRoles([UserRole.ADMIN, UserRole.WAREHOUSE]),
  operationLogMiddleware({ module: 'material', operation: OperationType.UPDATE, description: '更新原料状态' }),
  ...materialController.updateStatus
);

router.post(
  '/:id/aging',
  requireRoles([UserRole.ADMIN, UserRole.WAREHOUSE]),
  operationLogMiddleware({ module: 'material', operation: OperationType.UPDATE, description: '开始陈化' }),
  ...materialController.startAging
);

router.patch(
  '/:id/toggle-lock',
  requireRoles([UserRole.ADMIN, UserRole.WAREHOUSE]),
  operationLogMiddleware({ module: 'material', operation: OperationType.UPDATE, description: '锁定/解锁原料' }),
  ...materialController.toggleLock
);

router.get('/stats/origin', ...materialController.getOriginStats);
router.get('/stats/status', ...materialController.getStatusStats);

export default router;

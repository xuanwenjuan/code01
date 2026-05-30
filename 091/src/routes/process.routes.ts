import { Router } from 'express';
import * as processController from '../controllers/process.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { operationLogMiddleware } from '../middlewares/operation-log.middleware';
import { OperationType } from '../models/operation-log.model';
import { UserRole } from '../constants/role.constants';

const router = Router();

router.use(authMiddleware);

router.get('/', ...processController.findAll);

router.get('/:id', ...processController.findOne);

router.get('/chain/:materialId', ...processController.getProcessChain);

router.post(
  '/',
  requireRoles([UserRole.ADMIN, UserRole.PROCESSOR]),
  operationLogMiddleware({ module: 'process', operation: OperationType.CREATE, description: '创建加工记录' }),
  ...processController.create
);

router.patch(
  '/:id/status',
  requireRoles([UserRole.ADMIN, UserRole.PROCESSOR]),
  operationLogMiddleware({ module: 'process', operation: OperationType.UPDATE, description: '更新加工状态' }),
  ...processController.updateStatus
);

router.put(
  '/:id/details',
  requireRoles([UserRole.ADMIN, UserRole.PROCESSOR]),
  operationLogMiddleware({ module: 'process', operation: OperationType.UPDATE, description: '更新加工详情' }),
  ...processController.updateProcessDetails
);

export default router;

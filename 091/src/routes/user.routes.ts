import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { operationLogMiddleware } from '../middlewares/operation-log.middleware';
import { OperationType } from '../models/operation-log.model';
import { UserRole } from '../constants/role.constants';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles([UserRole.ADMIN]));

router.get('/', ...userController.findAll);

router.get('/:id', ...userController.findOne);

router.post(
  '/',
  operationLogMiddleware({ module: 'user', operation: OperationType.CREATE, description: '创建用户' }),
  ...userController.create
);

router.put(
  '/:id',
  operationLogMiddleware({ module: 'user', operation: OperationType.UPDATE, description: '更新用户' }),
  ...userController.update
);

router.delete(
  '/:id',
  operationLogMiddleware({ module: 'user', operation: OperationType.DELETE, description: '删除用户' }),
  ...userController.remove
);

router.patch(
  '/:id/toggle-active',
  operationLogMiddleware({ module: 'user', operation: OperationType.UPDATE, description: '启用/禁用用户' }),
  ...userController.toggleActive
);

export default router;

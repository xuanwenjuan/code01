import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { operationLogMiddleware } from '../middlewares/operation-log.middleware';
import { OperationType } from '../models/operation-log.model';
import { UserRole } from '../constants/role.constants';

const router = Router();

router.use(authMiddleware);

router.get('/', ...categoryController.findAll);

router.get('/:id', ...categoryController.findOne);
router.get('/:id/chain', ...categoryController.getCategoryChain);

router.post(
  '/',
  requireRoles([UserRole.ADMIN, UserRole.OPERATION]),
  operationLogMiddleware({ module: 'category', operation: OperationType.CREATE, description: '创建原料类目' }),
  ...categoryController.create
);

router.put(
  '/:id',
  requireRoles([UserRole.ADMIN, UserRole.OPERATION]),
  operationLogMiddleware({ module: 'category', operation: OperationType.UPDATE, description: '更新原料类目' }),
  ...categoryController.update
);

router.delete(
  '/:id',
  requireRoles([UserRole.ADMIN]),
  operationLogMiddleware({ module: 'category', operation: OperationType.DELETE, description: '删除原料类目' }),
  ...categoryController.remove
);

router.patch(
  '/:id/seal',
  requireRoles([UserRole.ADMIN, UserRole.OPERATION]),
  operationLogMiddleware({ module: 'category', operation: OperationType.UPDATE, description: '切换类目封存状态' }),
  ...categoryController.toggleSeal
);

router.post(
  '/sort',
  requireRoles([UserRole.ADMIN, UserRole.OPERATION]),
  operationLogMiddleware({ module: 'category', operation: OperationType.UPDATE, description: '更新类目排序' }),
  ...categoryController.updateSortOrder
);

export default router;

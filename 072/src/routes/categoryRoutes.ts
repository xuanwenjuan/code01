import { Router } from 'express';
import {
  getCategoryTree,
  getCategoryById,
  getCategoryWithChildren,
  getActiveCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate } from '../middleware/validation';
import {
  createCategorySchema,
  updateCategorySchema,
  toggleCategoryStatusSchema
} from '../validation/categoryValidation';
import { UserRole } from '../types';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/active', getActiveCategories);
router.get('/:id', getCategoryById);
router.get('/:id/with-children', getCategoryWithChildren);

router.use(authenticate);

router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '活动类目', operation: '创建类目' }),
  validate(createCategorySchema),
  createCategory
);

router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '活动类目', operation: '更新类目' }),
  validate(updateCategorySchema),
  updateCategory
);

router.patch('/:id/status',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '活动类目', operation: '状态切换' }),
  validate(toggleCategoryStatusSchema),
  toggleCategoryStatus
);

router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN),
  operationLog({ module: '活动类目', operation: '删除类目' }),
  deleteCategory
);

export default router;

import { Router } from 'express';
import { productCategoryController } from '../controllers/productCategory.controller';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validationRules } from '../middleware/validation';
import { UserRole } from '../types/common';
import { OperationType } from '../database/models/operationLog.model';

const router = Router();

router.use(authenticate);

router.get('/tree', productCategoryController.getTree);
router.get(
  '/:id',
  [...validationRules.idParam, validate],
  productCategoryController.getById
);
router.get(
  '/',
  [...validationRules.pagination, validate],
  productCategoryController.getList
);

router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post(
  '/',
  [...validationRules.productCategory.create, validate],
  logOperation('产品分类', OperationType.CREATE),
  productCategoryController.create
);
router.put(
  '/:id',
  [...validationRules.productCategory.update, validate],
  logOperation('产品分类', OperationType.UPDATE),
  productCategoryController.update
);
router.delete(
  '/:id',
  [...validationRules.idParam, validate],
  logOperation('产品分类', OperationType.DELETE),
  productCategoryController.delete
);
router.patch(
  '/:id/toggle-status',
  [...validationRules.idParam, validate],
  logOperation('产品分类', OperationType.UPDATE),
  productCategoryController.toggleStatus
);
router.patch(
  '/sort-order',
  [...validationRules.productCategory.updateSortOrder, validate],
  logOperation('产品分类', OperationType.UPDATE),
  productCategoryController.updateSortOrder
);

export default router;

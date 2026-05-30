import { Router } from 'express';
import authController from '../controllers/auth.controller';
import categoryController from '../controllers/category.controller';
import materialController from '../controllers/material.controller';
import requisitionController from '../controllers/requisition.controller';
import inventoryController from '../controllers/inventory.controller';
import alertController from '../controllers/alert.controller';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';
import { validate } from '../middlewares/validation';
import { RoleCode, roleMiddleware } from '../middlewares/roleAuth';
import {
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation
} from '../validations/category.validation';
import {
  createMaterialValidation,
  updateMaterialValidation,
  stockInOutValidation
} from '../validations/material.validation';
import {
  createRequisitionValidation,
  approveRequisitionValidation,
  requisitionIdValidation
} from '../validations/requisition.validation';
import {
  createInventoryCheckValidation,
  updateInventoryItemsValidation,
  inventoryCheckIdValidation,
  recordLossValidation
} from '../validations/inventory.validation';

const router = Router();

router.post('/auth/login', asyncHandler(authController.login));

router.get('/categories/tree', authMiddleware, asyncHandler(categoryController.getTree));
router.get('/categories', authMiddleware, asyncHandler(categoryController.getList));
router.get('/categories/:id', authMiddleware, asyncHandler(categoryController.getById));
router.post(
  '/categories',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(createCategoryValidation),
  asyncHandler(categoryController.create)
);
router.put(
  '/categories/:id',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(updateCategoryValidation),
  asyncHandler(categoryController.update)
);
router.post(
  '/categories/:id/archive',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(deleteCategoryValidation),
  asyncHandler(categoryController.archive)
);
router.post(
  '/categories/:id/unarchive',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(deleteCategoryValidation),
  asyncHandler(categoryController.unarchive)
);
router.delete(
  '/categories/:id',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN]),
  validate(deleteCategoryValidation),
  asyncHandler(categoryController.delete)
);

router.get('/materials', authMiddleware, asyncHandler(materialController.getList));
router.get('/materials/:id', authMiddleware, asyncHandler(materialController.getById));
router.post(
  '/materials',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(createMaterialValidation),
  asyncHandler(materialController.create)
);
router.put(
  '/materials/:id',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(updateMaterialValidation),
  asyncHandler(materialController.update)
);
router.delete(
  '/materials/:id',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN]),
  asyncHandler(materialController.delete)
);
router.post(
  '/materials/stock-in',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(stockInOutValidation),
  asyncHandler(materialController.stockIn)
);
router.post(
  '/materials/stock-out',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(stockInOutValidation),
  asyncHandler(materialController.stockOut)
);
router.get('/stock-logs', authMiddleware, asyncHandler(materialController.getStockLogs));

router.get('/requisitions', authMiddleware, asyncHandler(requisitionController.getList));
router.get('/requisitions/:id', authMiddleware, validate(requisitionIdValidation), asyncHandler(requisitionController.getById));
router.post(
  '/requisitions',
  authMiddleware,
  validate(createRequisitionValidation),
  asyncHandler(requisitionController.create)
);
router.post(
  '/requisitions/:id/submit',
  authMiddleware,
  validate(requisitionIdValidation),
  asyncHandler(requisitionController.submit)
);
router.post(
  '/requisitions/:id/approve',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.DEPT_MANAGER]),
  validate(approveRequisitionValidation),
  asyncHandler(requisitionController.approve)
);
router.post(
  '/requisitions/:id/deliver',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(requisitionIdValidation),
  asyncHandler(requisitionController.deliver)
);
router.post(
  '/requisitions/:id/cancel',
  authMiddleware,
  validate(requisitionIdValidation),
  asyncHandler(requisitionController.cancel)
);

router.get('/inventory-checks', authMiddleware, asyncHandler(inventoryController.getList));
router.get('/inventory-checks/:id', authMiddleware, validate(inventoryCheckIdValidation), asyncHandler(inventoryController.getById));
router.post(
  '/inventory-checks',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(createInventoryCheckValidation),
  asyncHandler(inventoryController.create)
);
router.put(
  '/inventory-checks/:id/items',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(updateInventoryItemsValidation),
  asyncHandler(inventoryController.updateItems)
);
router.post(
  '/inventory-checks/:id/confirm',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(inventoryCheckIdValidation),
  asyncHandler(inventoryController.confirm)
);
router.post(
  '/inventory-checks/:id/complete',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(inventoryCheckIdValidation),
  asyncHandler(inventoryController.complete)
);
router.post(
  '/loss',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  validate(recordLossValidation),
  asyncHandler(inventoryController.recordLoss)
);

router.get('/low-stock-alerts', authMiddleware, asyncHandler(alertController.getList));
router.get('/low-stock-alerts/:id', authMiddleware, asyncHandler(alertController.getById));
router.get('/low-stock-alerts/pending/count', authMiddleware, asyncHandler(alertController.getPendingCount));
router.post(
  '/low-stock-alerts/:id/process',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  asyncHandler(alertController.processAlert)
);
router.post(
  '/low-stock-alerts/:id/ignore',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  asyncHandler(alertController.ignoreAlert)
);
router.post(
  '/low-stock-alerts/batch/process',
  authMiddleware,
  roleMiddleware([RoleCode.SUPER_ADMIN, RoleCode.WAREHOUSE_MANAGER]),
  asyncHandler(alertController.batchProcess)
);

export default router;

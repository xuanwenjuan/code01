import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import * as authController from '../controllers/authController';
import * as plantCategoryController from '../controllers/plantCategoryController';
import * as plantController from '../controllers/plantController';
import * as workOrderController from '../controllers/workOrderController';
import * as materialController from '../controllers/materialController';
import { roleMiddleware } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();

// 公开路由
router.post('/auth/login', authController.login);

// 需要认证的路由
router.use(authMiddleware);

router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/change-password', authController.changePassword);

// 绿植分类路由
router.get('/plant-categories', plantCategoryController.getAllCategories);
router.get('/plant-categories/:id', plantCategoryController.getCategoryById);
router.post(
  '/plant-categories',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  plantCategoryController.createCategory
);
router.put(
  '/plant-categories/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  plantCategoryController.updateCategory
);
router.delete(
  '/plant-categories/:id',
  roleMiddleware(UserRole.ADMIN),
  plantCategoryController.deleteCategory
);
router.patch(
  '/plant-categories/:id/status',
  roleMiddleware(UserRole.ADMIN),
  plantCategoryController.toggleCategoryStatus
);

// 绿植档案路由
router.get('/plants', plantController.getPlants);
router.get('/plants/:id', plantController.getPlantById);
router.post(
  '/plants',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  plantController.createPlant
);
router.put(
  '/plants/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  plantController.updatePlant
);
router.delete(
  '/plants/:id',
  roleMiddleware(UserRole.ADMIN),
  plantController.deletePlant
);
router.patch(
  '/plants/:id/health-status',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.MAINTENANCE_WORKER),
  plantController.updateHealthStatus
);
router.patch(
  '/plants/:id/pest-warning',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.MAINTENANCE_WORKER),
  plantController.togglePestWarning
);
router.post(
  '/plants/:id/maintenance',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.MAINTENANCE_WORKER),
  plantController.recordMaintenance
);

// 工单路由
router.get('/work-orders', workOrderController.getWorkOrders);
router.get('/work-orders/:id', workOrderController.getWorkOrderById);
router.post(
  '/work-orders',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  workOrderController.createWorkOrder
);
router.patch(
  '/work-orders/:id/assign',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  workOrderController.assignWorkOrder
);
router.patch(
  '/work-orders/:id/accept',
  roleMiddleware(UserRole.MAINTENANCE_WORKER),
  workOrderController.acceptWorkOrder
);
router.patch(
  '/work-orders/:id/start',
  roleMiddleware(UserRole.MAINTENANCE_WORKER),
  workOrderController.startWorkOrder
);
router.patch(
  '/work-orders/:id/complete',
  roleMiddleware(UserRole.MAINTENANCE_WORKER),
  workOrderController.completeWorkOrder
);
router.patch(
  '/work-orders/:id/verify',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  workOrderController.verifyWorkOrder
);
router.patch(
  '/work-orders/:id/cancel',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER),
  workOrderController.cancelWorkOrder
);

// 物资路由
router.get(
  '/materials',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.PURCHASER, UserRole.MAINTENANCE_WORKER),
  materialController.getMaterials
);
router.get(
  '/materials/statistics',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.PURCHASER),
  materialController.getMaterialStatistics
);
router.get(
  '/materials/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.PURCHASER, UserRole.MAINTENANCE_WORKER),
  materialController.getMaterialById
);
router.post(
  '/materials',
  roleMiddleware(UserRole.ADMIN, UserRole.PURCHASER),
  materialController.createMaterial
);
router.put(
  '/materials/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.PURCHASER),
  materialController.updateMaterial
);
router.delete(
  '/materials/:id',
  roleMiddleware(UserRole.ADMIN),
  materialController.deleteMaterial
);
router.post(
  '/materials/use',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.MAINTENANCE_WORKER),
  materialController.useMaterial
);
router.get(
  '/material-usages',
  roleMiddleware(UserRole.ADMIN, UserRole.AREA_MANAGER, UserRole.PURCHASER, UserRole.MAINTENANCE_WORKER),
  materialController.getMaterialUsage
);

export default router;

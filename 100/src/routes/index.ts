import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as categoryController from '../controllers/categoryController';
import * as stockController from '../controllers/stockController';
import * as orderController from '../controllers/orderController';
import * as costController from '../controllers/costController';
import * as materialLockController from '../controllers/materialLockController';
import * as materialWasteController from '../controllers/materialWasteController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);

router.get('/categories/tree', categoryController.getCategoryTree);
router.get('/categories', categoryController.getCategoryList);
router.get('/categories/:id', categoryController.getCategoryDetail);
router.get('/categories/:id/path', categoryController.getCategoryPath);
router.post('/categories', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), categoryController.createCategory);
router.put('/categories/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), categoryController.deleteCategory);
router.post('/categories/:id/seal', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), categoryController.sealCategory);
router.post('/categories/:id/activate', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), categoryController.activateCategory);

router.get('/stocks', authMiddleware, stockController.getStockList);
router.get('/stocks/expiring', authMiddleware, stockController.getExpiringStocks);
router.get('/stocks/statistics', authMiddleware, stockController.getStockStatistics);
router.get('/stocks/:id', authMiddleware, stockController.getStockDetail);
router.post('/stocks', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), stockController.createStock);
router.put('/stocks/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), stockController.updateStock);
router.put('/stocks/:id/status', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), stockController.updateStockStatus);
router.post('/stocks/:id/in', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), stockController.stockIn);
router.post('/stocks/:id/out', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), stockController.stockOut);
router.delete('/stocks/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), stockController.deleteStock);
router.post('/stocks/batch/status', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), stockController.batchUpdateStatus);

router.get('/orders', authMiddleware, orderController.getOrderList);
router.get('/orders/my', authMiddleware, orderController.getMyOrders);
router.get('/orders/statistics', authMiddleware, orderController.getOrderStatistics);
router.get('/orders/:id', authMiddleware, orderController.getOrderDetail);
router.get('/orders/:id/traces', authMiddleware, orderController.getOrderTraces);
router.get('/orders/:id/materials', authMiddleware, orderController.getOrderMaterials);
router.post('/orders', authMiddleware, orderController.createOrder);
router.put('/orders/:id', authMiddleware, orderController.updateOrder);
router.put('/orders/:id/status', authMiddleware, orderController.updateOrderStatus);
router.post('/orders/:id/complete', authMiddleware, orderController.completeOrder);
router.put('/orders/:id/assign', authMiddleware, orderController.assignWorker);
router.post('/orders/:id/materials', authMiddleware, orderController.addOrderMaterial);
router.post('/orders/suspend-timeout', authMiddleware, roleMiddleware(UserRole.ADMIN), orderController.suspendTimeoutOrders);
router.post('/orders/batch/status', authMiddleware, roleMiddleware(UserRole.ADMIN), orderController.batchUpdateOrderStatus);

router.get('/material-locks', authMiddleware, materialLockController.getMaterialLocks);
router.get('/material-locks/:id', authMiddleware, materialLockController.getLockDetail);
router.post('/material-locks', authMiddleware, materialLockController.lockMaterialForOrder);
router.put('/material-locks/:id/release', authMiddleware, materialLockController.releaseMaterialLock);

router.get('/wastes', authMiddleware, materialWasteController.getWasteList);
router.get('/wastes/statistics', authMiddleware, materialWasteController.getWasteStatistics);
router.get('/wastes/:id', authMiddleware, materialWasteController.getWasteDetail);
router.post('/wastes', authMiddleware, materialWasteController.reportWaste);
router.put('/wastes/:id/verify', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MATERIAL_ADMIN), materialWasteController.verifyWaste);

router.get('/costs', authMiddleware, costController.getLedgerList);
router.get('/costs/statistics', authMiddleware, costController.getCostStatistics);
router.get('/costs/overview', authMiddleware, costController.getCostOverview);
router.get('/costs/order-comparison', authMiddleware, costController.getOrderCostComparison);
router.get('/costs/category-analysis', authMiddleware, costController.getCategoryCostAnalysis);
router.get('/costs/consumption-trend', authMiddleware, costController.getMaterialConsumptionTrend);
router.get('/costs/:id', authMiddleware, costController.getLedgerDetail);
router.post('/costs', authMiddleware, costController.generateLedger);
router.delete('/costs/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), costController.deleteLedger);

export default router;

import { Router } from 'express';
import { authenticate, authorizeOwnOrAdmin, checkPermission } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import * as categoryController from '../controllers/categoryController';
import * as productController from '../controllers/productController';
import * as materialController from '../controllers/materialController';
import * as orderController from '../controllers/orderController';
import * as ledgerController from '../controllers/ledgerController';

const router = Router();

router.use(operationLog);

router.post('/auth/login', authController.loginValidation, authController.login);
router.get('/auth/me', authenticate, authController.getCurrentUser);

router.get('/users', authenticate, checkPermission('user', 'read'), userController.getUserList);
router.get('/users/:id', authenticate, authorizeOwnOrAdmin(), userController.getUserById);
router.post('/users', authenticate, checkPermission('user', 'create'), userController.createUserValidation, userController.createUser);
router.put('/users/:id', authenticate, authorizeOwnOrAdmin(), userController.updateUserValidation, userController.updateUser);
router.patch('/users/:id/password', authenticate, userController.updatePasswordValidation, userController.updatePassword);
router.patch('/users/:id/toggle-status', authenticate, checkPermission('user', 'update'), userController.toggleUserStatus);
router.delete('/users/:id', authenticate, checkPermission('user', 'delete'), userController.deleteUser);

router.get('/categories/tree', categoryController.getCategoryTree);
router.get('/categories', categoryController.getCategoryList);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', authenticate, checkPermission('category', 'create'), categoryController.createCategoryValidation, categoryController.createCategory);
router.put('/categories/:id', authenticate, checkPermission('category', 'update'), categoryController.updateCategoryValidation, categoryController.updateCategory);
router.delete('/categories/:id', authenticate, checkPermission('category', 'delete'), categoryController.deleteCategory);

router.get('/products', productController.getProductList);
router.get('/products/:id', productController.getProductById);
router.post('/products', authenticate, checkPermission('product', 'create'), productController.createProductValidation, productController.createProduct);
router.put('/products/:id', authenticate, checkPermission('product', 'update'), productController.updateProductValidation, productController.updateProduct);
router.delete('/products/:id', authenticate, checkPermission('product', 'delete'), productController.deleteProduct);

router.get('/materials/low-stock', authenticate, checkPermission('material', 'read'), materialController.getLowStockMaterials);
router.get('/materials', authenticate, checkPermission('material', 'read'), materialController.getMaterialList);
router.get('/materials/:id', authenticate, checkPermission('material', 'read'), materialController.getMaterialById);
router.get('/statistics/materials', authenticate, checkPermission('material', 'read'), materialController.getMaterialStatistics);
router.post('/materials', authenticate, checkPermission('material', 'create'), materialController.createMaterialValidation, materialController.createMaterial);
router.put('/materials/:id', authenticate, checkPermission('material', 'update'), materialController.updateMaterialValidation, materialController.updateMaterial);
router.patch('/materials/:id/stock', authenticate, checkPermission('material', 'stockOut'), materialController.stockOperationValidation, materialController.updateStock);
router.post('/materials/lock-stock', authenticate, checkPermission('material', 'stockOut'), materialController.stockLockValidation, materialController.lockStock);
router.patch('/materials/unlock-stock/:id', authenticate, checkPermission('material', 'stockOut'), materialController.unlockStock);
router.post('/materials/batch-stock', authenticate, checkPermission('material', 'stockOut'), materialController.batchUpdateStock);
router.delete('/materials/:id', authenticate, checkPermission('material', 'delete'), materialController.deleteMaterial);

router.get('/orders', authenticate, checkPermission('order', 'read'), orderController.getOrderList);
router.get('/orders/:id', authenticate, checkPermission('order', 'read'), orderController.getOrderById);
router.get('/orders/:id/logs', authenticate, checkPermission('order', 'read'), orderController.getOrderLogs);
router.get('/statistics/orders', authenticate, checkPermission('order', 'read'), orderController.getOrderStatistics);
router.post('/orders', authenticate, checkPermission('order', 'create'), orderController.createOrderValidation, orderController.createOrder);
router.put('/orders/:id', authenticate, checkPermission('order', 'update'), orderController.updateOrder);
router.patch('/orders/:id/status', authenticate, checkPermission('order', 'statusChange'), orderController.updateOrderStatusValidation, orderController.updateOrderStatus);
router.patch('/orders/:id/cancel', authenticate, checkPermission('order', 'statusChange'), orderController.cancelOrder);
router.patch('/orders/:id/schedule', authenticate, checkPermission('order', 'statusChange'), orderController.scheduleProductionValidation, orderController.scheduleProduction);
router.post('/orders/:id/return', authenticate, checkPermission('order', 'return'), orderController.returnApplicationValidation, orderController.createReturnApplication);
router.patch('/orders/:id/approve-return', authenticate, checkPermission('order', 'return'), orderController.approveReturnValidation, orderController.approveReturn);

router.get('/ledgers', authenticate, checkPermission('ledger', 'read'), ledgerController.getLedgerList);
router.get('/ledgers/:id', authenticate, checkPermission('ledger', 'read'), ledgerController.getLedgerById);
router.get('/statistics/ledgers', authenticate, checkPermission('ledger', 'read'), ledgerController.getLedgerStatistics);
router.get('/ledgers/export', authenticate, checkPermission('ledger', 'read'), ledgerController.exportLedgerReport);
router.post('/ledgers', authenticate, checkPermission('ledger', 'create'), ledgerController.createLedgerValidation, ledgerController.createLedger);
router.put('/ledgers/:id', authenticate, checkPermission('ledger', 'update'), ledgerController.updateLedgerValidation, ledgerController.updateLedger);
router.patch('/ledgers/:id/audit', authenticate, checkPermission('ledger', 'audit'), ledgerController.auditLedger);
router.delete('/ledgers/:id', authenticate, checkPermission('ledger', 'delete'), ledgerController.deleteLedger);

export default router;
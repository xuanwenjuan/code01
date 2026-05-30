"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const operationLog_1 = require("../middleware/operationLog");
const authController = __importStar(require("../controllers/authController"));
const userController = __importStar(require("../controllers/userController"));
const categoryController = __importStar(require("../controllers/categoryController"));
const productController = __importStar(require("../controllers/productController"));
const materialController = __importStar(require("../controllers/materialController"));
const orderController = __importStar(require("../controllers/orderController"));
const ledgerController = __importStar(require("../controllers/ledgerController"));
const router = (0, express_1.Router)();
router.use(operationLog_1.operationLog);
router.post('/auth/login', authController.loginValidation, authController.login);
router.get('/auth/me', auth_1.authenticate, authController.getCurrentUser);
router.get('/users', auth_1.authenticate, (0, auth_1.checkPermission)('user', 'read'), userController.getUserList);
router.get('/users/:id', auth_1.authenticate, (0, auth_1.authorizeOwnOrAdmin)(), userController.getUserById);
router.post('/users', auth_1.authenticate, (0, auth_1.checkPermission)('user', 'create'), userController.createUserValidation, userController.createUser);
router.put('/users/:id', auth_1.authenticate, (0, auth_1.authorizeOwnOrAdmin)(), userController.updateUserValidation, userController.updateUser);
router.patch('/users/:id/password', auth_1.authenticate, userController.updatePasswordValidation, userController.updatePassword);
router.patch('/users/:id/toggle-status', auth_1.authenticate, (0, auth_1.checkPermission)('user', 'update'), userController.toggleUserStatus);
router.delete('/users/:id', auth_1.authenticate, (0, auth_1.checkPermission)('user', 'delete'), userController.deleteUser);
router.get('/categories/tree', categoryController.getCategoryTree);
router.get('/categories', categoryController.getCategoryList);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', auth_1.authenticate, (0, auth_1.checkPermission)('category', 'create'), categoryController.createCategoryValidation, categoryController.createCategory);
router.put('/categories/:id', auth_1.authenticate, (0, auth_1.checkPermission)('category', 'update'), categoryController.updateCategoryValidation, categoryController.updateCategory);
router.delete('/categories/:id', auth_1.authenticate, (0, auth_1.checkPermission)('category', 'delete'), categoryController.deleteCategory);
router.get('/products', productController.getProductList);
router.get('/products/:id', productController.getProductById);
router.post('/products', auth_1.authenticate, (0, auth_1.checkPermission)('product', 'create'), productController.createProductValidation, productController.createProduct);
router.put('/products/:id', auth_1.authenticate, (0, auth_1.checkPermission)('product', 'update'), productController.updateProductValidation, productController.updateProduct);
router.delete('/products/:id', auth_1.authenticate, (0, auth_1.checkPermission)('product', 'delete'), productController.deleteProduct);
router.get('/materials/low-stock', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'read'), materialController.getLowStockMaterials);
router.get('/materials', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'read'), materialController.getMaterialList);
router.get('/materials/:id', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'read'), materialController.getMaterialById);
router.get('/statistics/materials', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'read'), materialController.getMaterialStatistics);
router.post('/materials', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'create'), materialController.createMaterialValidation, materialController.createMaterial);
router.put('/materials/:id', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'update'), materialController.updateMaterialValidation, materialController.updateMaterial);
router.patch('/materials/:id/stock', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'stockOut'), materialController.stockOperationValidation, materialController.updateStock);
router.post('/materials/lock-stock', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'stockOut'), materialController.stockLockValidation, materialController.lockStock);
router.patch('/materials/unlock-stock/:id', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'stockOut'), materialController.unlockStock);
router.post('/materials/batch-stock', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'stockOut'), materialController.batchUpdateStock);
router.delete('/materials/:id', auth_1.authenticate, (0, auth_1.checkPermission)('material', 'delete'), materialController.deleteMaterial);
router.get('/orders', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'read'), orderController.getOrderList);
router.get('/orders/:id', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'read'), orderController.getOrderById);
router.get('/orders/:id/logs', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'read'), orderController.getOrderLogs);
router.get('/statistics/orders', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'read'), orderController.getOrderStatistics);
router.post('/orders', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'create'), orderController.createOrderValidation, orderController.createOrder);
router.put('/orders/:id', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'update'), orderController.updateOrder);
router.patch('/orders/:id/status', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'statusChange'), orderController.updateOrderStatusValidation, orderController.updateOrderStatus);
router.patch('/orders/:id/cancel', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'statusChange'), orderController.cancelOrder);
router.patch('/orders/:id/schedule', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'statusChange'), orderController.scheduleProductionValidation, orderController.scheduleProduction);
router.post('/orders/:id/return', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'return'), orderController.returnApplicationValidation, orderController.createReturnApplication);
router.patch('/orders/:id/approve-return', auth_1.authenticate, (0, auth_1.checkPermission)('order', 'return'), orderController.approveReturnValidation, orderController.approveReturn);
router.get('/ledgers', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'read'), ledgerController.getLedgerList);
router.get('/ledgers/:id', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'read'), ledgerController.getLedgerById);
router.get('/statistics/ledgers', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'read'), ledgerController.getLedgerStatistics);
router.get('/ledgers/export', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'read'), ledgerController.exportLedgerReport);
router.post('/ledgers', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'create'), ledgerController.createLedgerValidation, ledgerController.createLedger);
router.put('/ledgers/:id', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'update'), ledgerController.updateLedgerValidation, ledgerController.updateLedger);
router.patch('/ledgers/:id/audit', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'audit'), ledgerController.auditLedger);
router.delete('/ledgers/:id', auth_1.authenticate, (0, auth_1.checkPermission)('ledger', 'delete'), ledgerController.deleteLedger);
exports.default = router;
//# sourceMappingURL=index.js.map
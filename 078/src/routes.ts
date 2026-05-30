import { Router } from 'express';
import { authMiddleware, roleMiddleware } from './middleware/auth';
import { validate, categorySchemas, supplierSchemas, claimSchemas, settlementSchemas, authSchemas } from './middleware/validation';
import * as authController from './controllers/authController';
import * as categoryController from './controllers/categoryController';
import * as supplierController from './controllers/supplierController';
import * as productController from './controllers/productController';
import * as batchController from './controllers/batchController';
import * as claimController from './controllers/claimController';
import * as settlementController from './controllers/settlementController';
import { UserRole } from './models/User';

const router = Router();

const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/auth/login', validate(authSchemas.login), asyncHandler(authController.login));
router.post('/auth/register', validate(authSchemas.register), asyncHandler(authController.register));
router.get('/auth/me', authMiddleware, asyncHandler(authController.getCurrentUser));
router.put('/auth/password', authMiddleware, asyncHandler(authController.changePassword));

const ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
const SETTLEMENT_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE];
const APPROVE_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];

router.get('/categories/tree', authMiddleware, asyncHandler(categoryController.getCategoryTree));
router.get('/categories', authMiddleware, validate(categorySchemas.query), asyncHandler(categoryController.getCategoryList));
router.get('/categories/:id', authMiddleware, asyncHandler(categoryController.getCategoryById));
router.post('/categories', authMiddleware, roleMiddleware(...ADMIN_ROLES), validate(categorySchemas.create), asyncHandler(categoryController.createCategory));
router.put('/categories/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), validate(categorySchemas.update), asyncHandler(categoryController.updateCategory));
router.delete('/categories/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(categoryController.deleteCategory));
router.put('/categories/:id/stop', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(categoryController.toggleStop));

router.get('/suppliers', authMiddleware, validate(supplierSchemas.query), asyncHandler(supplierController.getSupplierList));
router.get('/suppliers/expiring', authMiddleware, asyncHandler(supplierController.getExpiringSuppliers));
router.get('/suppliers/statistics', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), asyncHandler(supplierController.getSupplierStatistics));
router.get('/suppliers/:id', authMiddleware, asyncHandler(supplierController.getSupplierById));
router.post('/suppliers', authMiddleware, roleMiddleware(...ADMIN_ROLES), validate(supplierSchemas.create), asyncHandler(supplierController.createSupplier));
router.put('/suppliers/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), validate(supplierSchemas.update), asyncHandler(supplierController.updateSupplier));
router.put('/suppliers/:id/score', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(supplierController.updatePerformanceScore));
router.put('/suppliers/:id/status', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(supplierController.toggleSupplierStatus));
router.delete('/suppliers/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(supplierController.deleteSupplier));

router.get('/products', authMiddleware, asyncHandler(productController.getProductList));
router.get('/products/:id', authMiddleware, asyncHandler(productController.getProductById));
router.post('/products', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(productController.createProduct));
router.put('/products/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(productController.updateProduct));
router.delete('/products/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(productController.deleteProduct));
router.put('/products/:id/status', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(productController.toggleStatus));

router.get('/batches', authMiddleware, asyncHandler(batchController.getBatchList));
router.get('/batches/active', authMiddleware, asyncHandler(batchController.getActiveBatches));
router.get('/batches/:id', authMiddleware, asyncHandler(batchController.getBatchById));
router.post('/batches', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(batchController.createBatch));
router.put('/batches/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(batchController.updateBatch));
router.delete('/batches/:id', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(batchController.deleteBatch));
router.put('/batches/:id/publish', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(batchController.publishBatch));

router.get('/claims', authMiddleware, validate(claimSchemas.query), asyncHandler(claimController.getClaimList));
router.get('/claims/statistics', authMiddleware, asyncHandler(claimController.getClaimStatistics));
router.get('/claims/:id', authMiddleware, asyncHandler(claimController.getClaimById));
router.post('/claims', authMiddleware, validate(claimSchemas.create), asyncHandler(claimController.createClaim));
router.put('/claims/:id/approve', authMiddleware, roleMiddleware(...APPROVE_ROLES), validate(claimSchemas.approve), asyncHandler(claimController.approveClaim));
router.put('/claims/batch-approve', authMiddleware, roleMiddleware(...APPROVE_ROLES), validate(claimSchemas.batchApprove), asyncHandler(claimController.batchApprove));
router.put('/claims/:id/ship', authMiddleware, roleMiddleware(...ADMIN_ROLES), validate(claimSchemas.ship), asyncHandler(claimController.shipClaim));
router.put('/claims/:id/receive', authMiddleware, asyncHandler(claimController.receiveClaim));
router.put('/claims/:id/cancel', authMiddleware, asyncHandler(claimController.cancelClaim));
router.post('/claims/:id/reissue', authMiddleware, roleMiddleware(...ADMIN_ROLES), asyncHandler(claimController.reissueClaim));

router.get('/settlements', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), validate(settlementSchemas.query), asyncHandler(settlementController.getSettlementList));
router.get('/settlements/statistics', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), asyncHandler(settlementController.getStatistics));
router.get('/settlements/ledger', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), validate(settlementSchemas.ledger), asyncHandler(settlementController.getLedger));
router.get('/settlements/export', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), validate(settlementSchemas.ledger), asyncHandler(settlementController.exportLedger));
router.get('/settlements/:id', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), asyncHandler(settlementController.getSettlementById));
router.post('/settlements', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), validate(settlementSchemas.create), asyncHandler(settlementController.createSettlement));
router.put('/settlements/:id/confirm', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), validate(settlementSchemas.confirm), asyncHandler(settlementController.confirmSettlement));
router.delete('/settlements/:id', authMiddleware, roleMiddleware(...SETTLEMENT_ROLES), asyncHandler(settlementController.deleteSettlement));

export default router;

import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { authController } from '../controllers/authController';
import { categoryController } from '../controllers/categoryController';
import { supplierController } from '../controllers/supplierController';
import { productController } from '../controllers/productController';
import { purchaseController } from '../controllers/purchaseController';
import { salesController } from '../controllers/salesController';
import { UserRole } from '../types';

const router = Router();

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/password', authMiddleware, authController.changePassword);

// Category routes
router.get('/categories/tree', categoryController.getTree);
router.get('/categories', categoryController.getList);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), validate(schemas.category.create), categoryController.create);
router.put('/categories/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), validate(schemas.category.update), categoryController.update);
router.delete('/categories/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), categoryController.delete);
router.put('/categories/:id/archive', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), categoryController.archive);
router.put('/categories/sort', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), categoryController.updateSort);

// Supplier routes
router.get('/suppliers', supplierController.getList);
router.get('/suppliers/brands', supplierController.getBrands);
router.get('/suppliers/expiring-qualifications', supplierController.getExpiringQualifications);
router.get('/suppliers/:id', supplierController.getById);
router.post('/suppliers', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), validate(schemas.supplier.create), supplierController.create);
router.put('/suppliers/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), validate(schemas.supplier.update), supplierController.update);
router.delete('/suppliers/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), supplierController.delete);

// Product routes
router.get('/products', productController.getList);
router.get('/products/low-stock', productController.getLowStock);
router.get('/products/:id', productController.getById);
router.post('/products', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), productController.create);
router.put('/products/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), productController.update);
router.delete('/products/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), productController.delete);

// Purchase routes
router.get('/purchases', purchaseController.getList);
router.get('/purchases/:id', purchaseController.getById);
router.post('/purchases', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE), validate(schemas.purchase.create), purchaseController.create);
router.put('/purchases/:id/receive', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE), purchaseController.receive);
router.put('/purchases/:id/accept', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE), purchaseController.accept);
router.put('/purchases/:id/complete', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), purchaseController.complete);
router.put('/purchases/:id/cancel', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), purchaseController.cancel);

// Sales routes
router.get('/sales', salesController.getList);
router.get('/sales/statistics', salesController.getStatistics);
router.get('/sales/debts', salesController.getDebtList);
router.get('/sales/:id', salesController.getById);
router.post('/sales', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES), validate(schemas.sales.create), salesController.create);
router.put('/sales/:id/confirm', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES), salesController.confirm);
router.put('/sales/:id/ship', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE), salesController.ship);
router.put('/sales/:id/deliver', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES), salesController.deliver);
router.put('/sales/:id/payment', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE), salesController.receivePayment);
router.put('/sales/:id/cancel', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.MANAGER), salesController.cancel);

export default router;

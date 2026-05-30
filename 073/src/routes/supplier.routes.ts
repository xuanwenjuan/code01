import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);
router.get('/', SupplierController.getList);
router.get('/active', SupplierController.getAllActive);
router.get('/expiring-soon', SupplierController.getExpiringSoon);
router.get('/expired', SupplierController.getExpired);
router.get('/statistics', SupplierController.getStatistics);
router.get('/:id', SupplierController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE));
router.post('/', validate(schemas.supplier.create), SupplierController.create);
router.put('/:id', validate(schemas.supplier.update), SupplierController.update);
router.patch('/:id/status', SupplierController.toggleStatus);
router.patch('/:id/approve', SupplierController.approve);

export default router;

import { Router } from 'express';
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierList,
  getSupplierDetail,
  getExpiringSuppliers,
  updateExpiredSupplierStatus,
  getSupplierStatistics
} from '../controllers/supplier.controller';
import { authenticate, authorizeManager, authorizeAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { supplierValidationRules, idParam } from '../validations/supplier.validation';

const router = Router();

router.get('/statistics', authenticate, getSupplierStatistics);
router.get('/expiring', authenticate, getExpiringSuppliers);
router.get('/', authenticate, getSupplierList);
router.get('/:id', authenticate, validate(idParam), getSupplierDetail);
router.post('/', authenticate, authorizeManager, validate(supplierValidationRules.create), createSupplier);
router.put('/:id', authenticate, authorizeManager, validate(supplierValidationRules.update), updateSupplier);
router.put('/update-expired-status', authenticate, authorizeAdmin, updateExpiredSupplierStatus);
router.delete('/:id', authenticate, authorizeAdmin, validate(idParam), deleteSupplier);

export default router;

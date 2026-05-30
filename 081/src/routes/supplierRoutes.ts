import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { UserRole } from '../types';
import {
  createSupplier,
  createSupplierValidation,
  updateSupplier,
  updateSupplierValidation,
  deleteSupplier,
  getSupplierList,
  getSupplierListValidation,
  getSupplierDetail,
  getSupplierStores,
  getExpiringSuppliers
} from '../controllers/supplierController';

const router = Router();

router.use(authenticate);

router.get('/', validate(getSupplierListValidation), getSupplierList);
router.get('/expiring', getExpiringSuppliers);
router.get('/:id', getSupplierDetail);
router.get('/:id/stores', getSupplierStores);

router.use(requireRoles(UserRole.HEADQUARTERS));

router.post(
  '/',
  validate(createSupplierValidation),
  operationLog('创建供应商'),
  createSupplier
);

router.put(
  '/:id',
  validate(updateSupplierValidation),
  operationLog('更新供应商'),
  updateSupplier
);

router.delete(
  '/:id',
  operationLog('删除供应商'),
  deleteSupplier
);

export default router;

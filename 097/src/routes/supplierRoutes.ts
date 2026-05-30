import { Router } from 'express';
import {
  createSupplier,
  getSupplierList,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  createPriceAdjustment,
  getPriceAdjustmentHistory,
  getSupplierSelectList,
  createSupplierSchema,
  updateSupplierSchema,
  priceAdjustmentSchema
} from '../controllers/supplierController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/select', authMiddleware, getSupplierSelectList);
router.get('/', authMiddleware, getSupplierList);
router.get('/:id', authMiddleware, getSupplierById);
router.post('/', authMiddleware, validate(createSupplierSchema), createSupplier);
router.put('/:id', authMiddleware, validate(updateSupplierSchema), updateSupplier);
router.delete('/:id', authMiddleware, deleteSupplier);

router.get('/price-adjustments/history', authMiddleware, getPriceAdjustmentHistory);
router.post('/price-adjustments', authMiddleware, validate(priceAdjustmentSchema), createPriceAdjustment);

export default router;

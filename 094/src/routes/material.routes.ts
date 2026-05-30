import { Router } from 'express';
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  updateStock,
  batchUpdateStock,
  deleteMaterial,
  getLowStockMaterials,
  getMaterialStatistics,
} from '../controllers/material.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createMaterialSchema, updateMaterialSchema, updateStockSchema, batchUpdateStockSchema } from '../validators/material.validator';
import { ROLES } from '../config';

const router = Router();

router.get('/', authenticate, getMaterials);
router.get('/low-stock', authenticate, getLowStockMaterials);
router.get('/statistics', authenticate, authorize(ROLES.MATERIAL_ADMIN, ROLES.FINANCE, ROLES.ADMIN), getMaterialStatistics);
router.get('/:id', authenticate, getMaterialById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  validate(createMaterialSchema),
  createMaterial
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  validate(updateMaterialSchema),
  updateMaterial
);

router.patch(
  '/:id/stock',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  validate(updateStockSchema),
  updateStock
);

router.post(
  '/batch-stock',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  validate(batchUpdateStockSchema),
  batchUpdateStock
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  deleteMaterial
);

export default router;

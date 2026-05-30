import { Router } from 'express';
import {
  createMaterialConsumption,
  getMaterialConsumptions,
  getMaterialConsumptionById,
  updateMaterialConsumption,
  deleteMaterialConsumption,
  getMaterialLedger,
  getMonthlyRevenue,
  getWorkOrderCost,
} from '../controllers/materialConsumption.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import { createMaterialConsumptionSchema, updateMaterialConsumptionSchema, getMaterialLedgerSchema } from '../validators/materialConsumption.validator';
import { ROLES } from '../config';

const router = Router();

router.get('/', authenticate, getMaterialConsumptions);
router.get('/ledger', authenticate, validateQuery(getMaterialLedgerSchema), getMaterialLedger);
router.get('/monthly-revenue', authenticate, authorize(ROLES.FINANCE, ROLES.ADMIN), getMonthlyRevenue);
router.get('/work-order/:workOrderId/cost', authenticate, authorize(ROLES.FINANCE, ROLES.OPERATION, ROLES.ADMIN), getWorkOrderCost);
router.get('/:id', authenticate, getMaterialConsumptionById);

router.post(
  '/',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.OPERATION, ROLES.ADMIN),
  validate(createMaterialConsumptionSchema),
  createMaterialConsumption
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.OPERATION, ROLES.ADMIN),
  validate(updateMaterialConsumptionSchema),
  updateMaterialConsumption
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  deleteMaterialConsumption
);

export default router;

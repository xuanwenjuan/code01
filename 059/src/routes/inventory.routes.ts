import { Router } from 'express';
import {
  stockIn,
  stockOut,
  stockReturn,
  getInventoryRecords,
  getSparePartList,
  getSparePartDetail,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  getSparePartStatistics
} from '../controllers/inventory.controller';
import { authenticate, authorizeManager, authorizeAdmin, authorizeUser } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  idParam,
  sparePartValidationRules,
  stockInValidationRules,
  stockOutValidationRules,
  stockReturnValidationRules,
  inventoryRecordQueryRules,
  stockAdjustValidationRules,
  batchStockInValidationRules
} from '../validations/inventory.validation';

const router = Router();

router.get('/summary', authenticate, getStockSummary);
router.get('/spare-parts/statistics', authenticate, getSparePartStatistics);
router.get('/spare-parts', authenticate, getSparePartList);
router.get('/spare-parts/:id', authenticate, validate(idParam), getSparePartDetail);
router.post('/spare-parts', authenticate, authorizeManager, validate(sparePartValidationRules.create), createSparePart);
router.put('/spare-parts/:id', authenticate, authorizeManager, validate(sparePartValidationRules.update), updateSparePart);
router.delete('/spare-parts/:id', authenticate, authorizeAdmin, validate(idParam), deleteSparePart);

router.get('/records', authenticate, validate(inventoryRecordQueryRules), getInventoryRecords);
router.post('/in', authenticate, authorizeUser, validate(stockInValidationRules), stockIn);
router.post('/out', authenticate, authorizeUser, validate(stockOutValidationRules), stockOut);
router.post('/return', authenticate, authorizeUser, validate(stockReturnValidationRules), stockReturn);
router.post('/adjust', authenticate, authorizeManager, validate(stockAdjustValidationRules), stockAdjust);
router.post('/batch-in', authenticate, authorizeManager, validate(batchStockInValidationRules), batchStockIn);

export default router;

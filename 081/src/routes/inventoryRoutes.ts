import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import {
  getInventoryList,
  getInventoryListValidation,
  getInventoryLogList,
  recordConsumption,
  recordConsumptionValidation,
  createInventoryCheck,
  createInventoryCheckValidation,
  confirmInventoryCheck,
  getInventoryCheckList,
  getInventoryCheckDetail,
  getConsumptionStats
} from '../controllers/inventoryController';

const router = Router();

router.use(authenticate);

router.get('/', validate(getInventoryListValidation), getInventoryList);
router.get('/logs', getInventoryLogList);
router.get('/checks', getInventoryCheckList);
router.get('/checks/:id', getInventoryCheckDetail);
router.get('/consumption/stats', getConsumptionStats);

router.post(
  '/consumption',
  validate(recordConsumptionValidation),
  operationLog('记录原料消耗'),
  recordConsumption
);

router.post(
  '/checks',
  validate(createInventoryCheckValidation),
  operationLog('创建盘点单'),
  createInventoryCheck
);

router.patch(
  '/checks/:id/confirm',
  operationLog('确认盘点单'),
  confirmInventoryCheck
);

export default router;

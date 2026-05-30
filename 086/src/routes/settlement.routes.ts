import { Router } from 'express';
import SettlementController from '../controllers/settlement.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  withdrawSchema,
  getSettlementListSchema,
  settlementIdSchema,
  workerIdSchema
} from '../validations/settlement.validation';

const router = Router();

router.use(authenticate);

router.get('/', validate(getSettlementListSchema), SettlementController.getSettlementList);
router.get('/:id', validate(settlementIdSchema), SettlementController.getSettlementById);
router.get('/worker/:workerId/summary', validate(workerIdSchema), SettlementController.getWorkerSettlementSummary);
router.get('/worker/:workerId/withdraw-history', validate(workerIdSchema), SettlementController.getWithdrawHistory);
router.post('/withdraw', validate(withdrawSchema), SettlementController.withdraw);

router.use(requireAdmin);
router.post('/settle-all', SettlementController.settlePendingSettlements);

export default router;

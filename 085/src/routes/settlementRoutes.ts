import express from 'express';
import {
  generateSettlement,
  getSettlements,
  getSettlementById,
  confirmSettlement,
  markAsPaid,
  getMySettlements,
  getSettlementStatistics,
  cancelSettlement
} from '../controllers/settlementController';
import { authenticate, requireAdmin, requireFinance } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate, schemas } from '../middleware/validate';

const router = express.Router();

router.use(authenticate);
router.get('/my', validate(schemas.settlement.getList, 'query'), getMySettlements);
router.get('/:id', getSettlementById);

router.use(requireAdmin);
router.post('/generate', validate(schemas.settlement.generate, 'body'), operationLog('settlement', '生成结算'), generateSettlement);
router.get('/', validate(schemas.settlement.getList, 'query'), getSettlements);
router.get('/statistics/data', validate(schemas.settlement.getStatistics, 'query'), getSettlementStatistics);
router.put('/:id/confirm', validate(schemas.settlement.confirm, 'body'), operationLog('settlement', '确认结算'), confirmSettlement);
router.put('/:id/cancel', validate(schemas.settlement.cancel, 'body'), operationLog('settlement', '取消结算'), cancelSettlement);

router.use(requireFinance);
router.put('/:id/pay', validate(schemas.settlement.pay, 'body'), operationLog('settlement', '标记打款'), markAsPaid);

export default router;

import { Router } from 'express';
import SettlementController from '../controllers/SettlementController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate';
import { operationLog, LogModules, LogOperations } from '../middlewares/operationLog';
import {
  createSettlementSchema,
  generateMonthlySettlementSchema,
  getSettlementListSchema,
  settlementIdSchema,
  statisticsByCategorySchema
} from '../validations/settlement.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/list',
  authorize('settlement:view'),
  validateQuery(getSettlementListSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.LIST }),
  SettlementController.getSettlementList
);
router.get(
  '/statistics-by-category',
  authorize('settlement:statisticsByCategory'),
  validateQuery(statisticsByCategorySchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: '按类目统计' }),
  SettlementController.getStatisticsByCategory
);
router.get(
  '/statistics-by-repairer',
  authorize('settlement:statisticsByRepairer'),
  validateQuery(statisticsByCategorySchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: '按维修师统计' }),
  SettlementController.getStatisticsByRepairer
);
router.get(
  '/export',
  authorize('settlement:export'),
  validateQuery(statisticsByCategorySchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.EXPORT }),
  SettlementController.exportSettlementData
);
router.get(
  '/:id/reconciliation',
  authorize('settlement:reconciliation'),
  validateParams(settlementIdSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: '对账明细' }),
  SettlementController.getReconciliationDetails
);
router.get(
  '/:id',
  authorize('settlement:view'),
  validateParams(settlementIdSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.VIEW }),
  SettlementController.getSettlementById
);
router.post(
  '/',
  authorize('settlement:create'),
  validateBody(createSettlementSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.CREATE }),
  SettlementController.createSettlement
);
router.post(
  '/generate-monthly',
  authorize('settlement:generateMonthly'),
  validateBody(generateMonthlySettlementSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.GENERATE_MONTHLY }),
  SettlementController.generateMonthlySettlement
);
router.patch(
  '/:id/confirm',
  authorize('settlement:confirm'),
  validateParams(settlementIdSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.CONFIRM_SETTLEMENT }),
  SettlementController.confirmSettlement
);
router.patch(
  '/:id/cancel',
  authorize('settlement:cancel'),
  validateParams(settlementIdSchema),
  operationLog({ module: LogModules.SETTLEMENT, operation: LogOperations.CANCEL_SETTLEMENT }),
  SettlementController.cancelSettlement
);

export default router;
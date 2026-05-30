import { Router } from 'express';
import {
  getCostSettlementList,
  getCostSettlementById,
  createCostSettlement,
  autoGenerateSettlement,
  updateCostSettlement,
  deleteCostSettlement,
  getCostStatistics,
  getWineCostAnalysis,
} from '../controllers/costController';
import { authenticate, requirePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { operationLog } from '../middleware/operationLog';
import {
  createCostSettlementSchema,
  updateCostSettlementSchema,
} from '../validation/cost';

const router = Router();

router.use(authenticate);

router.get('/statistics', requirePermission('cost:view'), getCostStatistics);
router.get('/wine/:wineId/analysis', requirePermission('cost:view'), getWineCostAnalysis);
router.get('/', requirePermission('cost:view'), getCostSettlementList);
router.get('/:id', requirePermission('cost:view'), getCostSettlementById);
router.post('/', requirePermission('cost:create'), operationLog('成本管理', '创建结算'), validate(createCostSettlementSchema, 'body'), createCostSettlement);
router.post('/auto/:workOrderId', requirePermission('cost:create'), operationLog('成本管理', '自动生成结算'), autoGenerateSettlement);
router.put('/:id', requirePermission('cost:update'), operationLog('成本管理', '更新结算'), validate(updateCostSettlementSchema, 'body'), updateCostSettlement);
router.delete('/:id', requirePermission('cost:delete'), operationLog('成本管理', '删除结算'), deleteCostSettlement);

export default router;

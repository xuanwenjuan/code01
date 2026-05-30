import { Router } from 'express';
import {
  getWorkOrderList,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  advanceWorkOrderStage,
  rollbackWorkOrderStage,
  completeWorkOrder,
  suspendWorkOrder,
  resumeWorkOrder,
  deleteWorkOrder,
  getWorkOrderStatistics,
  getStageFlow,
  selectAndLockMaterials,
  unlockWorkOrderMaterials,
  recordMaterialLoss,
  recordMaterialUsage,
} from '../controllers/workOrderController';
import { authenticate, requirePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { operationLog } from '../middleware/operationLog';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  advanceStageSchema,
  rollbackStageSchema,
  completeWorkOrderSchema,
  suspendWorkOrderSchema,
  selectAndLockMaterialsSchema,
  unlockMaterialsSchema,
  recordMaterialLossSchema,
  recordMaterialUsageSchema,
  workOrderIdSchema,
} from '../validation/workOrder';

const router = Router();

router.use(authenticate);

router.get('/statistics', requirePermission('workorder:view'), getWorkOrderStatistics);
router.get('/stage-flow', requirePermission('workorder:view'), getStageFlow);
router.get('/', requirePermission('workorder:view'), getWorkOrderList);
router.get('/:id', requirePermission('workorder:view'), getWorkOrderById);
router.post('/', requirePermission('workorder:create'), operationLog('工单管理', '创建工单'), validate(createWorkOrderSchema, 'body'), createWorkOrder);
router.put('/:id', requirePermission('workorder:update'), operationLog('工单管理', '更新工单'), validate(updateWorkOrderSchema, 'body'), updateWorkOrder);
router.put('/:id/advance-stage', requirePermission('workorder:update'), operationLog('工单管理', '推进阶段'), validate(advanceStageSchema, 'body'), advanceWorkOrderStage);
router.put('/:id/rollback-stage', requirePermission('workorder:update'), operationLog('工单管理', '回退阶段'), validate(rollbackStageSchema, 'body'), rollbackWorkOrderStage);
router.put('/:id/complete', requirePermission('workorder:update'), operationLog('工单管理', '完成工单'), validate(completeWorkOrderSchema, 'body'), completeWorkOrder);
router.put('/:id/suspend', requirePermission('workorder:update'), operationLog('工单管理', '搁置工单'), validate(suspendWorkOrderSchema, 'body'), suspendWorkOrder);
router.put('/:id/resume', requirePermission('workorder:update'), operationLog('工单管理', '恢复工单'), resumeWorkOrder);
router.post('/:workOrderId/select-materials', requirePermission('workorder:material_select'), operationLog('工单管理', '选择并锁定原料'), validate(workOrderIdSchema, 'params'), validate(selectAndLockMaterialsSchema, 'body'), selectAndLockMaterials);
router.post('/:workOrderId/unlock-materials', requirePermission('workorder:material_select'), operationLog('工单管理', '解锁原料'), validate(workOrderIdSchema, 'params'), validate(unlockMaterialsSchema, 'body'), unlockWorkOrderMaterials);
router.post('/:workOrderId/record-loss', requirePermission('workorder:loss_record'), operationLog('工单管理', '记录原料损耗'), validate(workOrderIdSchema, 'params'), validate(recordMaterialLossSchema, 'body'), recordMaterialLoss);
router.post('/:workOrderId/record-usage', requirePermission('workorder:loss_record'), operationLog('工单管理', '记录原料使用'), validate(workOrderIdSchema, 'params'), validate(recordMaterialUsageSchema, 'body'), recordMaterialUsage);
router.delete('/:id', requirePermission('workorder:delete'), operationLog('工单管理', '删除工单'), deleteWorkOrder);

export default router;

import { Router } from 'express';
import {
  getWineList,
  getWineById,
  getWineByBatchNo,
  createWine,
  batchCreateWine,
  updateWine,
  deleteWine,
  updateWineStatus,
  batchUpdateWineStatus,
  getWineStatistics,
  getWineOrigins,
  getWineVintageYears,
} from '../controllers/wineController';
import { authenticate, requirePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { operationLog } from '../middleware/operationLog';
import {
  createWineSchema,
  updateWineSchema,
  updateWineStatusSchema,
  batchUpdateWineStatusSchema,
  batchCreateWineSchema,
} from '../validation/wine';

const router = Router();

router.use(authenticate);

router.get('/statistics', requirePermission('wine:view'), getWineStatistics);
router.get('/origins', requirePermission('wine:view'), getWineOrigins);
router.get('/vintage-years', requirePermission('wine:view'), getWineVintageYears);
router.get('/batch/:batchNo', requirePermission('wine:view'), getWineByBatchNo);
router.get('/', requirePermission('wine:view'), getWineList);
router.get('/:id', requirePermission('wine:view'), getWineById);
router.post('/', requirePermission('wine:create'), operationLog('酒品管理', '创建酒品'), validate(createWineSchema, 'body'), createWine);
router.post('/batch', requirePermission('wine:create'), operationLog('酒品管理', '批量创建酒品'), validate(batchCreateWineSchema, 'body'), batchCreateWine);
router.put('/:id', requirePermission('wine:update'), operationLog('酒品管理', '更新酒品'), validate(updateWineSchema, 'body'), updateWine);
router.put('/:id/status', requirePermission('wine:update'), operationLog('酒品管理', '更新状态'), validate(updateWineStatusSchema, 'body'), updateWineStatus);
router.post('/batch/status', requirePermission('wine:update'), operationLog('酒品管理', '批量更新状态'), validate(batchUpdateWineStatusSchema, 'body'), batchUpdateWineStatus);
router.delete('/:id', requirePermission('wine:delete'), operationLog('酒品管理', '删除酒品'), deleteWine);

export default router;

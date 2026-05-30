import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createCultivationBatch,
  getCultivationBatches,
  getCultivationBatchById,
  updateCultivationBatch,
  updateBatchStatus,
  performQcInspection,
  unlockBatch,
  batchPackaged,
  batchInStock,
  batchShipped,
  recordAbnormalLoss,
  deleteCultivationBatch
} from '../controllers/cultivationBatch.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole, BatchStatus } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    body('batchCode').notEmpty().withMessage('批次编码不能为空'),
    body('motherStrainId').isInt({ min: 1 }).withMessage('母种ID必须是正整数'),
    body('quantity').isInt({ min: 1 }).withMessage('培育数量必须是正整数'),
    body('cultureMedium').notEmpty().withMessage('培养基不能为空'),
    body('cultivationTemperature').isNumeric().withMessage('培育温度必须是数字'),
    body('cultivationHumidity').isNumeric().withMessage('培育湿度必须是数字'),
    body('estimatedDays').isInt({ min: 1 }).withMessage('预计培育天数必须是正整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  createCultivationBatch
);

router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('batchCode').optional().isString().withMessage('批次编码必须是字符串'),
    query('motherStrainId').optional().isInt({ min: 1 }).withMessage('母种ID必须是正整数'),
    query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    query('status').optional().isIn(Object.values(BatchStatus)).withMessage('无效的批次状态'),
    query('cultivatorId').optional().isInt({ min: 1 }).withMessage('培育员ID必须是正整数'),
    query('qcInspectorId').optional().isInt({ min: 1 }).withMessage('质检员ID必须是正整数'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
  ]),
  getCultivationBatches
);

router.get('/statistics', requireRoles(UserRole.ADMIN, UserRole.RESEARCHER), getCultivationBatches);

router.get(
  '/:id',
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数')
  ]),
  getCultivationBatchById
);

router.put(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('培育数量必须是正整数'),
    body('cultureMedium').optional().isString().withMessage('培养基必须是字符串'),
    body('cultivationTemperature').optional().isNumeric().withMessage('培育温度必须是数字'),
    body('cultivationHumidity').optional().isNumeric().withMessage('培育湿度必须是数字'),
    body('estimatedDays').optional().isInt({ min: 1 }).withMessage('预计培育天数必须是正整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  updateCultivationBatch
);

router.put(
  '/:id/status',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('status').isIn(Object.values(BatchStatus)).withMessage('无效的批次状态'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  updateBatchStatus
);

router.post(
  '/:id/quality-inspection',
  requireRoles(UserRole.ADMIN, UserRole.QC),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('qcResult').isIn(['pass', 'fail']).withMessage('质检结果必须是pass或fail'),
    body('qcRemark').notEmpty().withMessage('质检备注不能为空'),
    body('qcItems').optional().isArray().withMessage('质检项目必须是数组'),
    body('sampleCount').optional().isInt({ min: 0 }).withMessage('抽检数量必须是非负整数'),
    body('passCount').optional().isInt({ min: 0 }).withMessage('合格数量必须是非负整数')
  ]),
  performQcInspection
);

router.put(
  '/:id/unlock',
  requireRoles(UserRole.ADMIN),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  unlockBatch
);

router.put(
  '/:id/packaged',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('actualQuantity').optional().isInt({ min: 0 }).withMessage('实际数量必须是非负整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  batchPackaged
);

router.put(
  '/:id/in-stock',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('warehouseLocation').optional().isString().withMessage('库位必须是字符串'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  batchInStock
);

router.put(
  '/:id/shipped',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('orderNumber').optional().isString().withMessage('订单号必须是字符串'),
    body('customerInfo').optional().isString().withMessage('客户信息必须是字符串'),
    body('shippingQuantity').optional().isInt({ min: 0 }).withMessage('发货数量必须是非负整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  batchShipped
);

router.post(
  '/:id/loss',
  requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    body('lossQuantity').isInt({ min: 0 }).withMessage('损耗数量必须是非负整数'),
    body('lossReason').notEmpty().withMessage('损耗原因不能为空'),
    body('lossType').optional().isIn(['qc_failed', 'contamination', 'abnormal', 'other']).withMessage('无效的损耗类型')
  ]),
  recordAbnormalLoss
);

router.delete(
  '/:id',
  requireRoles(UserRole.ADMIN),
  validate([
    param('id').isInt({ min: 1 }).withMessage('批次ID必须是正整数')
  ]),
  deleteCultivationBatch
);

export default router;

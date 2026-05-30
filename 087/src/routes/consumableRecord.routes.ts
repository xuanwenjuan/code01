import { Router } from 'express';
import { body, query } from 'express-validator';
import consumableRecordController from '../controllers/consumableRecord.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('name').notEmpty().withMessage('耗材名称不能为空'),
    body('unit').notEmpty().withMessage('单位不能为空'),
    body('quantity').isInt({ min: 1 }).withMessage('数量必须大于0'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('单价不能为负数'),
    body('type').isIn(['in', 'out']).withMessage('类型必须为in或out')
  ],
  validate,
  consumableRecordController.createRecord
);

router.post(
  '/batch/outbound',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  consumableRecordController.batchOutbound
);

router.put(
  '/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  consumableRecordController.updateRecord
);

router.delete(
  '/:id',
  roleMiddleware(UserRole.ADMIN),
  consumableRecordController.deleteRecord
);

router.get('/:id', consumableRecordController.getRecordById);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  validate,
  consumableRecordController.getRecordList
);

router.get(
  '/inventory/list',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  validate,
  consumableRecordController.getInventoryList
);

router.get('/inventory/statistics', consumableRecordController.getInventoryStatistics);

router.get('/consumption/by-site', consumableRecordController.getConsumptionBySite);

router.get('/consumption/by-category', consumableRecordController.getConsumptionByCategory);

router.get(
  '/consumption/report',
  [
    query('startDate').notEmpty().withMessage('开始日期不能为空'),
    query('endDate').notEmpty().withMessage('结束日期不能为空')
  ],
  validate,
  consumableRecordController.getConsumptionReport
);

export default router;

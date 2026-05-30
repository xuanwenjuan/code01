import { Router } from 'express';
import { body, query } from 'express-validator';
import inspectionWorkOrderController from '../controllers/inspectionWorkOrder.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, WorkOrderStatus } from '../types';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('siteId').isInt({ min: 1 }).withMessage('站点ID必须为正整数'),
    body('equipmentCategoryId').optional().isInt({ min: 1 }).withMessage('设备类目ID必须为正整数'),
    body('plannedDate').isISO8601().withMessage('计划日期格式不正确'),
    body('inspectorId').optional().isInt({ min: 1 }).withMessage('巡检人员ID必须为正整数'),
    body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符')
  ],
  validate,
  inspectionWorkOrderController.createWorkOrder
);

router.post(
  '/batch/create',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('siteIds').isArray({ min: 1 }).withMessage('站点ID列表不能为空'),
    body('siteIds.*').isInt({ min: 1 }).withMessage('站点ID必须为正整数'),
    body('equipmentCategoryId').optional().isInt({ min: 1 }).withMessage('设备类目ID必须为正整数'),
    body('plannedDate').isISO8601().withMessage('计划日期格式不正确'),
    body('inspectorId').optional().isInt({ min: 1 }).withMessage('巡检人员ID必须为正整数')
  ],
  validate,
  inspectionWorkOrderController.batchCreateWorkOrders
);

router.put(
  '/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('siteId').optional().isInt({ min: 1 }).withMessage('站点ID必须为正整数'),
    body('equipmentCategoryId').optional().isInt({ min: 1 }).withMessage('设备类目ID必须为正整数'),
    body('plannedDate').optional().isISO8601().withMessage('计划日期格式不正确'),
    body('inspectorId').optional().isInt({ min: 1 }).withMessage('巡检人员ID必须为正整数')
  ],
  validate,
  inspectionWorkOrderController.updateWorkOrder
);

router.delete(
  '/:id',
  roleMiddleware(UserRole.ADMIN),
  inspectionWorkOrderController.deleteWorkOrder
);

router.get('/:id', inspectionWorkOrderController.getWorkOrderById);

router.patch(
  '/:id/start',
  roleMiddleware(UserRole.ADMIN, UserRole.INSPECTION),
  inspectionWorkOrderController.startInspection
);

router.patch(
  '/:id/submit-inspection',
  roleMiddleware(UserRole.ADMIN, UserRole.INSPECTION),
  [
    body('hasFault').isBoolean().withMessage('是否有故障不能为空'),
    body('temperature').optional().isFloat({ min: -100, max: 100 }).withMessage('温度值必须在-100到100之间'),
    body('humidity').optional().isFloat({ min: 0, max: 100 }).withMessage('湿度值必须在0到100之间'),
    body('windSpeed').optional().isFloat({ min: 0 }).withMessage('风速不能为负数'),
    body('windDirection').optional().isLength({ max: 20 }).withMessage('风向描述不能超过20个字符'),
    body('airPressure').optional().isFloat({ min: 800, max: 1100 }).withMessage('气压值必须在800到1100之间'),
    body('radiation').optional().isFloat({ min: 0 }).withMessage('辐射值不能为负数'),
    body('equipmentCheckResult').optional().isLength({ max: 1000 }).withMessage('设备检查结果不能超过1000个字符'),
    body('faultDescription').optional().isLength({ max: 500 }).withMessage('故障描述不能超过500个字符')
  ],
  validate,
  inspectionWorkOrderController.submitInspectionResult
);

router.patch(
  '/:id/assign-maintenance',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('maintenancePersonId').isInt({ min: 1 }).withMessage('维修人员ID必须为正整数')
  ],
  validate,
  inspectionWorkOrderController.assignMaintenance
);

router.patch(
  '/:id/submit-maintenance',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('maintenanceMeasures').notEmpty().withMessage('维修措施不能为空').isLength({ max: 1000 }).withMessage('维修措施不能超过1000个字符'),
    body('needReinspection').isBoolean().withMessage('是否需要复检不能为空'),
    body('maintenanceCost').optional().isFloat({ min: 0 }).withMessage('维修费用不能为负数')
  ],
  validate,
  inspectionWorkOrderController.submitMaintenanceResult
);

router.patch(
  '/:id/submit-reinspection',
  roleMiddleware(UserRole.ADMIN, UserRole.INSPECTION),
  [
    body('reinspectionResult').notEmpty().withMessage('复检结果不能为空').isLength({ max: 1000 }).withMessage('复检结果不能超过1000个字符'),
    body('passed').isBoolean().withMessage('是否通过不能为空')
  ],
  validate,
  inspectionWorkOrderController.submitReinspectionResult
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('siteId').optional().isInt({ min: 1 }).withMessage('站点ID必须为正整数'),
    query('inspectorId').optional().isInt({ min: 1 }).withMessage('巡检人员ID必须为正整数'),
    query('status').optional().isIn(Object.values(WorkOrderStatus)).withMessage('状态值无效'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
  ],
  validate,
  inspectionWorkOrderController.getWorkOrderList
);

router.get('/overdue/list', inspectionWorkOrderController.getOverdueWorkOrders);

router.get('/statistics/data', inspectionWorkOrderController.getWorkOrderStatistics);

export default router;

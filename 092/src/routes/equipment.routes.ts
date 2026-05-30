import { Router } from 'express';
import { body } from 'express-validator';
import {
  getEquipmentList,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getMaintenanceReminder,
  getMaintenanceRecords,
  createMaintenanceRecord,
  scrapEquipment,
  checkEquipmentSchedule,
  getEquipmentSchedule,
  getAvailableEquipments,
} from '../controllers/equipment.controller';
import { authMiddleware, validationMiddleware, roleMiddleware } from '../middleware';
import { UserRole } from '../common/enums';

const router = Router();

router.get('/', authMiddleware, getEquipmentList);
router.get('/maintenance-reminder', authMiddleware, getMaintenanceReminder);
router.get('/schedule/available', authMiddleware, getAvailableEquipments);
router.get('/:id', authMiddleware, getEquipmentById);
router.get('/:equipmentId/maintenance-records', authMiddleware, getMaintenanceRecords);
router.get('/:equipmentId/schedule', authMiddleware, getEquipmentSchedule);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE),
  [
    body('assetNo').notEmpty().withMessage('资产编号不能为空'),
    body('name').notEmpty().withMessage('设备名称不能为空'),
    body('brand').notEmpty().withMessage('品牌不能为空'),
    body('categoryId').notEmpty().withMessage('分类不能为空'),
    body('purchaseDate').notEmpty().withMessage('购置日期不能为空'),
    body('purchasePrice').isFloat({ min: 0 }).withMessage('购置价格必须为正数'),
    body('maintenanceCycle').optional().isInt({ min: 1 }).withMessage('维保周期必须为正整数'),
  ],
  validationMiddleware,
  createEquipment
);

router.post(
  '/schedule/check',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.BUSINESS, UserRole.WAREHOUSE),
  [
    body('equipmentIds').isArray({ min: 1 }).withMessage('设备ID列表不能为空'),
    body('startTime').notEmpty().withMessage('开始时间不能为空'),
    body('endTime').notEmpty().withMessage('结束时间不能为空'),
  ],
  validationMiddleware,
  checkEquipmentSchedule
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE),
  updateEquipment
);

router.put(
  '/:id/scrap',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE),
  scrapEquipment
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  deleteEquipment
);

router.post(
  '/:equipmentId/maintenance-records',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE),
  [
    body('description').notEmpty().withMessage('维保描述不能为空'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('维保费用必须为非负数'),
  ],
  validationMiddleware,
  createMaintenanceRecord
);

export default router;

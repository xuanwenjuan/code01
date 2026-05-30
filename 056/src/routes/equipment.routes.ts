import { Router } from 'express';
import { body } from 'express-validator';
import equipmentController from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, EquipmentStatus } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  [
    body('name').notEmpty().withMessage('设备名称不能为空'),
    body('categoryId').notEmpty().withMessage('设备分类不能为空'),
    body('departmentId').notEmpty().withMessage('所属部门不能为空'),
  ],
  validate,
  equipmentController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  equipmentController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  equipmentController.delete
);

router.patch(
  '/:id/status',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  [
    body('status').isIn(Object.values(EquipmentStatus)).withMessage('无效的设备状态'),
  ],
  validate,
  equipmentController.updateStatus
);

router.get('/statistics', equipmentController.getStatistics);
router.get('/:id', equipmentController.findById);
router.get('/', equipmentController.findAll);

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
import inspectionPlanController from '../controllers/inspectionPlan.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  [
    body('name').notEmpty().withMessage('计划名称不能为空'),
    body('equipmentId').notEmpty().withMessage('设备不能为空'),
    body('frequencyType').notEmpty().withMessage('频率类型不能为空'),
    body('startDate').notEmpty().withMessage('开始日期不能为空'),
    body('inspectionItems').notEmpty().withMessage('巡检项不能为空'),
  ],
  validate,
  inspectionPlanController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  inspectionPlanController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  inspectionPlanController.delete
);

router.patch(
  '/:id/toggle',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  inspectionPlanController.toggleActive
);

router.get('/statistics', inspectionPlanController.findAll);
router.get('/:id', inspectionPlanController.findById);
router.get('/', inspectionPlanController.findAll);

export default router;

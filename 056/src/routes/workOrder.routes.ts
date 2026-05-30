import { Router } from 'express';
import { body } from 'express-validator';
import workOrderController from '../controllers/workOrder.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('工单标题不能为空'),
    body('equipmentId').notEmpty().withMessage('设备不能为空'),
    body('type').notEmpty().withMessage('工单类型不能为空'),
    body('priority').notEmpty().withMessage('优先级不能为空'),
  ],
  validate,
  workOrderController.create
);

router.put(
  '/:id',
  workOrderController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  workOrderController.delete
);

router.patch(
  '/:id/assign',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  workOrderController.assign
);

router.patch('/:id/start', workOrderController.start);
router.patch('/:id/complete', workOrderController.complete);
router.patch('/:id/accept', workOrderController.accept);
router.patch('/:id/close', workOrderController.close);

router.get('/my', workOrderController.getMyOrders);
router.get('/statistics', workOrderController.getStatistics);
router.get('/statistics/type', workOrderController.getStatisticsByType);
router.get('/:id', workOrderController.findById);
router.get('/', workOrderController.findAll);

export default router;

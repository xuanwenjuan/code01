import { Router } from 'express';
import { body } from 'express-validator';
import inspectionTaskController from '../controllers/inspectionTask.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  [
    body('title').notEmpty().withMessage('任务标题不能为空'),
    body('equipmentId').notEmpty().withMessage('设备不能为空'),
    body('scheduledDate').notEmpty().withMessage('计划巡检日期不能为空'),
    body('inspectionItems').notEmpty().withMessage('巡检项不能为空'),
  ],
  validate,
  inspectionTaskController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  inspectionTaskController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  inspectionTaskController.delete
);

router.patch('/:id/start', inspectionTaskController.startTask);
router.patch('/:id/submit', inspectionTaskController.submitResult);

router.get('/my', inspectionTaskController.getMyTasks);
router.get('/statistics', inspectionTaskController.getStatistics);
router.get('/:id', inspectionTaskController.findById);
router.get('/', inspectionTaskController.findAll);

export default router;

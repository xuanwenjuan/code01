import { Router } from 'express';
import {
  createWorkOrder,
  getWorkOrderList,
  getWorkOrderById,
  updateWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder,
  getWorkOrderStatistics,
  lockRaceSchedule,
  unlockRaceSchedule,
  autoSummarizeExpenses,
  createWorkOrderSchema,
  updateWorkOrderSchema,
  updateWorkOrderStatusSchema,
  autoSummarizeExpenseSchema
} from '../controllers/workOrder.controller';
import { validate } from '../middlewares/validation.middleware';
import { authMiddleware, roleMiddleware, permissionMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/enum';

const router = Router();

router.get('/', authMiddleware, permissionMiddleware('workorder:read'), getWorkOrderList);
router.get('/statistics', authMiddleware, permissionMiddleware('workorder:read'), getWorkOrderStatistics);
router.get('/:id', authMiddleware, permissionMiddleware('workorder:read'), getWorkOrderById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER),
  permissionMiddleware('workorder:write'),
  validate(createWorkOrderSchema),
  createWorkOrder
);

router.post(
  '/:id/lock',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER),
  permissionMiddleware('workorder:lock'),
  lockRaceSchedule
);

router.post(
  '/:id/unlock',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER),
  permissionMiddleware('workorder:lock'),
  unlockRaceSchedule
);

router.post(
  '/:id/summarize-expenses',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE),
  permissionMiddleware('expense:write'),
  validate(autoSummarizeExpenseSchema),
  autoSummarizeExpenses
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER),
  permissionMiddleware('workorder:write'),
  validate(updateWorkOrderSchema),
  updateWorkOrder
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER),
  permissionMiddleware('workorder:status'),
  validate(updateWorkOrderStatusSchema),
  updateWorkOrderStatus
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  permissionMiddleware('workorder:delete'),
  deleteWorkOrder
);

export default router;

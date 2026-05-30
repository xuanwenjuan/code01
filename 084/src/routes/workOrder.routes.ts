import { Router } from 'express';
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  assignWorkOrder,
  acceptWorkOrder,
  startWorkOrder,
  reportProblem,
  completeWorkOrder,
  reviewWorkOrder,
  reassignWorkOrder,
  cancelWorkOrder,
  getStatistics,
  createValidation,
  assignValidation,
  reviewValidation,
  reportValidation,
  completeValidation
} from '../controllers/workOrder.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllWorkOrders);
router.get('/statistics', getStatistics);
router.get('/:id', getWorkOrderById);

router.post(
  '/',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.DISPATCHER),
  createValidation,
  validate,
  createWorkOrder
);

router.post(
  '/:id/assign',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.DISPATCHER),
  assignValidation,
  validate,
  assignWorkOrder
);

router.post('/:id/accept', acceptWorkOrder);
router.post('/:id/start', startWorkOrder);
router.post('/:id/report', reportValidation, validate, reportProblem);
router.post('/:id/complete', completeValidation, validate, completeWorkOrder);

router.post(
  '/:id/review',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  reviewValidation,
  validate,
  reviewWorkOrder
);

router.post(
  '/:id/reassign',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.DISPATCHER),
  reassignWorkOrder
);

router.post(
  '/:id/cancel',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.DISPATCHER),
  cancelWorkOrder
);

export default router;
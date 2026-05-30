import { Router } from 'express';
import {
  applicationValidationRules,
  createApplication,
  approveApplication,
  completeApplication,
  cancelApplication,
  batchApproveApplications,
  getApplicationList,
  getApplicationDetail,
  getApplicationStatistics
} from '../controllers/application.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, applicationValidationRules.getList, getApplicationList);
router.get('/statistics', authenticate, getApplicationStatistics);
router.get('/:id', authenticate, applicationValidationRules.getDetail, getApplicationDetail);

router.post(
  '/',
  authenticate,
  applicationValidationRules.create,
  createApplication
);

router.put(
  '/:id/approve',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_HEAD),
  applicationValidationRules.approve,
  approveApplication
);

router.put(
  '/batch-approve',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEPARTMENT_HEAD),
  applicationValidationRules.batchApprove,
  batchApproveApplications
);

router.put(
  '/:id/complete',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  applicationValidationRules.complete,
  completeApplication
);

router.delete(
  '/:id',
  authenticate,
  applicationValidationRules.cancel,
  cancelApplication
);

export default router;

import { Router } from 'express';
import {
  getAllWorkAreas,
  getWorkAreaById,
  createWorkArea,
  updateWorkArea,
  deleteWorkArea,
  updateStatus,
  createValidation,
  updateValidation
} from '../controllers/workArea.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllWorkAreas);
router.get('/:id', getWorkAreaById);

router.post(
  '/',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  createValidation,
  validate,
  createWorkArea
);

router.put(
  '/:id',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  updateValidation,
  validate,
  updateWorkArea
);

router.delete(
  '/:id',
  requireRoles(UserRole.SUPER_ADMIN),
  deleteWorkArea
);

router.patch(
  '/:id/status',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  updateStatus
);

export default router;
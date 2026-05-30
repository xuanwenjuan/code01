import { Router } from 'express';
import {
  getAllCleaners,
  getCleanerById,
  createCleaner,
  updateCleaner,
  deleteCleaner,
  getContractExpiringSoon,
  updateContractReminded,
  createValidation,
  updateValidation
} from '../controllers/cleaner.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.DISPATCHER, UserRole.FINANCE), getAllCleaners);
router.get('/contract-expiring', requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER), getContractExpiringSoon);
router.get('/:id', getCleanerById);

router.post(
  '/',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  createValidation,
  validate,
  createCleaner
);

router.put(
  '/:id',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  updateValidation,
  validate,
  updateCleaner
);

router.delete(
  '/:id',
  requireRoles(UserRole.SUPER_ADMIN),
  deleteCleaner
);

router.patch(
  '/:id/contract-reminded',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  updateContractReminded
);

export default router;
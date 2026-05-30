import { Router } from 'express';
import {
  calculatePerformance,
  getPerformanceList,
  getPerformanceById,
  updatePerformance,
  getPerformanceStatistics,
  getCleanerPerformanceHistory,
  calculateValidation,
  updateValidation
} from '../controllers/performance.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/permission.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/User';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.FINANCE), getPerformanceList);
router.get('/statistics', requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.FINANCE), getPerformanceStatistics);
router.get('/cleaner/:cleanerId', getCleanerPerformanceHistory);
router.get('/:id', requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER, UserRole.FINANCE), getPerformanceById);

router.post(
  '/calculate',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  calculateValidation,
  validate,
  calculatePerformance
);

router.put(
  '/:id',
  requireRoles(UserRole.SUPER_ADMIN, UserRole.AREA_MANAGER),
  updateValidation,
  validate,
  updatePerformance
);

export default router;
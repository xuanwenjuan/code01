import { Router } from 'express';
import {
  createPigeon,
  getPigeonList,
  getPigeonById,
  updatePigeon,
  batchUpdateStatus,
  deletePigeon,
  getExpiringReminders,
  getPigeonGenealogy,
  advancedSearch,
  createPigeonSchema,
  updatePigeonSchema,
  batchUpdateStatusSchema,
  advancedSearchSchema
} from '../controllers/pigeon.controller';
import { validate } from '../middlewares/validation.middleware';
import { authMiddleware, roleMiddleware, permissionMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/enum';

const router = Router();

router.get('/', authMiddleware, permissionMiddleware('pigeon:read'), getPigeonList);
router.get('/reminders', authMiddleware, permissionMiddleware('pigeon:read'), getExpiringReminders);
router.get('/:id', authMiddleware, permissionMiddleware('pigeon:read'), getPigeonById);
router.get('/:id/genealogy', authMiddleware, permissionMiddleware('pigeon:read'), getPigeonGenealogy);

router.post('/search', 
  authMiddleware, 
  permissionMiddleware('pigeon:read'), 
  validate(advancedSearchSchema), 
  advancedSearch
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BREEDER),
  permissionMiddleware('pigeon:write'),
  validate(createPigeonSchema),
  createPigeon
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BREEDER),
  permissionMiddleware('pigeon:write'),
  validate(updatePigeonSchema),
  updatePigeon
);

router.patch(
  '/batch/status',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BREEDER, UserRole.TRAINER),
  permissionMiddleware('pigeon:status'),
  validate(batchUpdateStatusSchema),
  batchUpdateStatus
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  permissionMiddleware('pigeon:delete'),
  deletePigeon
);

export default router;

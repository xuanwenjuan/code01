import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/role.constants';

const router = Router();

router.use(authMiddleware);

router.get('/expiring-materials', ...taskController.getExpiringMaterials);
router.get('/aging-reminders', ...taskController.getAgingReminders);
router.post(
  '/:id/archive',
  requireRoles([UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.OPERATION]),
  ...taskController.manualArchive
);

export default router;

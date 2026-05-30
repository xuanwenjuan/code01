import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  create,
  getById,
  getList,
  update,
  batchUpdateStatus,
  remove,
  getStatistics,
  reportFault,
  startMaintenance,
  completeMaintenance,
  batchDelete,
} from '../controllers/chargingPile.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/statistics', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getStatistics);
router.get('/:id', getById);
router.get('/', getList);

router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), create);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), update);
router.post('/batch/status', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), batchUpdateStatus);
router.post('/batch/delete', authMiddleware, roleMiddleware(UserRole.ADMIN), batchDelete);
router.post('/:id/report-fault', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), reportFault);
router.post('/:id/start-maintenance', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), startMaintenance);
router.post('/:id/complete-maintenance', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), completeMaintenance);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), remove);

export default router;

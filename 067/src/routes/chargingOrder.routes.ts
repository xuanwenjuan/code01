import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  startCharging,
  endCharging,
  getById,
  getList,
  cancelOrder,
  getStatistics,
  pauseCharging,
  resumeCharging,
  markAbnormal,
  handleAbnormalOrder,
  processTimeoutOrders,
  getOrderTrend,
} from '../controllers/chargingOrder.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/statistics', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getStatistics);
router.get('/trend', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getOrderTrend);
router.get('/:id', authMiddleware, getById);
router.get('/', authMiddleware, getList);

router.post('/start', authMiddleware, startCharging);
router.post('/:id/end', authMiddleware, endCharging);
router.post('/:id/pause', authMiddleware, pauseCharging);
router.post('/:id/resume', authMiddleware, resumeCharging);
router.post('/:id/abnormal', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), markAbnormal);
router.post('/:id/handle-abnormal', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), handleAbnormalOrder);
router.post('/:id/cancel', authMiddleware, cancelOrder);
router.post('/process-timeout', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), processTimeoutOrders);

export default router;

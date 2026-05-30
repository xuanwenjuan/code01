import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  generateDailySettlement,
  getById,
  getList,
  confirmSettlement,
  batchConfirmSettlement,
  getStatistics,
  getDetailedStatistics,
  getRevenueTrend,
  getSiteRanking,
  exportToExcel,
  exportSiteRankingToExcel,
} from '../controllers/settlement.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/statistics', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getStatistics);
router.get('/statistics/detailed', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getDetailedStatistics);
router.get('/revenue-trend', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getRevenueTrend);
router.get('/site-ranking', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getSiteRanking);
router.get('/export', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), exportToExcel);
router.get('/export/site-ranking', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), exportSiteRankingToExcel);
router.get('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getById);
router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), getList);

router.post('/generate', authMiddleware, roleMiddleware(UserRole.ADMIN), generateDailySettlement);
router.post('/batch-confirm', authMiddleware, roleMiddleware(UserRole.ADMIN), batchConfirmSettlement);
router.post('/:id/confirm', authMiddleware, roleMiddleware(UserRole.ADMIN), confirmSettlement);

export default router;

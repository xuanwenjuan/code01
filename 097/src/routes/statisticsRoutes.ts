import { Router } from 'express';
import {
  getInventoryStatistics,
  getStockByCategory,
  getInOutStatistics,
  getSupplierStatistics,
  getMonthlyTrend,
  getDashboardData,
  getTopSellingProducts
} from '../controllers/statisticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authMiddleware, getDashboardData);
router.get('/inventory', authMiddleware, getInventoryStatistics);
router.get('/stock-by-category', authMiddleware, getStockByCategory);
router.get('/in-out', authMiddleware, getInOutStatistics);
router.get('/supplier', authMiddleware, getSupplierStatistics);
router.get('/monthly-trend', authMiddleware, getMonthlyTrend);
router.get('/top-selling', authMiddleware, getTopSellingProducts);

export default router;

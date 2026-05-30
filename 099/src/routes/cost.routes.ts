import { Router } from 'express';
import { costController } from '../controllers/cost.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

router.post('/generate-daily', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.generateDailyReport);
router.post('/generate-monthly', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.generateMonthlyReport);
router.get('/report', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getCostReport);
router.get('/category-stats', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getCategoryConsumptionStats);
router.get('/stable-stats', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getStableCostStats);
router.get('/monthly-trend', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getMonthlyTrend);
router.get('/analysis', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getCostAnalysis);
router.get('/inventory-valuation', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getInventoryValuation);
router.get('/low-stock-alerts', authenticate, requireRole('admin', 'warehouse', 'purchaser'), costController.getLowStockAlerts);

export default router;

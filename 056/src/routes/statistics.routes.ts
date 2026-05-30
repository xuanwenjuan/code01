import { Router } from 'express';
import statisticsController from '../controllers/statistics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', statisticsController.getDashboard);
router.get('/equipment', statisticsController.getEquipmentStatistics);
router.get('/inspection', statisticsController.getInspectionStatistics);
router.get('/work-order', statisticsController.getWorkOrderStatistics);
router.get('/equipment-by-department', statisticsController.getEquipmentByDepartment);
router.get('/inspection-by-date', statisticsController.getInspectionByDateRange);
router.get('/work-order-by-date', statisticsController.getWorkOrderByDateRange);
router.get('/monthly-trend', statisticsController.getMonthlyTrend);

export default router;

import { Router } from 'express';
import {
  getPaymentRecords,
  getIncomeStatistics,
  getCustomerFinance,
  getEquipmentFinance,
  getMonthlyReport,
  getReportList,
  generateMonthlyReport,
  getDashboardStats
} from '../controllers/finance.controller';
import { authenticateJWT, requireFinance } from '../middlewares/jwt.middleware';
import { validate, generateReportSchema } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireFinance);

router.get('/dashboard', getDashboardStats);
router.get('/payments', getPaymentRecords);
router.get('/income-statistics', getIncomeStatistics);
router.get('/customer/:customerId', getCustomerFinance);
router.get('/equipment/:equipmentId', getEquipmentFinance);
router.get('/reports', getReportList);
router.get('/reports/monthly/:year/:month', getMonthlyReport);
router.post('/reports/monthly/generate', validate(generateReportSchema), generateMonthlyReport);

export default router;

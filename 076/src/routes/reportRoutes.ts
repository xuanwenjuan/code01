import { Router } from 'express';
import {
  generateDailyReport,
  getSalesReport,
  exportSalesReport,
  getStatistics
} from '../controllers/reportController';
import { authenticate, requireStoreManager } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireStoreManager);
router.post('/generate', generateDailyReport);
router.get('/', getSalesReport);
router.get('/export', exportSalesReport);
router.get('/statistics', getStatistics);

export default router;

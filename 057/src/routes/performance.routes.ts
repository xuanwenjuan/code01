import { Router } from 'express';
import * as performanceController from '../controllers/performance.controller';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', performanceController.getPerformanceList);
router.get('/stats', performanceController.getPerformanceStats);
router.get('/:id', performanceController.getPerformanceById);
router.get('/employee/:employeeId', performanceController.getEmployeePerformance);

router.use(requireManagerOrAdmin);

router.post('/', performanceController.createPerformance);
router.post('/bulk', performanceController.bulkCreatePerformances);
router.put('/:id', performanceController.updatePerformance);
router.delete('/:id', performanceController.deletePerformance);

export default router;

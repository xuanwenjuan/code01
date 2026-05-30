import { Router } from 'express';
import authRoutes from './auth';
import materialRoutes from './material';
import wineRoutes from './wine';
import workOrderRoutes from './workOrder';
import costRoutes from './cost';
import operationLogRoutes from './operationLog';

const router = Router();

router.use('/auth', authRoutes);
router.use('/materials', materialRoutes);
router.use('/wines', wineRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/costs', costRoutes);
router.use('/operation-logs', operationLogRoutes);

export default router;

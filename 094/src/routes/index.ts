import { Router } from 'express';
import authRoutes from './auth.routes';
import materialCategoryRoutes from './materialCategory.routes';
import materialRoutes from './material.routes';
import workOrderRoutes from './workOrder.routes';
import materialConsumptionRoutes from './materialConsumption.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/material-categories', materialCategoryRoutes);
router.use('/materials', materialRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/material-consumptions', materialConsumptionRoutes);

export default router;

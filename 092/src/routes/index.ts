import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import equipmentRoutes from './equipment.routes';
import orderRoutes from './order.routes';
import financeRoutes from './finance.routes';
import operationLogRoutes from './operation-log.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/equipments', equipmentRoutes);
router.use('/orders', orderRoutes);
router.use('/finance', financeRoutes);
router.use('/operation-logs', operationLogRoutes);

export default router;
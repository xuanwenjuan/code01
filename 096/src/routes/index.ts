import { Router } from 'express';
import authRoutes from './auth';
import categoryRoutes from './category';
import collectionRoutes from './collection';
import workOrderRoutes from './workorder';
import settlementRoutes from './settlement';

const router = Router();

router.use('/auth', authRoutes);
router.use('/category', categoryRoutes);
router.use('/collection', collectionRoutes);
router.use('/workorder', workOrderRoutes);
router.use('/settlement', settlementRoutes);

export default router;
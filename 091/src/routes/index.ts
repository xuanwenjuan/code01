import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import materialRoutes from './material.routes';
import processRoutes from './process.routes';
import inventoryRoutes from './inventory.routes';
import taskRoutes from './task.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/materials', materialRoutes);
router.use('/process', processRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/tasks', taskRoutes);

export default router;

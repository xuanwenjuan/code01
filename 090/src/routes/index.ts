import { Router } from 'express';
import authRoutes from './auth';
import storeRoutes from './stores';
import adminRoutes from './admins';
import equipmentCategoryRoutes from './equipmentCategories';
import equipmentRoutes from './equipments';
import rentalOrderRoutes from './rentalOrders';
import maintenanceRoutes from './maintenance';
import operationLogRoutes from './operationLogs';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/admins', adminRoutes);
router.use('/equipment-categories', equipmentCategoryRoutes);
router.use('/equipments', equipmentRoutes);
router.use('/rental-orders', rentalOrderRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/operation-logs', operationLogRoutes);

export default router;

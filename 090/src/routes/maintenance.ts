import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { authenticate, requireStoreManagerOrSuperAdmin, requireMaintenanceTechnicianOrAbove } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', MaintenanceController.getList);
router.get('/stats', MaintenanceController.getStats);
router.get('/equipment/:equipmentId/history', MaintenanceController.getEquipmentMaintenanceHistory);
router.get('/:id', MaintenanceController.getById);

router.post('/', requireMaintenanceTechnicianOrAbove, MaintenanceController.create);
router.post('/:id/start', requireMaintenanceTechnicianOrAbove, MaintenanceController.startMaintenance);
router.post('/complete', requireMaintenanceTechnicianOrAbove, MaintenanceController.complete);
router.put('/:id/cancel', requireStoreManagerOrSuperAdmin, MaintenanceController.cancel);

export default router;

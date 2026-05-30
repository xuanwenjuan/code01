import { Router } from 'express';
import {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipment,
  getEquipmentList,
  getEquipmentMaintenanceReminder,
  updateEquipmentStatus,
  batchUpdateStatus,
  lockEquipment,
  unlockEquipment,
  getEquipmentStats
} from '../controllers/equipment.controller';
import { authenticateJWT, requireOperator, requireAdmin } from '../middlewares/jwt.middleware';

const router = Router();

router.get('/stats', authenticateJWT, getEquipmentStats);
router.get('/maintenance-reminder', authenticateJWT, getEquipmentMaintenanceReminder);
router.get('/:id', getEquipment);
router.get('/', getEquipmentList);

router.use(authenticateJWT);
router.use(requireOperator);

router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.patch('/:id/status', updateEquipmentStatus);
router.post('/:id/lock', lockEquipment);
router.post('/:id/unlock', unlockEquipment);
router.patch('/batch/status', batchUpdateStatus);

router.use(requireAdmin);
router.delete('/:id', deleteEquipment);

export default router;

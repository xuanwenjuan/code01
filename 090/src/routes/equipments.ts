import { Router } from 'express';
import { EquipmentController } from '../controllers/EquipmentController';
import { authenticate, requireStoreManagerOrSuperAdmin, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', EquipmentController.getList);
router.get('/generate-no', EquipmentController.generateEquipmentNo);
router.get('/warnings', EquipmentController.getEquipmentWarnings);
router.get('/stats', EquipmentController.getStats);
router.get('/:id', EquipmentController.getById);

router.post('/', requireStoreManagerOrSuperAdmin, EquipmentController.create);
router.put('/:id', requireStoreManagerOrSuperAdmin, EquipmentController.update);
router.put('/:id/lock', requireStoreManagerOrSuperAdmin, EquipmentController.lockForRent);
router.put('/:id/unlock', requireStoreManagerOrSuperAdmin, EquipmentController.unlock);
router.delete('/:id', requireSuperAdmin, EquipmentController.delete);

export default router;

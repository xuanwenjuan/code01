import { Router } from 'express';
import { EquipmentCategoryController } from '../controllers/EquipmentCategoryController';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', EquipmentCategoryController.getList);
router.get('/tree', EquipmentCategoryController.getTree);
router.get('/flat-list', EquipmentCategoryController.getFlatList);
router.get('/:id', EquipmentCategoryController.getById);
router.post('/', requireSuperAdmin, EquipmentCategoryController.create);
router.put('/:id', requireSuperAdmin, EquipmentCategoryController.update);
router.delete('/:id', requireSuperAdmin, EquipmentCategoryController.delete);

export default router;

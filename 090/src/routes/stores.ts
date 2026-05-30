import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', StoreController.getList);
router.get('/all', StoreController.getAll);
router.get('/:id', StoreController.getById);
router.post('/', requireSuperAdmin, StoreController.create);
router.put('/:id', requireSuperAdmin, StoreController.update);
router.delete('/:id', requireSuperAdmin, StoreController.delete);

export default router;

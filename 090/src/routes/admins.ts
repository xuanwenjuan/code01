import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireSuperAdmin, AdminController.getList);
router.get('/:id', requireSuperAdmin, AdminController.getById);
router.post('/', requireSuperAdmin, AdminController.create);
router.put('/:id', requireSuperAdmin, AdminController.update);
router.delete('/:id', requireSuperAdmin, AdminController.delete);

export default router;

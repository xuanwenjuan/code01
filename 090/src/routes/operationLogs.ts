import { Router } from 'express';
import { OperationLogController } from '../controllers/OperationLogController';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', OperationLogController.getList);
router.get('/:id', OperationLogController.getById);

export default router;

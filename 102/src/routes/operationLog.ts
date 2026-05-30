import { Router } from 'express';
import {
  getOperationLogList,
  getOperationLogById,
} from '../controllers/operationLogController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.SUPER_ADMIN));

router.get('/', getOperationLogList);
router.get('/:id', getOperationLogById);

export default router;

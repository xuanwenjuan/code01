import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  getList,
  getById,
} from '../controllers/operationLog.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), getById);
router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), getList);

export default router;

import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  create,
  getById,
  getList,
  getAllActive,
  update,
  remove,
} from '../controllers/feeTemplate.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/active', getAllActive);
router.get('/:id', getById);
router.get('/', getList);

router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), create);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), update);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), remove);

export default router;

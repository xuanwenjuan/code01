import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  create,
  getById,
  getTree,
  getList,
  update,
  remove,
} from '../controllers/siteCategory.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/tree', getTree);
router.get('/:id', getById);
router.get('/', getList);

router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), create);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN, UserRole.OPERATOR), update);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), remove);

export default router;

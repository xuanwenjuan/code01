import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import {
  register,
  login,
  getCurrentUser,
  getUser,
  getUsers,
  updateUser,
  updateBalance,
  deleteUser,
  validateRegister,
  validateLogin,
} from '../controllers/user.controller';
import { UserRole } from '../types';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.get('/me', authMiddleware, getCurrentUser);
router.get('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), getUser);
router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), getUsers);
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), updateUser);
router.patch('/:id/balance', authMiddleware, roleMiddleware(UserRole.ADMIN), updateBalance);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), deleteUser);

export default router;

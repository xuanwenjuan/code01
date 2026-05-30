import { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  changePassword,
  getUsers,
  updateUserStatus,
  getUserById,
  getArtisans,
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { ROLES } from '../config';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/me', authenticate, getCurrentUser);
router.patch('/change-password', authenticate, changePassword);
router.get('/users', authenticate, authorize(ROLES.ADMIN), getUsers);
router.get('/users/artisans', authenticate, getArtisans);
router.get('/users/:id', authenticate, authorize(ROLES.ADMIN), getUserById);
router.patch('/users/:id/status', authenticate, authorize(ROLES.ADMIN), updateUserStatus);

export default router;

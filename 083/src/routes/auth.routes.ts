import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';

const router = Router();

router.post(
  '/register',
  validate(schemas.auth.register),
  authController.register.bind(authController)
);
router.post(
  '/login',
  validate(schemas.auth.login),
  authController.login.bind(authController)
);
router.get(
  '/me',
  authMiddleware,
  authController.getCurrentUser.bind(authController)
);

export default router;

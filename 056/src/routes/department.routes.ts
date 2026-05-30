import { Router } from 'express';
import { body } from 'express-validator';
import departmentController from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  [
    body('name').notEmpty().withMessage('部门名称不能为空'),
    body('code').notEmpty().withMessage('部门编码不能为空'),
  ],
  validate,
  departmentController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  departmentController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  departmentController.delete
);

router.get('/tree', departmentController.getTree);
router.get('/:id', departmentController.findById);
router.get('/', departmentController.findAll);

export default router;

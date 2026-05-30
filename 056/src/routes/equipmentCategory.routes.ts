import { Router } from 'express';
import { body } from 'express-validator';
import equipmentCategoryController from '../controllers/equipmentCategory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  [
    body('name').notEmpty().withMessage('分类名称不能为空'),
    body('code').notEmpty().withMessage('分类编码不能为空'),
  ],
  validate,
  equipmentCategoryController.create
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  equipmentCategoryController.update
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  equipmentCategoryController.delete
);

router.get('/tree', equipmentCategoryController.getTree);
router.get('/:id', equipmentCategoryController.findById);
router.get('/', equipmentCategoryController.findAll);

export default router;

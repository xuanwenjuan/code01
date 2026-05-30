import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCategoryTree,
  getCategoryList,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryPath,
  getCategoryChildren,
  getCategoryStats,
} from '../controllers/category.controller';
import { authMiddleware, validationMiddleware, roleMiddleware } from '../middleware';
import { UserRole } from '../common/enums';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/', getCategoryList);
router.get('/stats', authMiddleware, getCategoryStats);
router.get('/:id', getCategoryById);
router.get('/:id/path', getCategoryPath);
router.get('/:parentId/children', getCategoryChildren);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  [
    body('name').notEmpty().withMessage('分类名称不能为空'),
    body('code').notEmpty().withMessage('分类编码不能为空'),
  ],
  validationMiddleware,
  createCategory
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  deleteCategory
);

export default router;

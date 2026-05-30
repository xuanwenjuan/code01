import { Router } from 'express';
import { body, query } from 'express-validator';
import equipmentCategoryController from '../controllers/equipmentCategory.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, CategoryStatus } from '../types';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('name').notEmpty().withMessage('类目名称不能为空').isLength({ max: 100 }).withMessage('类目名称不能超过100个字符'),
    body('code').notEmpty().withMessage('类目编码不能为空').isLength({ max: 50 }).withMessage('类目编码不能超过50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父级类目ID必须为正整数'),
    body('sortOrder').optional().isInt({ min: 0, max: 9999 }).withMessage('排序值必须在0-9999之间'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符')
  ],
  validate,
  equipmentCategoryController.createCategory
);

router.put(
  '/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('name').optional().isLength({ max: 100 }).withMessage('类目名称不能超过100个字符'),
    body('code').optional().isLength({ max: 50 }).withMessage('类目编码不能超过50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父级类目ID必须为正整数'),
    body('sortOrder').optional().isInt({ min: 0, max: 9999 }).withMessage('排序值必须在0-9999之间')
  ],
  validate,
  equipmentCategoryController.updateCategory
);

router.delete(
  '/:id',
  roleMiddleware(UserRole.ADMIN),
  equipmentCategoryController.deleteCategory
);

router.get('/:id', equipmentCategoryController.getCategoryById);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  validate,
  equipmentCategoryController.getCategoryList
);

router.get('/tree/data', equipmentCategoryController.getCategoryTree);

router.patch(
  '/:id/status',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('status').isIn(Object.values(CategoryStatus)).withMessage('状态值无效')
  ],
  validate,
  equipmentCategoryController.updateStatus
);

export default router;

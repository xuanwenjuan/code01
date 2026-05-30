import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createCategory,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deactivateCategory,
  getCategoryChildren
} from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole, StrainCategoryType } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    body('categoryCode')
      .notEmpty().withMessage('分类编码不能为空')
      .isString().withMessage('分类编码必须是字符串')
      .isLength({ max: 50 }).withMessage('分类编码长度不能超过50字符'),
    body('categoryName')
      .notEmpty().withMessage('分类名称不能为空')
      .isString().withMessage('分类名称必须是字符串')
      .isLength({ max: 100 }).withMessage('分类名称长度不能超过100字符'),
    body('categoryType')
      .notEmpty().withMessage('分类类型不能为空')
      .isIn(Object.values(StrainCategoryType)).withMessage('无效的分类类型'),
    body('parentId')
      .optional()
      .isInt({ min: 1 }).withMessage('父级分类ID必须是正整数'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 }).withMessage('排序值必须是非负整数'),
    body('description')
      .optional()
      .isString().withMessage('描述必须是字符串')
  ]),
  createCategory
);

router.get(
  '/tree',
  validate([
    query('categoryType')
      .optional()
      .isIn(Object.values(StrainCategoryType)).withMessage('无效的分类类型'),
    query('isActive')
      .optional()
      .isBoolean().withMessage('isActive必须是布尔值')
  ]),
  getCategoryTree
);

router.get(
  '/children/:parentId',
  validate([
    param('parentId')
      .custom((value) => value === 'root' || !isNaN(Number(value)))
      .withMessage('parentId必须是root或数字ID'),
    query('isActive')
      .optional()
      .isBoolean().withMessage('isActive必须是布尔值')
  ]),
  getCategoryChildren
);

router.get(
  '/:id',
  validate([
    param('id')
      .isInt({ min: 1 }).withMessage('分类ID必须是正整数')
  ]),
  getCategoryById
);

router.put(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    param('id')
      .isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    body('categoryName')
      .optional()
      .isString().withMessage('分类名称必须是字符串')
      .isLength({ max: 100 }).withMessage('分类名称长度不能超过100字符'),
    body('categoryType')
      .optional()
      .isIn(Object.values(StrainCategoryType)).withMessage('无效的分类类型'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 }).withMessage('排序值必须是非负整数'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive必须是布尔值'),
    body('description')
      .optional()
      .isString().withMessage('描述必须是字符串')
  ]),
  updateCategory
);

router.delete(
  '/:id',
  requireRoles(UserRole.ADMIN),
  validate([
    param('id')
      .isInt({ min: 1 }).withMessage('分类ID必须是正整数')
  ]),
  deleteCategory
);

router.put(
  '/:id/deactivate',
  requireRoles(UserRole.ADMIN),
  validate([
    param('id')
      .isInt({ min: 1 }).withMessage('分类ID必须是正整数')
  ]),
  deactivateCategory
);

export default router;
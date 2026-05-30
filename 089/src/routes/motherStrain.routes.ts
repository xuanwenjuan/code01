import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createMotherStrain,
  getMotherStrains,
  getMotherStrainById,
  updateMotherStrain,
  updateStrainStatus,
  expandStrain,
  deleteMotherStrain
} from '../controllers/motherStrain.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole, MotherStrainStatus } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    body('strainCode').notEmpty().withMessage('菌种编码不能为空'),
    body('strainName').notEmpty().withMessage('菌种名称不能为空'),
    body('categoryId').isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    body('generation').isInt({ min: 0 }).withMessage('代数必须是非负整数'),
    body('mediumFormula').notEmpty().withMessage('培养基配方不能为空'),
    body('storageTemperature').isNumeric().withMessage('保存温度必须是数字'),
    body('originSource').optional().isString().withMessage('来源必须是字符串'),
    body('viabilityDate').optional().isISO8601().withMessage('活性日期格式不正确'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  createMotherStrain
);

router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('strainCode').optional().isString().withMessage('菌种编码必须是字符串'),
    query('strainName').optional().isString().withMessage('菌种名称必须是字符串'),
    query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    query('status').optional().isIn(Object.values(MotherStrainStatus)).withMessage('无效的菌种状态'),
    query('generation').optional().isInt({ min: 0 }).withMessage('代数必须是非负整数'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
  ]),
  getMotherStrains
);

router.get(
  '/:id',
  validate([
    param('id').isInt({ min: 1 }).withMessage('菌种ID必须是正整数')
  ]),
  getMotherStrainById
);

router.put(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    param('id').isInt({ min: 1 }).withMessage('菌种ID必须是正整数'),
    body('strainName').optional().isString().withMessage('菌种名称必须是字符串'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    body('generation').optional().isInt({ min: 0 }).withMessage('代数必须是非负整数'),
    body('mediumFormula').optional().isString().withMessage('培养基配方必须是字符串'),
    body('storageTemperature').optional().isNumeric().withMessage('保存温度必须是数字'),
    body('originSource').optional().isString().withMessage('来源必须是字符串'),
    body('viabilityDate').optional().isISO8601().withMessage('活性日期格式不正确'),
    body('status').optional().isIn(Object.values(MotherStrainStatus)).withMessage('无效的菌种状态'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  updateMotherStrain
);

router.put(
  '/:id/status',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    param('id').isInt({ min: 1 }).withMessage('菌种ID必须是正整数'),
    body('status').isIn(Object.values(MotherStrainStatus)).withMessage('无效的菌种状态'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  updateStrainStatus
);

router.post(
  '/:id/expand',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    param('id').isInt({ min: 1 }).withMessage('菌种ID必须是正整数'),
    body('newStrainCode').notEmpty().withMessage('新菌种编码不能为空'),
    body('newStrainName').optional().isString().withMessage('新菌种名称必须是字符串'),
    body('generationIncrement').optional().isInt({ min: 1 }).withMessage('代数增量必须是正整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串')
  ]),
  expandStrain
);

router.delete(
  '/:id',
  requireRoles(UserRole.ADMIN),
  validate([
    param('id').isInt({ min: 1 }).withMessage('菌种ID必须是正整数')
  ]),
  deleteMotherStrain
);

export default router;

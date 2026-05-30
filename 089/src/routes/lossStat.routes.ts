import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getLossStatistics,
  getLossSummary,
  getLossById
} from '../controllers/lossStat.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('batchId').optional().isInt({ min: 1 }).withMessage('批次ID必须是正整数'),
    query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    query('lossType').optional().isIn(['qc_failed', 'contamination', 'abnormal', 'other']).withMessage('无效的损耗类型'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
  ]),
  getLossStatistics
);

router.get(
  '/summary',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    query('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
  ]),
  getLossSummary
);

router.get(
  '/:id',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    param('id').isInt({ min: 1 }).withMessage('记录ID必须是正整数')
  ]),
  getLossById
);

export default router;

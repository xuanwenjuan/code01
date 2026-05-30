import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  generateTraceabilityReport,
  getTraceabilityRecords,
  getTraceabilityById,
  getBatchTraceability,
  getStatistics,
  getCategoryReport,
  deleteTraceabilityRecord
} from '../controllers/traceability.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post(
  '/generate',
  requireRoles(UserRole.ADMIN, UserRole.RESEARCHER),
  validate([
    body('categoryId')
      .notEmpty().withMessage('分类ID不能为空')
      .isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    body('startDate')
      .notEmpty().withMessage('开始日期不能为空')
      .isISO8601().withMessage('开始日期格式不正确'),
    body('endDate')
      .notEmpty().withMessage('结束日期不能为空')
      .isISO8601().withMessage('结束日期格式不正确')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('结束日期必须大于开始日期');
        }
        return true;
      }),
    body('remark')
      .optional()
      .isString().withMessage('备注必须是字符串')
  ]),
  generateTraceabilityReport
);

router.get(
  '/',
  validate([
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('categoryId')
      .optional()
      .isInt({ min: 1 }).withMessage('分类ID必须是正整数'),
    query('startDate')
      .optional()
      .isISO8601().withMessage('开始日期格式不正确'),
    query('endDate')
      .optional()
      .isISO8601().withMessage('结束日期格式不正确')
  ]),
  getTraceabilityRecords
);

router.get('/statistics', getStatistics);
router.get('/category-report', getCategoryReport);

router.get(
  '/:id',
  validate([
    param('id')
      .isInt({ min: 1 }).withMessage('记录ID必须是正整数')
  ]),
  getTraceabilityById
);

router.get(
  '/batch/:batchCode',
  validate([
    param('batchCode')
      .notEmpty().withMessage('批次编号不能为空')
      .isString().withMessage('批次编号必须是字符串')
  ]),
  getBatchTraceability
);

router.delete(
  '/:id',
  requireRoles(UserRole.ADMIN),
  validate([
    param('id')
      .isInt({ min: 1 }).withMessage('记录ID必须是正整数')
  ]),
  deleteTraceabilityRecord
);

export default router;

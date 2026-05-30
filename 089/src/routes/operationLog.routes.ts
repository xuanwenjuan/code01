import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getOperationLogs,
  getLogsByModule,
  getLogsByRecord,
  getOperationTypes
} from '../controllers/operationLog.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { UserRole, OperationType } from '../types';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRoles(UserRole.ADMIN),
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('module').optional().isString().withMessage('模块名必须是字符串'),
    query('operationType').optional().isIn(Object.values(OperationType)).withMessage('无效的操作类型'),
    query('operatorId').optional().isInt({ min: 1 }).withMessage('操作员ID必须是正整数'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确')
  ]),
  getOperationLogs
);

router.get('/types', getOperationTypes);

router.get(
  '/module/:module',
  requireRoles(UserRole.ADMIN),
  validate([
    param('module').notEmpty().withMessage('模块名不能为空'),
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ]),
  getLogsByModule
);

router.get(
  '/module/:module/record/:recordId',
  requireRoles(UserRole.ADMIN),
  validate([
    param('module').notEmpty().withMessage('模块名不能为空'),
    param('recordId').isInt({ min: 1 }).withMessage('记录ID必须是正整数')
  ]),
  getLogsByRecord
);

export default router;

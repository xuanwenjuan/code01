import { Router } from 'express';
import { query } from 'express-validator';
import operationLogController from '../controllers/operationLog.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  roleMiddleware(UserRole.ADMIN, UserRole.DISTRICT_ADMIN),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  validate,
  operationLogController.getLogList
);

export default router;

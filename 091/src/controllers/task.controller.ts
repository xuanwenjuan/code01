import { Request, Response, NextFunction } from 'express';
import { query, param } from 'express-validator';
import taskService from '../services/task.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getExpiringMaterials = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await taskService.getExpiringMaterials();
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getAgingReminders = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('reminderStatus').optional().isIn(['pending', 'reminded', 'archived']).withMessage('无效的提醒状态'),
  query('daysUntilExpiry').optional().isInt({ min: 1 }).withMessage('到期天数必须是正整数'),
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await taskService.getAgingReminders(req.query);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const manualArchive = [
  param('id').isInt({ min: 1 }).withMessage('原料ID必须是正整数'),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materialId = parseInt(req.params.id, 10);
      const result = await taskService.manualArchive(materialId, req.user!.id);
      ResponseUtil.success(res, result, '归档成功');
    } catch (error) {
      next(error);
    }
  },
];

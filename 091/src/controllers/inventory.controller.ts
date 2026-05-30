import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import inventoryService from '../services/inventory.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LedgerType } from '../models/inventory-ledger.model';

export const stockOutValidation = [
  body('materialId').isInt({ min: 1 }).withMessage('原料ID必须是正整数'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('出库数量必须大于0'),
  body('remarks').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符'),
];

export const ledgerQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('categoryId').optional().isInt({ min: 1 }).withMessage('类目ID必须是正整数'),
  query('materialId').optional().isInt({ min: 1 }).withMessage('原料ID必须是正整数'),
  query('type').optional().isIn(Object.values(LedgerType)).withMessage('无效的台账类型'),
  query('startDate').optional().isISO8601().withMessage('开始日期格式错误'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式错误'),
];

export const getLedgers = [
  ...ledgerQueryValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await inventoryService.getLedgers(req.query);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getCategorySummary = [
  query('startDate').optional().isISO8601().withMessage('开始日期格式错误'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式错误'),
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const result = await inventoryService.getCategorySummary(startDate, endDate);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const stockOut = [
  ...stockOutValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await inventoryService.stockOut({
        ...req.body,
        operatorId: req.user!.id,
      });
      ResponseUtil.success(res, result, '出库成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getMaterialLedgers = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materialId = parseInt(req.params.materialId, 10);
      const result = await inventoryService.getMaterialLedgers(materialId);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

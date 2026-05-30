import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import materialService from '../services/material.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MaterialStatus } from '../constants/material.constants';

export const createMaterialValidation = [
  body('categoryId').isInt({ min: 1 }).withMessage('类目ID必须是正整数'),
  body('name').notEmpty().withMessage('原料名称不能为空').isLength({ max: 100 }).withMessage('原料名称不能超过100个字符'),
  body('origin').notEmpty().withMessage('产地不能为空').isLength({ max: 100 }).withMessage('产地不能超过100个字符'),
  body('harvestYear').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('采收年份必须是有效年份'),
  body('processTech').notEmpty().withMessage('炮制工艺不能为空').isLength({ max: 200 }).withMessage('炮制工艺不能超过200个字符'),
  body('moistureContent').isFloat({ min: 0, max: 100 }).withMessage('含水率必须在0-100之间'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('数量必须大于0'),
  body('unit').notEmpty().withMessage('单位不能为空').isLength({ max: 20 }).withMessage('单位不能超过20个字符'),
  body('warehouseLocation').optional().isLength({ max: 100 }).withMessage('仓库位置不能超过100个字符'),
  body('agingDays').optional().isInt({ min: 0 }).withMessage('陈化天数必须是非负整数'),
];

export const updateMaterialValidation = [
  body('categoryId').optional().isInt({ min: 1 }).withMessage('类目ID必须是正整数'),
  body('name').optional().isLength({ max: 100 }).withMessage('原料名称不能超过100个字符'),
  body('origin').optional().isLength({ max: 100 }).withMessage('产地不能超过100个字符'),
  body('harvestYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('采收年份必须是有效年份'),
  body('processTech').optional().isLength({ max: 200 }).withMessage('炮制工艺不能超过200个字符'),
  body('moistureContent').optional().isFloat({ min: 0, max: 100 }).withMessage('含水率必须在0-100之间'),
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('数量必须大于0'),
  body('unit').optional().isLength({ max: 20 }).withMessage('单位不能超过20个字符'),
  body('status').optional().isIn(Object.values(MaterialStatus)).withMessage('无效的状态'),
  body('isLocked').optional().isBoolean().withMessage('锁定状态必须是布尔值'),
];

export const queryMaterialValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('categoryId').optional().isInt({ min: 1 }).withMessage('类目ID必须是正整数'),
  query('status').optional().isIn(Object.values(MaterialStatus)).withMessage('无效的状态'),
  query('origin').optional().isLength({ max: 100 }).withMessage('产地不能超过100个字符'),
  query('batchNo').optional().isLength({ max: 50 }).withMessage('批次号不能超过50个字符'),
  query('keyword').optional().isLength({ max: 100 }).withMessage('关键词不能超过100个字符'),
  query('harvestYearMin').optional().isInt({ min: 1900 }).withMessage('最小采收年份无效'),
  query('harvestYearMax').optional().isInt({ max: new Date().getFullYear() + 1 }).withMessage('最大采收年份无效'),
  query('moistureContentMin').optional().isFloat({ min: 0 }).withMessage('最小含水率必须大于等于0'),
  query('moistureContentMax').optional().isFloat({ max: 100 }).withMessage('最大含水率必须小于等于100'),
  query('quantityMin').optional().isFloat({ min: 0 }).withMessage('最小数量必须大于等于0'),
  query('quantityMax').optional().isFloat().withMessage('最大数量必须是数字'),
  query('isLocked').optional().isBoolean().withMessage('锁定状态必须是布尔值'),
  query('sortField').optional().isIn(['name', 'origin', 'harvestYear', 'quantity', 'createdAt', 'agingEndDate']).withMessage('无效的排序字段'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('排序顺序必须是ASC或DESC'),
];

export const create = [
  ...createMaterialValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await materialService.create(req.body, userId);
      ResponseUtil.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  },
];

export const findAll = [
  ...queryMaterialValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await materialService.findAll(req.query);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const toggleLock = [
  body('isLocked').isBoolean().withMessage('锁定状态必须是布尔值'),
  body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const result = await materialService.toggleLock(id, req.body.isLocked, userId, req.body.reason);
      ResponseUtil.success(res, result, result.isLocked ? '锁定成功' : '解锁成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getOriginStats = [
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await materialService.getOriginStats();
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getStatusStats = [
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await materialService.getStatusStats();
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const findOne = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await materialService.findOne(id);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const update = [
  ...updateMaterialValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const result = await materialService.update(id, req.body, userId);
      ResponseUtil.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const updateStatus = [
  body('status').isIn(Object.values(MaterialStatus)).withMessage('无效的状态'),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const result = await materialService.updateStatus(id, req.body.status, userId);
      ResponseUtil.success(res, result, '状态更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const startAging = [
  body('agingDays').isInt().withMessage('陈化天数必须是数字'),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const result = await materialService.startAging(id, req.body.agingDays, userId);
      ResponseUtil.success(res, result, '开始陈化成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getTraceability = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchNo } = req.params;
      const result = await materialService.getTraceability(batchNo);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

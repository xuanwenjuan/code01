import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import categoryService from '../services/category.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MaterialCategoryType } from '../constants/material.constants';

export const createCategoryValidation = [
  body('name').notEmpty().withMessage('类目名称不能为空'),
  body('code').notEmpty().withMessage('类目编码不能为空'),
  body('type').isIn(Object.values(MaterialCategoryType)).withMessage('无效的类目类型'),
];

export const create = [
  ...createCategoryValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await categoryService.create(req.body, userId);
      ResponseUtil.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  },
];

export const findAll = [
  query('type').optional().isIn(Object.values(MaterialCategoryType)).withMessage('无效的类目类型'),
  query('isActive').optional().isBoolean().withMessage('isActive必须是布尔值'),
  query('isSealed').optional().isBoolean().withMessage('isSealed必须是布尔值'),
  query('parentId').optional().isInt().withMessage('parentId必须是数字'),
  query('flat').optional().isBoolean().withMessage('flat必须是布尔值'),
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = {
        type: req.query.type as MaterialCategoryType | undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        isSealed: req.query.isSealed !== undefined ? req.query.isSealed === 'true' : undefined,
        parentId: req.query.parentId ? parseInt(req.query.parentId as string, 10) : undefined,
        flat: req.query.flat === 'true',
      };
      const result = await categoryService.findAll(query);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getCategoryChain = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await categoryService.getCategoryChain(id);
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
      const result = await categoryService.findOne(id);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const update = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await categoryService.update(id, req.body);
      ResponseUtil.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const remove = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await categoryService.remove(id);
      ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  },
];

export const toggleSeal = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const { isSealed } = req.body;
      const result = await categoryService.toggleSeal(id, isSealed);
      ResponseUtil.success(res, result, '操作成功');
    } catch (error) {
      next(error);
    }
  },
];

export const updateSortOrder = [
  body('ids').isArray().withMessage('ids必须是数组'),
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await categoryService.updateSortOrder(req.body.ids);
      ResponseUtil.success(res, null, '排序更新成功');
    } catch (error) {
      next(error);
    }
  },
];

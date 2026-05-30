import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import processService from '../services/process.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProcessStatus } from '../constants/material.constants';

export const createProcessValidation = [
  body('materialId').isInt({ min: 1 }).withMessage('原料ID必须是正整数'),
  body('inputQuantity').isFloat({ min: 0.01 }).withMessage('投入数量必须大于0'),
  body('processDetails').optional().isLength({ max: 2000 }).withMessage('加工详情不能超过2000个字符'),
];

export const updateProcessDetailsValidation = [
  body('outputQuantity').optional().isFloat({ min: 0 }).withMessage('产出数量必须是非负数'),
  body('lossQuantity').optional().isFloat({ min: 0 }).withMessage('损耗数量必须是非负数'),
  body('processDetails').optional().isLength({ max: 2000 }).withMessage('加工详情不能超过2000个字符'),
  body('qualityCheckResult').optional().isLength({ max: 1000 }).withMessage('质检结果不能超过1000个字符'),
  body('isQualified').optional().isBoolean().withMessage('isQualified必须是布尔值'),
];

export const create = [
  ...createProcessValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await processService.create(req.body, userId);
      ResponseUtil.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  },
];

export const findAll = [
  query('status').optional().isIn(Object.values(ProcessStatus)).withMessage('无效的状态'),
  query('materialId').optional().isInt().withMessage('原料ID必须是数字'),
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as ProcessStatus | undefined;
      const materialId = req.query.materialId ? parseInt(req.query.materialId as string, 10) : undefined;
      const result = await processService.findAll(status, materialId);
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
      const result = await processService.findOne(id);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const updateStatus = [
  body('status').isIn(Object.values(ProcessStatus)).withMessage('无效的状态'),
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const result = await processService.updateStatus(id, req.body.status, userId);
      ResponseUtil.success(res, result, '状态更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const updateProcessDetails = [
  ...updateProcessDetailsValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const result = await processService.updateProcessDetails(id, req.body, userId);
      ResponseUtil.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getProcessChain = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materialId = parseInt(req.params.materialId, 10);
      const result = await processService.getProcessChain(materialId);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

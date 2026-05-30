import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/categoryService';
import { successResponse } from '../middleware/responseHandler';
import { CategoryType } from '../types';

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body);
    successResponse(res, category, '创建类目成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const categories = await categoryService.getCategoryTree(includeArchived);
    successResponse(res, categories, '获取类目树成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(Number(id));
    successResponse(res, category, '获取类目成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryWithChildren = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryWithChildren(Number(id));
    successResponse(res, category, '获取类目及子类目成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(Number(id), req.body);
    successResponse(res, category, '更新类目成功');
  } catch (error) {
    next(error);
  }
};

export const archiveCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.archiveCategory(Number(id));
    successResponse(res, category, '封存类目成功');
  } catch (error) {
    next(error);
  }
};

export const unarchiveCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.unarchiveCategory(Number(id));
    successResponse(res, category, '解封类目成功');
  } catch (error) {
    next(error);
  }
};

export const updateSortOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await categoryService.updateSortOrder(req.body);
    successResponse(res, null, '更新排序成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoriesByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type } = req.params;
    const categories = await categoryService.getCategoriesByType(type as CategoryType);
    successResponse(res, categories, '获取类目列表成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await categoryService.getCategoryStats(Number(id));
    successResponse(res, stats, '获取类目统计成功');
  } catch (error) {
    next(error);
  }
};

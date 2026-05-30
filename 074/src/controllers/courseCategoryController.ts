import { Request, Response, NextFunction } from 'express';
import * as courseCategoryService from '../services/courseCategoryService';
import { body } from 'express-validator';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseCategoryService.createCategory(req.body);
    res.success(result, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await courseCategoryService.updateCategory(Number(id), req.body);
    res.success(result, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await courseCategoryService.deleteCategory(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await courseCategoryService.getCategoryById(Number(id));
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const result = await courseCategoryService.getAllCategories(status as string);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const result = await courseCategoryService.getCategoryTree(status as string);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId } = req.params;
    const { status } = req.query;
    const result = await courseCategoryService.getCategoryChildren(
      parentId === 'root' ? null : Number(parentId),
      status as string
    );
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryTreeLazy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId } = req.params;
    const { status, maxDepth = 3 } = req.query;
    const result = await courseCategoryService.getCategoryTreeLazy(
      parentId === 'root' ? null : Number(parentId),
      status as string,
      Number(maxDepth)
    );
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await courseCategoryService.updateStatus(Number(id), status);
    res.success(result, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const updateSortOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await courseCategoryService.updateSortOrder(req.body);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

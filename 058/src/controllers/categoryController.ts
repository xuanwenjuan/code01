import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { Result } from '../utils/response';
import { OrderType } from '../types';

export const createCategory = async (req: Request, res: Response) => {
  const {
    name, type, description, basePrice, pricePerKm, pricePerKg,
    startTime, endTime, nightSurcharge, weightSurcharge, sort
  } = req.body;
  const category = await CategoryService.createCategory(
    name, type as OrderType, basePrice, pricePerKm, pricePerKg,
    description, startTime, endTime, nightSurcharge, weightSurcharge, sort
  );
  return Result.sendSuccess(res, category, '创建成功');
};

export const updateCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const data = req.body;
  const category = await CategoryService.updateCategory(Number(categoryId), data);
  return Result.sendSuccess(res, category, '更新成功');
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  await CategoryService.deleteCategory(Number(categoryId));
  return Result.sendSuccess(res, null, '删除成功');
};

export const getCategoryList = async (req: Request, res: Response) => {
  const { page, pageSize, type, status } = req.query;
  const result = await CategoryService.getCategoryList(
    type as OrderType,
    status ? Number(status) : undefined,
    Number(page),
    Number(pageSize)
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getCategoryDetail = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const category = await CategoryService.getCategoryDetail(Number(categoryId));
  return Result.sendSuccess(res, category, '获取成功');
};

export const updateCategoryStatus = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { status } = req.body;
  const category = await CategoryService.updateCategoryStatus(Number(categoryId), status);
  return Result.sendSuccess(res, category, '状态更新成功');
};

export const getCategoryStatistics = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { startDate, endDate } = req.query;
  const statistics = await CategoryService.getCategoryStatistics(
    Number(categoryId),
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  return Result.sendSuccess(res, statistics, '获取成功');
};

export const getAllActiveCategories = async (req: Request, res: Response) => {
  const categories = await CategoryService.getAllActiveCategories();
  return Result.sendSuccess(res, categories, '获取成功');
};

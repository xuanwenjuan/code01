import { Request, Response } from 'express';
import siteCategoryService from '../services/siteCategory.service';
import { ResponseUtil } from '../utils/response';
import { SiteCategoryType } from '../types';

export const create = async (req: Request, res: Response) => {
  try {
    const category = await siteCategoryService.create(req.body);
    res.json(ResponseUtil.success(category, '创建成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const category = await siteCategoryService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(category));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getTree = async (req: Request, res: Response) => {
  try {
    const { type, maxDepth } = req.query;
    const depth = maxDepth ? Number(maxDepth) : 10;
    const tree = await siteCategoryService.getTree(type as SiteCategoryType, depth);
    res.json(ResponseUtil.success(tree));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, type, keyword } = req.query;
    const result = await siteCategoryService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      type: type as SiteCategoryType,
      keyword: keyword as string,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const category = await siteCategoryService.update(Number(req.params.id), req.body);
    res.json(ResponseUtil.success(category, '更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await siteCategoryService.delete(Number(req.params.id));
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

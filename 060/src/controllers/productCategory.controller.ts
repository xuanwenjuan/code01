import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { productCategoryService } from '../services/productCategory.service';

export class ProductCategoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productCategoryService.create(req.body);
      return ApiResponse.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productCategoryService.update(Number(id), req.body);
      return ApiResponse.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productCategoryService.delete(Number(id));
      return ApiResponse.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productCategoryService.getById(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getTree(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, enabledOnly } = req.query;
      const result = await productCategoryService.getTree(
        type as string,
        enabledOnly === 'true'
      );
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productCategoryService.getList(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productCategoryService.toggleStatus(Number(id));
      return ApiResponse.success(res, result, '操作成功');
    } catch (error) {
      next(error);
    }
  }

  async updateSortOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      await productCategoryService.updateSortOrder(ids);
      return ApiResponse.success(res, null, '排序更新成功');
    } catch (error) {
      next(error);
    }
  }
}

export const productCategoryController = new ProductCategoryController();

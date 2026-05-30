import { Request, Response, NextFunction } from 'express';
import serviceCategoryService from '../services/serviceCategory.service';
import { ResponseUtil } from '../utils/response';

export class ServiceCategoryController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await serviceCategoryService.createCategory(req.body);
      ResponseUtil.created(res, result, '创建类目成功');
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await serviceCategoryService.updateCategory(id, req.body);
      ResponseUtil.success(res, result, '更新类目成功');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await serviceCategoryService.deleteCategory(id);
      ResponseUtil.success(res, null, '删除类目成功');
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await serviceCategoryService.getCategoryById(id);
      ResponseUtil.success(res, result, '获取类目成功');
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const result = await serviceCategoryService.getCategoryTree(status as any);
      ResponseUtil.success(res, result, '获取类目树成功');
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryList(req: Request, res: Response, next: NextFunction) {
    try {
      const { parentId, status, page = 1, pageSize = 10 } = req.query;
      const result = await serviceCategoryService.getCategoryList(
        parentId as string,
        status as any,
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取类目列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async updateSortOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sortOrder } = req.body;
      const result = await serviceCategoryService.updateSortOrder(id, sortOrder);
      ResponseUtil.success(res, result, '更新排序成功');
    } catch (error) {
      next(error);
    }
  }

  static async getActiveLeafCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await serviceCategoryService.getActiveLeafCategories();
      ResponseUtil.success(res, result, '获取可用服务类目成功');
    } catch (error) {
      next(error);
    }
  }
}

export default ServiceCategoryController;
import { Request, Response, NextFunction } from 'express';
import equipmentCategoryService from '../services/equipmentCategory.service';
import { ResponseUtil } from '../utils/response';

class EquipmentCategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId
      };
      const category = await equipmentCategoryService.createCategory(data, req);
      res.json(ResponseUtil.success(category, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await equipmentCategoryService.updateCategory(Number(id), req.body, req);
      res.json(ResponseUtil.success(category, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await equipmentCategoryService.deleteCategory(Number(id), req);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await equipmentCategoryService.getCategoryById(Number(id));
      res.json(ResponseUtil.success(category));
    } catch (error) {
      next(error);
    }
  }

  async getCategoryList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
      };
      const result = await equipmentCategoryService.getCategoryList(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        parentId: req.query.parentId ? Number(req.query.parentId) : undefined,
        status: req.query.status as any,
        includeDisabled: req.query.includeDisabled === 'true'
      };
      const tree = await equipmentCategoryService.getCategoryTree(params);
      res.json(ResponseUtil.success(tree));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const category = await equipmentCategoryService.updateStatus(Number(id), status, req);
      res.json(ResponseUtil.success(category, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  }
}

export default new EquipmentCategoryController();

import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/category.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

class CategoryController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);
      return ResponseUtil.success(res, category, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(Number(id), req.body);
      return ResponseUtil.success(res, category, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(Number(id));
      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(Number(id));
      return ResponseUtil.success(res, category);
    } catch (error) {
      next(error);
    }
  }

  async getTree(req: Request, res: Response, next: NextFunction) {
    try {
      const { includeProducts } = req.query;
      const tree = await categoryService.getCategoryTree(includeProducts === 'true');
      return ResponseUtil.success(res, tree);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, status, parentId } = req.query;
      const result = await categoryService.getCategoryList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status !== undefined ? Number(status) : undefined,
        parentId: parentId !== undefined ? Number(parentId) : undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const category = await categoryService.updateStatus(Number(id), status);
      return ResponseUtil.success(res, category, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  async getPath(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const path = await categoryService.getCategoryPath(Number(id));
      return ResponseUtil.success(res, path);
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();

import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { ResponseUtil } from '../utils/response';

export const categoryController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json(ResponseUtil.success(category, '创建成功'));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await CategoryService.update(id, req.body);
      res.json(ResponseUtil.success(category, '更新成功'));
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await CategoryService.delete(id);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await CategoryService.getById(id);
      const categoryPath = await CategoryService.getCategoryPath(id);
      const data = {
        ...category.toJSON(),
        categoryPath,
      };
      res.json(ResponseUtil.success(data, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await CategoryService.getTree(includeInactive);
      res.json(ResponseUtil.success(categories, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      const name = req.query.name as string;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const result = await CategoryService.getList(page, pageSize, name, isActive);
      res.json(
        ResponseUtil.paginated(result.list, result.total, page, pageSize, '获取成功')
      );
    } catch (error) {
      next(error);
    }
  },

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await CategoryService.toggleActive(id);
      res.json(ResponseUtil.success(category, category.isActive ? '类目已启用' : '类目已停产'));
    } catch (error) {
      next(error);
    }
  },

  async validateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await CategoryService.validateActiveCategory(id);
      res.json(ResponseUtil.success(null, '类目可用'));
    } catch (error) {
      next(error);
    }
  },
};

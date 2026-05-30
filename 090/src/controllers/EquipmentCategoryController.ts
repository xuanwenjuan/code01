import { Request, Response, NextFunction } from 'express';
import { EquipmentCategoryService } from '../services/EquipmentCategoryService';
import { ResponseUtil } from '../utils/response';

export class EquipmentCategoryController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await EquipmentCategoryService.create(req.body);
      res.status(201).json(ResponseUtil.created(category, '类目创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await EquipmentCategoryService.update(parseInt(id), req.body);
      res.json(ResponseUtil.success(category, '类目更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await EquipmentCategoryService.delete(parseInt(id));
      res.json(ResponseUtil.success(null, '类目删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await EquipmentCategoryService.getById(parseInt(id));
      res.json(ResponseUtil.success(category, '获取类目成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeDisabled = req.query.includeDisabled === 'true';
      const tree = await EquipmentCategoryService.getTree(includeDisabled);
      res.json(ResponseUtil.success(tree, '获取类目树成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getFlatList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : null;
      const list = await EquipmentCategoryService.getFlatList(parentId);
      res.json(ResponseUtil.success(list, '获取类目列表成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EquipmentCategoryService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        name: req.query.name as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined
      });
      res.json(ResponseUtil.success(result, '获取类目列表成功'));
    } catch (error) {
      next(error);
    }
  }
}

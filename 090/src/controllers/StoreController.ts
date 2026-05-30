import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../services/StoreService';
import { ResponseUtil } from '../utils/response';

export class StoreController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = await StoreService.create(req.body);
      res.status(201).json(ResponseUtil.created(store, '门店创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const store = await StoreService.update(parseInt(id), req.body);
      res.json(ResponseUtil.success(store, '门店更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await StoreService.delete(parseInt(id));
      res.json(ResponseUtil.success(null, '门店删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const store = await StoreService.getById(parseInt(id));
      res.json(ResponseUtil.success(store, '获取门店成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await StoreService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        name: req.query.name as string,
        status: req.query.status ? parseInt(req.query.status as string) : undefined
      });
      res.json(ResponseUtil.success(result, '获取门店列表成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await StoreService.getAll();
      res.json(ResponseUtil.success(list, '获取门店列表成功'));
    } catch (error) {
      next(error);
    }
  }
}

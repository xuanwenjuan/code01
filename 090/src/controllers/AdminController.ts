import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { ResponseUtil } from '../utils/response';
import { AdminRole } from '../types';

export class AdminController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = await AdminService.create(req.body);
      (admin as any).password = undefined;
      res.status(201).json(ResponseUtil.created(admin, '管理员创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = await AdminService.update(parseInt(id), req.body);
      (admin as any).password = undefined;
      res.json(ResponseUtil.success(admin, '管理员更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await AdminService.delete(parseInt(id));
      res.json(ResponseUtil.success(null, '管理员删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const admin = await AdminService.getById(parseInt(id));
      res.json(ResponseUtil.success(admin, '获取管理员成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.getList({
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        username: req.query.username as string,
        realName: req.query.realName as string,
        role: req.query.role as AdminRole,
        storeId: req.query.storeId ? parseInt(req.query.storeId as string) : undefined,
        status: req.query.status ? parseInt(req.query.status as string) : undefined
      });
      res.json(ResponseUtil.success(result, '获取管理员列表成功'));
    } catch (error) {
      next(error);
    }
  }
}

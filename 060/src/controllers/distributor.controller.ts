import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { distributorService } from '../services/distributor.service';

export class DistributorController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await distributorService.create(req.body);
      return ApiResponse.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await distributorService.update(Number(id), req.body);
      return ApiResponse.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await distributorService.delete(Number(id));
      return ApiResponse.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await distributorService.getById(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await distributorService.getStatistics(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await distributorService.toggleStatus(Number(id));
      return ApiResponse.success(res, result, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await distributorService.getList(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await distributorService.getAll();
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

export const distributorController = new DistributorController();

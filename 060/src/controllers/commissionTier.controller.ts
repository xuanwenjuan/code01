import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { commissionTierService } from '../services/commissionTier.service';

export class CommissionTierController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commissionTierService.create(req.body);
      return ApiResponse.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await commissionTierService.update(Number(id), req.body);
      return ApiResponse.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await commissionTierService.delete(Number(id));
      return ApiResponse.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await commissionTierService.getById(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commissionTierService.getList(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { distributorId } = req.query;
      const result = await commissionTierService.getStatistics(
        distributorId ? Number(distributorId) : undefined
      );
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

export const commissionTierController = new CommissionTierController();

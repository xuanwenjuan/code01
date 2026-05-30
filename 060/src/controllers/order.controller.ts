import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { orderService } from '../services/order.service';

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.create(req.body);
      return ApiResponse.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async pay(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await orderService.pay(Number(id));
      return ApiResponse.success(res, result, '支付成功');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await orderService.cancel(Number(id));
      return ApiResponse.success(res, result, '取消成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await orderService.getById(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getList(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async processExpired(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.processExpiredOrders();
      return ApiResponse.success(res, result, `成功处理 ${result.processed} 个过期订单`);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { distributorId, startDate, endDate } = req.query;
      const result = await orderService.getStatistics(
        distributorId ? Number(distributorId) : undefined,
        startDate as string,
        endDate as string
      );
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();

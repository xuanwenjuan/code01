import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { settlementService } from '../services/settlement.service';

export class SettlementController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { distributorId, period } = req.body;
      const result = await settlementService.generateMonthlySettlement(
        Number(distributorId),
        period
      );
      return ApiResponse.created(res, result, '结算单生成成功');
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await settlementService.confirm(
        Number(id),
        req.user!.id,
        req.user!.username
      );
      return ApiResponse.success(res, result, '确认成功');
    } catch (error) {
      next(error);
    }
  }

  async pay(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { paidAmount } = req.body;
      const result = await settlementService.pay(
        Number(id),
        Number(paidAmount),
        req.user!.id,
        req.user!.username
      );
      return ApiResponse.success(res, result, '支付成功');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await settlementService.cancel(
        Number(id),
        req.user!.id,
        req.user!.username
      );
      return ApiResponse.success(res, null, '取消成功');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { distributorId, startDate, endDate } = req.query;
      const result = await settlementService.getStatistics(
        distributorId ? Number(distributorId) : undefined,
        startDate as string,
        endDate as string
      );
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await settlementService.getById(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settlementService.getList(req.query);
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }

  async getSettlementOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await settlementService.getSettlementOrders(Number(id));
      return ApiResponse.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

export const settlementController = new SettlementController();

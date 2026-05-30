import { Response, NextFunction } from 'express';
import settlementService from '../services/settlementService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { SettlementStatus } from '../models/Settlement';

class SettlementController {
  async createSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settlementData = {
        ...req.body,
        operatorId: req.user?.id
      };
      const settlement = await settlementService.createSettlement(settlementData);
      ResponseUtil.success(res, settlement, '结算单创建成功');
    } catch (error) {
      next(error);
    }
  }

  async getSettlementById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const settlement = await settlementService.getSettlementById(Number(id));
      ResponseUtil.success(res, settlement);
    } catch (error) {
      next(error);
    }
  }

  async getSettlementList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        type,
        status,
        branchId,
        vehicleId,
        startDate,
        endDate,
        keyword,
        page,
        pageSize,
        sortBy,
        sortOrder
      } = req.query;

      const result = await settlementService.getSettlementList({
        type: type as string,
        status: status as SettlementStatus,
        branchId: branchId ? Number(branchId) : undefined,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        keyword: keyword as string,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      });
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async confirmSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;
      const settlement = await settlementService.confirmSettlement(
        Number(id),
        req.user?.id,
        remark
      );
      ResponseUtil.success(res, settlement, '结算确认成功');
    } catch (error) {
      next(error);
    }
  }

  async cancelSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;
      const settlement = await settlementService.cancelSettlement(
        Number(id),
        remark,
        req.user?.id
      );
      ResponseUtil.success(res, settlement, '结算取消成功');
    } catch (error) {
      next(error);
    }
  }

  async getSettlementItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const items = await settlementService.getSettlementItems(Number(id));
      ResponseUtil.success(res, items);
    } catch (error) {
      next(error);
    }
  }

  async getSettlementStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, type, branchId, vehicleId } = req.query;
      const statistics = await settlementService.getSettlementStatistics({
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as string,
        branchId: branchId ? Number(branchId) : undefined,
        vehicleId: vehicleId ? Number(vehicleId) : undefined
      });
      ResponseUtil.success(res, statistics);
    } catch (error) {
      next(error);
    }
  }

  async previewSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const preview = await settlementService.previewSettlement(req.body);
      ResponseUtil.success(res, preview);
    } catch (error) {
      next(error);
    }
  }
}

export default new SettlementController();

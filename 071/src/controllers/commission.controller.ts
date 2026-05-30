import { Request, Response, NextFunction } from 'express';
import commissionService from '../services/commission.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CommissionListQuery } from '../types';
import { CommissionStatus } from '../models/Commission.model';

class CommissionController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const commission = await commissionService.createCommission(orderId);
      return ResponseUtil.success(res, commission, '佣金生成成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const commission = await commissionService.getCommissionById(Number(id));
      return ResponseUtil.success(res, commission);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as CommissionListQuery;
      const result = await commissionService.getCommissionList({
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
        status: query.status as CommissionStatus | undefined,
        leaderId: query.leaderId ? Number(query.leaderId) : undefined,
        settlementPeriod: query.settlementPeriod as string | undefined,
        startDate: query.startDate as string | undefined,
        endDate: query.endDate as string | undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMyCommissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaderId = req.user?.id;
      const query = req.query as CommissionListQuery;
      const result = await commissionService.getCommissionList({
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
        status: query.status as CommissionStatus | undefined,
        leaderId: Number(leaderId),
        settlementPeriod: query.settlementPeriod as string | undefined,
        startDate: query.startDate as string | undefined,
        endDate: query.endDate as string | undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async settle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { commissionIds, settlementPeriod } = req.body;
      await commissionService.settleCommissions({ commissionIds, settlementPeriod });
      return ResponseUtil.success(res, null, '结算成功');
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaderId = req.user?.id;
      const { commissionIds } = req.body;
      await commissionService.withdrawCommissions({ 
        commissionIds, 
        leaderId: Number(leaderId) 
      });
      return ResponseUtil.success(res, null, '提现成功');
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { leaderId } = req.query;
      const stats = await commissionService.getCommissionStatistics(
        leaderId ? Number(leaderId) : undefined
      );
      return ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getSettlementPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const { leaderId } = req.query;
      const periods = await commissionService.getSettlementPeriods(
        leaderId ? Number(leaderId) : undefined
      );
      return ResponseUtil.success(res, periods);
    } catch (error) {
      next(error);
    }
  }

  async getReconciliationReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { settlementPeriod, leaderId } = req.query;
      const report = await commissionService.getReconciliationReport(
        settlementPeriod as string,
        leaderId ? Number(leaderId) : undefined
      );
      return ResponseUtil.success(res, report);
    } catch (error) {
      next(error);
    }
  }
}

export default new CommissionController();

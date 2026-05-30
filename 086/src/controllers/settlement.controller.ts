import { Request, Response, NextFunction } from 'express';
import settlementService from '../services/settlement.service';
import { ResponseUtil } from '../utils/response';

export class SettlementController {
  static async getSettlementById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await settlementService.getSettlementById(id);
      ResponseUtil.success(res, result, '获取结算详情成功');
    } catch (error) {
      next(error);
    }
  }

  static async getSettlementList(req: Request, res: Response, next: NextFunction) {
    try {
      const { workerId, status, startDate, endDate, page = 1, pageSize = 10 } = req.query;
      const result = await settlementService.getSettlementList(
        {
          workerId: workerId as string,
          status: status as any,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined
        },
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取结算列表成功');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkerSettlementSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { workerId } = req.params;
      const result = await settlementService.getWorkerSettlementSummary(workerId);
      ResponseUtil.success(res, result, '获取结算汇总成功');
    } catch (error) {
      next(error);
    }
  }

  static async settlePendingSettlements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settlementService.settlePendingSettlements();
      ResponseUtil.success(res, { count: result.length }, '批量结算成功');
    } catch (error) {
      next(error);
    }
  }

  static async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const workerId = req.user!.userId;
      const { settlementIds, withdrawTransactionId } = req.body;
      const result = await settlementService.withdraw({ 
        workerId, 
        settlementIds, 
        withdrawTransactionId 
      });
      ResponseUtil.success(res, result, `提现成功，共 ${result.totalAmount} 元`);
    } catch (error) {
      next(error);
    }
  }

  static async getWithdrawHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { workerId } = req.params;
      const { page = 1, pageSize = 10 } = req.query;
      const result = await settlementService.getWithdrawHistory(
        workerId,
        Number(page),
        Number(pageSize)
      );
      ResponseUtil.paginated(res, result, '获取提现记录成功');
    } catch (error) {
      next(error);
    }
  }
}

export default SettlementController;
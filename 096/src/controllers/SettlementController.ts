import { Request, Response } from 'express';
import SettlementService from '../services/SettlementService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { SettlementStatus, SettlementType } from '../models/Settlement';

class SettlementController {
  async createSettlement(req: AuthRequest, res: Response) {
    const settlement = await SettlementService.createSettlement({
      ...req.body,
      settledBy: req.user!.id
    });
    return ResponseUtil.created(res, settlement, '结算单创建成功');
  }

  async generateMonthlySettlement(req: AuthRequest, res: Response) {
    const { year, month, type } = req.body;
    const settlement = await SettlementService.generateMonthlySettlement(
      Number(year),
      Number(month),
      type as SettlementType
    );
    return ResponseUtil.created(res, settlement, '月度结算生成成功');
  }

  async getSettlementById(req: Request, res: Response) {
    const { id } = req.params;
    const settlement = await SettlementService.getSettlementById(Number(id));
    return ResponseUtil.success(res, settlement);
  }

  async getSettlementList(req: Request, res: Response) {
    const { page, pageSize, type, status, startDate, endDate } = req.query;
    const result = await SettlementService.getSettlementList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      type: type as SettlementType,
      status: status as SettlementStatus,
      startDate: startDate as string,
      endDate: endDate as string
    });
    return ResponseUtil.paginated(res, result);
  }

  async confirmSettlement(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const settlement = await SettlementService.confirmSettlement(Number(id), req.user!.id);
    return ResponseUtil.success(res, settlement, '结算确认成功');
  }

  async cancelSettlement(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const settlement = await SettlementService.cancelSettlement(Number(id));
    return ResponseUtil.success(res, settlement, '结算取消成功');
  }

  async getStatisticsByCategory(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const statistics = await SettlementService.getStatisticsByCategory(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    return ResponseUtil.success(res, statistics);
  }

  async getStatisticsByRepairer(req: Request, res: Response) {
    const { startDate, endDate } = req.query;
    const statistics = await SettlementService.getStatisticsByRepairer(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    return ResponseUtil.success(res, statistics);
  }

  async exportSettlementData(req: Request, res: Response) {
    const { startDate, endDate, type } = req.query;
    const data = await SettlementService.exportSettlementData(
      new Date(startDate as string),
      new Date(endDate as string),
      type as SettlementType
    );
    return ResponseUtil.success(res, data);
  }

  async getReconciliationDetails(req: Request, res: Response) {
    const { id } = req.params;
    const details = await SettlementService.getReconciliationDetails(Number(id));
    return ResponseUtil.success(res, details);
  }
}

export default new SettlementController();
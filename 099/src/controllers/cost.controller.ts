import { Response } from 'express';
import { costService } from '../services/cost.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const costController = {
  async generateDailyReport(req: AuthRequest, res: Response) {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const result = await costService.generateDailyReport(date);
    res.json(ResponseUtil.success(result, '日报生成成功'));
  },

  async generateMonthlyReport(req: AuthRequest, res: Response) {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);
    const result = await costService.generateMonthlyReport(year, month);
    res.json(ResponseUtil.success(result, '月报生成成功'));
  },

  async getCostReport(req: AuthRequest, res: Response) {
    const query: any = {
      type: (req.query.type as 'daily' | 'monthly' | 'yearly') || 'daily'
    };
    
    if (req.query.startDate) query.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) query.endDate = new Date(req.query.endDate as string);
    if (req.query.categoryId) query.categoryId = parseInt(req.query.categoryId as string);
    if (req.query.stableId) query.stableId = parseInt(req.query.stableId as string);
    
    const result = await costService.getCostReport(query);
    res.json(ResponseUtil.success(result));
  },

  async getCategoryConsumptionStats(req: AuthRequest, res: Response) {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const result = await costService.getCategoryConsumptionStats(startDate, endDate);
    res.json(ResponseUtil.success(result));
  },

  async getStableCostStats(req: AuthRequest, res: Response) {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const result = await costService.getStableCostStats(startDate, endDate);
    res.json(ResponseUtil.success(result));
  },

  async getMonthlyTrend(req: AuthRequest, res: Response) {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const result = await costService.getMonthlyTrend(year);
    res.json(ResponseUtil.success(result));
  },

  async getCostAnalysis(req: AuthRequest, res: Response) {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const result = await costService.getCostAnalysis(startDate, endDate);
    res.json(ResponseUtil.success(result));
  },

  async getInventoryValuation(req: AuthRequest, res: Response) {
    const result = await costService.getInventoryValuation();
    res.json(ResponseUtil.success(result));
  },

  async getLowStockAlerts(req: AuthRequest, res: Response) {
    const result = await costService.getLowStockAlerts();
    res.json(ResponseUtil.success(result));
  }
};

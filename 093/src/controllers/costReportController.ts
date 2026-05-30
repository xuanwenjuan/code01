import { Request, Response, NextFunction } from 'express';
import { CostReportService } from '../services/costReportService';
import { ResponseUtil } from '../utils/response';

export const costReportController = {
  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, categoryId } = req.body;
      const report = await CostReportService.generateReport({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        categoryId,
      });
      res.status(201).json(ResponseUtil.success(report, '生成成功'));
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const report = await CostReportService.getById(id);
      res.json(ResponseUtil.success(report, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await CostReportService.getList(
        page,
        pageSize,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      res.json(
        ResponseUtil.paginated(result.list, result.total, page, pageSize, '获取成功')
      );
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await CostReportService.delete(id);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const summary = await CostReportService.getSummary(startDate, endDate);
      res.json(ResponseUtil.success(summary, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getCategoryAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const analysis = await CostReportService.getCategoryAnalysis(startDate, endDate);
      res.json(ResponseUtil.success(analysis, '获取成功'));
    } catch (error) {
      next(error);
    }
  },

  async getMaterialAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const analysis = await CostReportService.getMaterialAnalysis(startDate, endDate);
      res.json(ResponseUtil.success(analysis, '获取成功'));
    } catch (error) {
      next(error);
    }
  },
};

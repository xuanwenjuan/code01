import { Request, Response } from 'express';
import statisticsService from '../services/statistics.service';
import ResponseUtil from '../utils/response';
import asyncHandler from '../middleware/asyncHandler.middleware';
import dayjs from 'dayjs';

export class StatisticsController {
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const data = await statisticsService.getDashboard();
    ResponseUtil.success(res, data, '查询成功');
  });

  getEquipmentStatistics = asyncHandler(async (req: Request, res: Response) => {
    const data = await statisticsService.getEquipmentStatistics();
    ResponseUtil.success(res, data, '查询成功');
  });

  getInspectionStatistics = asyncHandler(async (req: Request, res: Response) => {
    const data = await statisticsService.getInspectionStatistics();
    ResponseUtil.success(res, data, '查询成功');
  });

  getWorkOrderStatistics = asyncHandler(async (req: Request, res: Response) => {
    const data = await statisticsService.getWorkOrderStatistics();
    ResponseUtil.success(res, data, '查询成功');
  });

  getEquipmentByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const data = await statisticsService.getEquipmentByDepartment();
    ResponseUtil.success(res, data, '查询成功');
  });

  getInspectionByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? dayjs(startDate as string).toDate() : dayjs().subtract(30, 'day').toDate();
    const end = endDate ? dayjs(endDate as string).toDate() : dayjs().toDate();
    
    const data = await statisticsService.getInspectionByDateRange(start, end);
    ResponseUtil.success(res, data, '查询成功');
  });

  getWorkOrderByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? dayjs(startDate as string).toDate() : dayjs().subtract(30, 'day').toDate();
    const end = endDate ? dayjs(endDate as string).toDate() : dayjs().toDate();
    
    const data = await statisticsService.getWorkOrderByDateRange(start, end);
    ResponseUtil.success(res, data, '查询成功');
  });

  getMonthlyTrend = asyncHandler(async (req: Request, res: Response) => {
    const { year } = req.query;
    const y = year ? Number(year) : dayjs().year();
    
    const data = await statisticsService.getMonthlyTrend(y);
    ResponseUtil.success(res, data, '查询成功');
  });
}

export default new StatisticsController();

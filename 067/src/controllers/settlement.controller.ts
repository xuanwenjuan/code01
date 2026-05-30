import { Request, Response } from 'express';
import settlementService from '../services/settlement.service';
import { ResponseUtil } from '../utils/response';

export const generateDailySettlement = async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    const result = await settlementService.generateDailySettlement(date);
    res.json(ResponseUtil.success(result, '生成成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const settlement = await settlementService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(settlement));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, siteId, startDate, endDate, isSettled } = req.query;
    const result = await settlementService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      siteId: siteId ? Number(siteId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      isSettled: isSettled !== undefined ? isSettled === 'true' : undefined,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const confirmSettlement = async (req: Request, res: Response) => {
  try {
    const settlement = await settlementService.confirmSettlement(Number(req.params.id), req.user?.id);
    res.json(ResponseUtil.success(settlement, '结算成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const batchConfirmSettlement = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    const result = await settlementService.batchConfirmSettlement(ids, req.user?.id);
    res.json(ResponseUtil.success(result, '批量结算成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const stats = await settlementService.getStatistics({
      siteId: siteId ? Number(siteId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(ResponseUtil.success(stats));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getDetailedStatistics = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const stats = await settlementService.getDetailedStatistics({
      siteId: siteId ? Number(siteId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    res.json(ResponseUtil.success(stats));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getRevenueTrend = async (req: Request, res: Response) => {
  try {
    const { days, siteId } = req.query;
    const trend = await settlementService.getRevenueTrend({
      days: days ? Number(days) : undefined,
      siteId: siteId ? Number(siteId) : undefined,
    });
    res.json(ResponseUtil.success(trend));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getSiteRanking = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit, sortBy } = req.query;
    const ranking = await settlementService.getSiteRanking({
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy as 'totalAmount' | 'totalEnergy' | 'orderCount',
    });
    res.json(ResponseUtil.success(ranking));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const exportToExcel = async (req: Request, res: Response) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const buffer = await settlementService.exportToExcel({
      siteId: siteId ? Number(siteId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=settlement_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const exportSiteRankingToExcel = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit, sortBy } = req.query;
    const buffer = await settlementService.exportSiteRankingToExcel({
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy as 'totalAmount' | 'totalEnergy' | 'orderCount',
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=site_ranking_${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

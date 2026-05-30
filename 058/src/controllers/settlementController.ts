import { Request, Response } from 'express';
import { SettlementService } from '../services/settlementService';
import { Result } from '../utils/response';
import { SettlementStatus } from '../types';

export const createSettlement = async (req: Request, res: Response) => {
  const operatorId = req.user!.id;
  const { riderId, startDate, endDate } = req.body;
  const settlement = await SettlementService.createSettlement(
    riderId,
    new Date(startDate),
    new Date(endDate),
    operatorId
  );
  return Result.sendSuccess(res, settlement, '结算单创建成功');
};

export const batchCreateSettlements = async (req: Request, res: Response) => {
  const operatorId = req.user!.id;
  const { startDate, endDate } = req.body;
  const result = await SettlementService.batchCreateSettlements(
    new Date(startDate),
    new Date(endDate),
    operatorId
  );
  return Result.sendSuccess(res, result, '批量创建结算单成功');
};

export const confirmSettlement = async (req: Request, res: Response) => {
  const operatorId = req.user!.id;
  const { settlementId, remark } = req.body;
  const settlement = await SettlementService.confirmSettlement(Number(settlementId), operatorId, remark);
  return Result.sendSuccess(res, settlement, '结算确认成功');
};

export const cancelSettlement = async (req: Request, res: Response) => {
  const operatorId = req.user!.id;
  const { settlementId, remark } = req.body;
  await SettlementService.cancelSettlement(Number(settlementId), operatorId, remark);
  return Result.sendSuccess(res, null, '结算单取消成功');
};

export const getSettlementList = async (req: Request, res: Response) => {
  const { page, pageSize, status, startDate, endDate, riderId } = req.query;
  const result = await SettlementService.getSettlementList(
    riderId ? Number(riderId) : undefined,
    status as SettlementStatus,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined,
    Number(page),
    Number(pageSize)
  );
  return Result.sendSuccess(res, result, '获取成功');
};

export const getSettlementDetail = async (req: Request, res: Response) => {
  const { settlementId } = req.params;
  const settlement = await SettlementService.getSettlementDetail(Number(settlementId));
  return Result.sendSuccess(res, settlement, '获取成功');
};

export const getSettlementOrders = async (req: Request, res: Response) => {
  const { settlementId } = req.params;
  const orders = await SettlementService.getSettlementOrders(Number(settlementId));
  return Result.sendSuccess(res, orders, '获取成功');
};

export const getRiderSettlementSummary = async (req: Request, res: Response) => {
  const { riderId } = req.params;
  const { startDate, endDate } = req.query;
  const summary = await SettlementService.getRiderSettlementSummary(
    Number(riderId),
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  return Result.sendSuccess(res, summary, '获取成功');
};

export const getSettlementStatistics = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const statistics = await SettlementService.getSettlementStatistics(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  return Result.sendSuccess(res, statistics, '获取成功');
};

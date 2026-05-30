import { Request, Response, NextFunction } from 'express';
import * as exhibitionService from '../services/exhibitionService';
import { successResponse } from '../middleware/responseHandler';

export const createExhibition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exhibition = await exhibitionService.createExhibition(req.body);
    successResponse(res, exhibition, '创建展览成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getAllExhibitions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await exhibitionService.getAllExhibitions(page, pageSize);
    successResponse(res, result, '获取展览列表成功');
  } catch (error) {
    next(error);
  }
};

export const getExhibitionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const exhibition = await exhibitionService.getExhibitionById(Number(id));
    successResponse(res, exhibition, '获取展览成功');
  } catch (error) {
    next(error);
  }
};

export const updateExhibition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const exhibition = await exhibitionService.updateExhibition(Number(id), req.body);
    successResponse(res, exhibition, '更新展览成功');
  } catch (error) {
    next(error);
  }
};

export const addCollectionToExhibition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { exhibitionId, collectionId } = req.params;
    const { position, displayOrder } = req.body;
    const result = await exhibitionService.addCollectionToExhibition(
      Number(exhibitionId),
      Number(collectionId),
      position,
      displayOrder
    );
    successResponse(res, result, '添加藏品到展览成功', 201);
  } catch (error) {
    next(error);
  }
};

export const removeCollectionFromExhibition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { exhibitionId, collectionId } = req.params;
    await exhibitionService.removeCollectionFromExhibition(Number(exhibitionId), Number(collectionId));
    successResponse(res, null, '从展览移除藏品成功');
  } catch (error) {
    next(error);
  }
};

export const getExhibitionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await exhibitionService.getExhibitionStats(Number(id));
    successResponse(res, stats, '获取展览统计成功');
  } catch (error) {
    next(error);
  }
};

export const getExhibitionStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await exhibitionService.getExhibitionStatistics(Number(id));
    successResponse(res, stats, '获取展览详细统计成功');
  } catch (error) {
    next(error);
  }
};

export const rotateCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { exhibitionId, oldCollectionId, newCollectionId } = req.params;
    const { position } = req.body;
    const result = await exhibitionService.rotateCollectionInExhibition(
      Number(exhibitionId),
      Number(oldCollectionId),
      Number(newCollectionId),
      position
    );
    successResponse(res, result, '藏品轮换成功');
  } catch (error) {
    next(error);
  }
};

export const updateCollectionCost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { exhibitionId, collectionId } = req.params;
    const { maintenanceCost } = req.body;
    const result = await exhibitionService.updateExhibitionCollectionCost(
      Number(exhibitionId),
      Number(collectionId),
      maintenanceCost
    );
    successResponse(res, result, '更新保养成本成功');
  } catch (error) {
    next(error);
  }
};

export const getAllStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const stats = await exhibitionService.getAllExhibitionStatistics(startDate, endDate);
    successResponse(res, stats, '获取展览全局统计成功');
  } catch (error) {
    next(error);
  }
};

export const getExhibitionLedger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const ledger = await exhibitionService.getExhibitionLedger(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    successResponse(res, ledger, '获取展览台账成功');
  } catch (error) {
    next(error);
  }
};

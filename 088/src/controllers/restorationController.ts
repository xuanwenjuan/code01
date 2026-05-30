import { Request, Response, NextFunction } from 'express';
import * as restorationService from '../services/restorationService';
import { successResponse } from '../middleware/responseHandler';
import { RestorationStatus, RequestWithUser } from '../types';

export const createRestoration = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collectionId, damageDescription } = req.body;
    const restoration = await restorationService.createRestoration(
      Number(collectionId),
      req.user?.userId!,
      damageDescription
    );
    successResponse(res, restoration, '创建修复记录成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getAllRestorations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const status = req.query.status as RestorationStatus | undefined;
    const result = await restorationService.getAllRestorations(page, pageSize, status);
    successResponse(res, result, '获取修复记录列表成功');
  } catch (error) {
    next(error);
  }
};

export const getRestorationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const restoration = await restorationService.getRestorationById(Number(id));
    successResponse(res, restoration, '获取修复记录成功');
  } catch (error) {
    next(error);
  }
};

export const approvePlan = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { restorationPlan } = req.body;
    const restoration = await restorationService.approvePlan(
      Number(id),
      req.user?.userId!,
      restorationPlan
    );
    successResponse(res, restoration, '方案审批成功');
  } catch (error) {
    next(error);
  }
};

export const startRestoration = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const restoration = await restorationService.startRestoration(Number(id), req.user?.userId!);
    successResponse(res, restoration, '开始修复成功');
  } catch (error) {
    next(error);
  }
};

export const completeRestoration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { restorationNotes, cost } = req.body;
    const restoration = await restorationService.completeRestoration(Number(id), restorationNotes, cost);
    successResponse(res, restoration, '完成修复成功');
  } catch (error) {
    next(error);
  }
};

export const acceptRestoration = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { 验收Notes } = req.body;
    const restoration = await restorationService.acceptRestoration(Number(id), req.user?.userId!, 验收Notes);
    successResponse(res, restoration, '验收成功');
  } catch (error) {
    next(error);
  }
};

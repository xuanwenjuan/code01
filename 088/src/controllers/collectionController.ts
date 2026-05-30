import { Request, Response, NextFunction } from 'express';
import * as collectionService from '../services/collectionService';
import { successResponse } from '../middleware/responseHandler';
import { CollectionStatus, RequestWithUser } from '../types';

export const createCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const collection = await collectionService.createCollection(req.body);
    successResponse(res, collection, '创建藏品成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getAllCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const filters = {
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      status: req.query.status as CollectionStatus | undefined,
      keyword: req.query.keyword as string | undefined
    };
    const result = await collectionService.getAllCollections(page, pageSize, filters);
    successResponse(res, result, '获取藏品列表成功');
  } catch (error) {
    next(error);
  }
};

export const getCollectionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = await collectionService.getCollectionById(Number(id));
    successResponse(res, collection, '获取藏品成功');
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = await collectionService.updateCollection(Number(id), req.body);
    successResponse(res, collection, '更新藏品成功');
  } catch (error) {
    next(error);
  }
};

export const updateCollectionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const collection = await collectionService.updateCollectionStatus(Number(id), status);
    successResponse(res, collection, '更新藏品状态成功');
  } catch (error) {
    next(error);
  }
};

export const recordMaintenance = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collectionId } = req.params;
    const { maintenanceType, description, cost } = req.body;
    const record = await collectionService.recordMaintenance(Number(collectionId), {
      performedBy: req.user?.userId!,
      maintenanceType,
      description,
      cost
    });
    successResponse(res, record, '记录保养成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceDueSoon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = Number(req.query.days) || 7;
    const collections = await collectionService.getMaintenanceDueSoon(days);
    successResponse(res, collections, '获取即将到期保养的藏品成功');
  } catch (error) {
    next(error);
  }
};

export const batchImportCollections = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await collectionService.batchImportCollections(req.body, req.user?.userId!);
    successResponse(res, result, '批量导入完成');
  } catch (error) {
    next(error);
  }
};

export const exportCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      status: req.query.status as CollectionStatus | undefined
    };
    const collections = await collectionService.getCollectionsForExport(filters);
    successResponse(res, collections, '导出藏品数据成功');
  } catch (error) {
    next(error);
  }
};

export const getCollectionStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const statistics = await collectionService.getCollectionStatistics();
    successResponse(res, statistics, '获取藏品统计成功');
  } catch (error) {
    next(error);
  }
};

export const archiveCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = await collectionService.archiveCollection(Number(id));
    successResponse(res, collection, '封存藏品成功');
  } catch (error) {
    next(error);
  }
};

export const unarchiveCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const collection = await collectionService.unarchiveCollection(Number(id));
    successResponse(res, collection, '解封藏品成功');
  } catch (error) {
    next(error);
  }
};

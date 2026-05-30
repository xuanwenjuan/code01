import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';
import { ResponseUtil } from '../utils/response';
import { OperationType } from '../types';

export const getOperationLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 20, module, operationType, operatorId, startDate, endDate } = req.query;

    const where: any = {};
    
    if (module) {
      where.module = module;
    }
    if (operationType) {
      where.operationType = operationType;
    }
    if (operatorId) {
      where.operatorId = Number(operatorId);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.$lte = new Date(endDate as string);
      }
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    }));
  } catch (error) {
    next(error);
  }
};

export const getLogsByModule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { module } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const { count, rows } = await OperationLog.findAndCountAll({
      where: { module },
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    }));
  } catch (error) {
    next(error);
  }
};

export const getLogsByRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { module, recordId } = req.params;

    const logs = await OperationLog.findAll({
      where: { 
        module, 
        recordId: Number(recordId) 
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(ResponseUtil.success(logs));
  } catch (error) {
    next(error);
  }
};

export const getOperationTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = Object.values(OperationType).map(type => ({
      value: type,
      label: type
    }));

    res.json(ResponseUtil.success(types));
  } catch (error) {
    next(error);
  }
};

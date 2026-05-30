import { Request, Response, NextFunction } from 'express';
import * as logService from '../services/logService';

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await logService.getOperationLogs(req.query);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await logService.getOperationLogById(Number(id));
    if (!result) {
      return res.error('日志不存在', 404);
    }
    res.success(result);
  } catch (error) {
    next(error);
  }
};

import { Request, Response } from 'express';
import { OperationLogService } from '../services/operationLogService';
import { Result } from '../utils/response';
import { OperationType } from '../types';

export const getOperationLogList = async (req: Request, res: Response) => {
  const { module, operationType, operatorId, startDate, endDate, page, pageSize } = req.query;
  
  const result = await OperationLogService.getLogList({
    module: module as string,
    operationType: operationType as OperationType,
    operatorId: operatorId ? Number(operatorId) : undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 20
  });

  return Result.sendSuccess(res, result, '获取成功');
};

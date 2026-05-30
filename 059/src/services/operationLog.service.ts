import { OperationLog } from '../models';
import { OperationType } from '../types';
import { Request } from 'express';

export const createOperationLog = async (
  req: Request,
  module: string,
  operation: OperationType,
  description: string,
  responseData?: any
) => {
  try {
    await OperationLog.create({
      userId: req.user?.userId,
      username: req.user?.username,
      module,
      operation,
      description,
      ip: req.ip || req.connection.remoteAddress,
      requestData: JSON.stringify(req.body),
      responseData: responseData ? JSON.stringify(responseData) : undefined
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
};

export default { createOperationLog };

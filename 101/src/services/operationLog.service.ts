import { Transaction } from 'sequelize';
import OperationLog from '../models/OperationLog.model';
import { OperationType } from '../constants/enum';
import logger from '../utils/logger';

interface LogData {
  userId?: number;
  username?: string;
  module: string;
  operation: OperationType | string;
  method: string;
  url?: string;
  ip?: string;
  params?: Record<string, any>;
  result?: any;
  status: 'SUCCESS' | 'FAIL';
  errorMessage?: string;
  duration?: number;
  description?: string;
}

class OperationLogService {
  async createLog(data: LogData, transaction?: Transaction): Promise<void> {
    try {
      const logData: any = {
        userId: data.userId,
        username: data.username,
        module: data.module,
        operation: data.operation,
        method: data.method,
        url: data.url,
        ip: data.ip,
        status: data.status,
        errorMessage: data.errorMessage,
        duration: data.duration
      };

      if (data.params) {
        const paramsStr = JSON.stringify(data.params);
        logData.params = paramsStr.substring(0, 1000);
      }

      if (data.result) {
        const resultStr = typeof data.result === 'string' 
          ? data.result 
          : JSON.stringify(data.result);
        logData.result = resultStr.substring(0, 1000);
      }

      if (data.description) {
        logData.description = data.description;
      }

      await OperationLog.create(logData, { transaction });
    } catch (error) {
      logger.error('创建操作日志失败:', error);
    }
  }

  async logSuccess(
    module: string,
    operation: OperationType | string,
    user?: { id: number; username: string },
    params?: Record<string, any>,
    result?: any,
    description?: string
  ): Promise<void> {
    await this.createLog({
      userId: user?.id,
      username: user?.username,
      module,
      operation,
      method: 'SYSTEM',
      params,
      result,
      status: 'SUCCESS',
      description
    });
  }

  async logFail(
    module: string,
    operation: OperationType | string,
    errorMessage: string,
    user?: { id: number; username: string },
    params?: Record<string, any>
  ): Promise<void> {
    await this.createLog({
      userId: user?.id,
      username: user?.username,
      module,
      operation,
      method: 'SYSTEM',
      params,
      status: 'FAIL',
      errorMessage
    });
  }
}

export default new OperationLogService();

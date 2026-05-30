import { Response, NextFunction } from 'express';
import { OperationLog } from '../models';
import { RequestWithUser } from './auth';
import { OperationModule, OperationType } from '../types';

export interface LogOptions {
  module: OperationModule;
  operation: OperationType;
  description?: string;
  logParams?: boolean;
  logResponse?: boolean;
}

export const logOperation = (options: LogOptions) => {
  return async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const startTime = Date.now();
    const originalSend = res.send;
    let responseData: any;

    res.send = function (this: Response, body: any): Response {
      responseData = body;
      return originalSend.call(this, body);
    };

    const finishLog = async (status: boolean, errorMessage?: string) => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;

        await OperationLog.create({
          userId: req.user?.userId,
          username: req.user?.username || 'anonymous',
          operation: options.operation,
          module: options.module,
          description: options.description,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          requestParams: options.logParams
            ? JSON.stringify({
                method: req.method,
                url: req.originalUrl,
                params: req.params,
                query: req.query,
                body: req.body
              })
            : null,
          responseData: options.logResponse && responseData ? JSON.stringify(responseData) : null,
          status,
          errorMessage,
          duration,
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Failed to create operation log:', error);
      }
    };

    res.on('finish', () => {
      const status = res.statusCode >= 200 && res.statusCode < 400;
      finishLog(status, !status ? `HTTP ${res.statusCode}` : undefined);
    });

    res.on('close', () => {
      if (!res.writableEnded) {
        finishLog(false, 'Connection closed');
      }
    });

    next();
  };
};

export const getOperationLogs = async (filters: {
  userId?: number;
  module?: OperationModule;
  operation?: OperationType;
  startDate?: Date;
  endDate?: Date;
  status?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ data: any[]; total: number; page: number; pageSize: number }> => {
  const { page = 1, pageSize = 20, ...whereFilters } = filters;

  const where: any = {};

  if (whereFilters.userId !== undefined) {
    where.userId = whereFilters.userId;
  }

  if (whereFilters.module !== undefined) {
    where.module = whereFilters.module;
  }

  if (whereFilters.operation !== undefined) {
    where.operation = whereFilters.operation;
  }

  if (whereFilters.status !== undefined) {
    where.status = whereFilters.status;
  }

  if (whereFilters.startDate && whereFilters.endDate) {
    where.createdAt = {
      between: [whereFilters.startDate, whereFilters.endDate]
    };
  }

  const { count, rows } = await OperationLog.findAndCountAll({
    where,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    order: [['createdAt', 'DESC']]
  });

  return {
    data: rows,
    total: count,
    page,
    pageSize
  };
};

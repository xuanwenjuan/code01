import { Request } from 'express';
import { OperationLog } from '../models/OperationLog';
import { LogModule, LogAction } from '../types';

interface CreateLogData {
  module: LogModule | string;
  action: LogAction | string;
  targetId?: number;
  targetType?: string;
  oldData?: any;
  newData?: any;
  description?: string;
}

export const createOperationLog = async (
  req: Request,
  data: CreateLogData
) => {
  try {
    const user = (req as any).user;
    await OperationLog.create({
      module: data.module,
      action: data.action,
      operatorId: user?.userId || 0,
      operatorName: user?.username || 'system',
      targetId: data.targetId,
      targetType: data.targetType,
      oldData: data.oldData,
      newData: data.newData,
      ip: req.ip || (req.socket?.remoteAddress),
      userAgent: req.get('user-agent') || '',
      description: data.description
    });
  } catch (error) {
    console.error('Failed to create operation log:', error);
  }
};

export const getOperationLogs = async (filters: {
  module?: string;
  action?: string;
  operatorId?: number;
  targetId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) => {
  const {
    module,
    action,
    operatorId,
    targetId,
    startDate,
    endDate,
    page = 1,
    pageSize = 20
  } = filters;

  const where: any = {};

  if (module) where.module = module;
  if (action) where.action = action;
  if (operatorId) where.operatorId = operatorId;
  if (targetId) where.targetId = targetId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.$gte = new Date(startDate);
    if (endDate) where.createdAt.$lte = new Date(endDate);
  }

  const { count, rows } = await OperationLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize
  };
};

export const getOperationLogById = async (id: number) => {
  return await OperationLog.findByPk(id);
};

export const createLogDecorator = (
  module: LogModule | string,
  action: LogAction | string,
  getTargetId?: (result: any) => number,
  getDescription?: (result: any) => string
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const req = args.find((arg: any) => arg && arg.constructor && arg.constructor.name === 'Request');
      const result = await originalMethod.apply(this, args);

      if (req) {
        const targetId = getTargetId ? getTargetId(result) : undefined;
        const description = getDescription ? getDescription(result) : undefined;

        await createOperationLog(req, {
          module,
          action,
          targetId,
          description
        });
      }

      return result;
    };
  };
};

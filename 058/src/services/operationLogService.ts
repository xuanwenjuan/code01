import { Request } from 'express';
import { OperationLog, User } from '../models';
import { OperationType } from '../types';

export class OperationLogService {
  static async createLog(
    operationType: OperationType,
    module: string,
    options: {
      operatorId?: number;
      recordId?: number;
      beforeData?: any;
      afterData?: any;
      remark?: string;
      req?: Request;
    }
  ) {
    const { operatorId, recordId, beforeData, afterData, remark, req } = options;

    let operatorName: string | undefined;
    if (operatorId) {
      const user = await User.findByPk(operatorId, { attributes: ['username'] });
      operatorName = user?.username;
    }

    const ip = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');

    await OperationLog.create({
      operatorId,
      operatorName,
      operationType,
      module,
      recordId,
      beforeData: beforeData ? JSON.stringify(beforeData) : undefined,
      afterData: afterData ? JSON.stringify(afterData) : undefined,
      remark,
      ip,
      userAgent
    });
  }

  static async getLogList(
    params: {
      module?: string;
      operationType?: OperationType;
      operatorId?: number;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      pageSize?: number;
    }
  ) {
    const { page = 1, pageSize = 10, ...where } = params;
    const offset = (page - 1) * pageSize;

    const query: any = {};
    if (where.module) query.module = where.module;
    if (where.operationType) query.operationType = where.operationType;
    if (where.operatorId) query.operatorId = where.operatorId;
    if (where.startDate && where.endDate) {
      query.createdAt = { $between: [where.startDate, where.endDate] };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where: query,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'operator', attributes: ['username'] }]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }
}

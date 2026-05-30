import OperationLog from '../models/OperationLog';
import { OperationModule, OperationType, PageResult } from '../types';
import { Request } from 'express';
import { Op } from 'sequelize';

export interface CreateLogParams {
  module: OperationModule;
  type: OperationType;
  targetId?: number;
  targetName?: string;
  operatorId: number;
  operatorName: string;
  storeId?: number;
  beforeData?: any;
  afterData?: any;
  remark?: string;
  req?: Request;
}

export interface LogQueryParams {
  page: number;
  pageSize: number;
  module?: OperationModule;
  type?: OperationType;
  operatorId?: number;
  storeId?: number;
  targetId?: number;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

export class OperationLogService {
  static async create(params: CreateLogParams): Promise<OperationLog> {
    const logData: any = {
      module: params.module,
      type: params.type,
      targetId: params.targetId,
      targetName: params.targetName,
      operatorId: params.operatorId,
      operatorName: params.operatorName,
      storeId: params.storeId,
      beforeData: params.beforeData ? JSON.stringify(params.beforeData) : undefined,
      afterData: params.afterData ? JSON.stringify(params.afterData) : undefined,
      remark: params.remark
    };

    if (params.req) {
      logData.ip = params.req.ip || params.req.socket.remoteAddress;
      logData.userAgent = params.req.get('User-Agent');
    }

    return await OperationLog.create(logData);
  }

  static async getList(params: LogQueryParams): Promise<PageResult<OperationLog>> {
    const { page, pageSize, module, type, operatorId, storeId, targetId, startDate, endDate, keyword } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (module) where.module = module;
    if (type) where.type = type;
    if (operatorId) where.operatorId = operatorId;
    if (storeId) where.storeId = storeId;
    if (targetId) where.targetId = targetId;

    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: endDate };
    }

    if (keyword) {
      where[Op.or] = [
        { targetName: { [Op.like]: `%${keyword}%` } },
        { operatorName: { [Op.like]: `%${keyword}%` } },
        { remark: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getById(id: number): Promise<OperationLog | null> {
    return await OperationLog.findByPk(id);
  }
}

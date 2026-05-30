import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import OperationLog from '../models/OperationLog';
import ResponseUtil from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getOperationLogList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      userId,
      module,
      operation,
      success,
      startDate,
      endDate,
    } = req.query;

    const where: any = {};

    if (userId) where.userId = userId;
    if (module) where.module = module;
    if (operation) where.operation = operation;
    if (success !== undefined) where.success = success === 'true';
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['id', 'DESC']],
    });

    ResponseUtil.pagination(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '查询成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getOperationLogById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const log = await OperationLog.findByPk(id);

    if (!log) {
      ResponseUtil.notFound(res, '日志不存在');
      return;
    }

    ResponseUtil.success(res, log);
  } catch (error) {
    next(error);
  }
};

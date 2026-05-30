import { Request, Response } from 'express';
import operationLogService from '../services/operationLog.service';
import { ResponseUtil } from '../utils/response';

export const getList = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, userId, method, startDate, endDate, keyword } = req.query;
    const result = await operationLogService.getList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      userId: userId ? Number(userId) : undefined,
      method: method as string,
      startDate: startDate as string,
      endDate: endDate as string,
      keyword: keyword as string,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const log = await operationLogService.getById(Number(req.params.id));
    res.json(ResponseUtil.success(log));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

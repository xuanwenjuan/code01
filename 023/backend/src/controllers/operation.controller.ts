import { Request, Response } from 'express';
import operationService from '../services/operation.service';
import { OperationLog, ApiResponse } from '../types';

export const getLogs = async (req: Request, res: Response<ApiResponse<OperationLog[]>>) => {
  try {
    const keyword = req.query.keyword as string | undefined;
    let logs;
    if (keyword) {
      logs = await operationService.searchLogs(keyword);
    } else {
      logs = await operationService.getAllLogs();
    }
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取操作日志失败' });
  }
};

export const getLogsByModule = async (req: Request, res: Response<ApiResponse<OperationLog[]>>) => {
  try {
    const module = req.params.module;
    const logs = await operationService.getLogsByModule(module);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取操作日志失败' });
  }
};

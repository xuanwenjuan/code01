import { Request, Response, NextFunction } from 'express';
import OperationLogService from '../services/OperationLogService';
import { AuthRequest } from './auth';

export interface LogOptions {
  module: string;
  operation: string;
}

export const operationLog = (options: LogOptions) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    let responseData: any;

    res.send = function(this: Response, data: any): Response {
      responseData = data;
      return originalSend.call(this, data);
    };

    res.on('finish', async () => {
      try {
        const executionTime = Date.now() - startTime;
        const status = res.statusCode >= 200 && res.statusCode < 300 ? 1 : 0;
        
        let errorMsg: string | undefined;
        if (status === 0 && responseData) {
          try {
            const parsed = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
            errorMsg = parsed.message || parsed.error;
          } catch {
            errorMsg = '操作失败';
          }
        }

        const params = {
          body: req.body,
          query: req.query,
          params: req.params
        };

        await OperationLogService.createLog({
          userId: req.user?.id,
          username: req.user?.username,
          module: options.module,
          operation: options.operation,
          method: req.method,
          params: JSON.stringify(params),
          ip: req.ip || req.connection.remoteAddress,
          status,
          errorMsg,
          executionTime
        });
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    });

    next();
  };
};

export const LogModules = {
  CATEGORY: '类目管理',
  COLLECTION: '藏品管理',
  WORKORDER: '工单管理',
  SETTLEMENT: '结算管理',
  AUTH: '认证管理'
};

export const LogOperations = {
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
  VIEW: '查看',
  LIST: '列表',
  SUBMIT_INSPECTION: '提交检测',
  SUBMIT_QUOTATION: '提交报价',
  CONFIRM_QUOTATION: '确认报价',
  REJECT_QUOTATION: '拒绝报价',
  START_REPAIR: '开始维修',
  COMPLETE_REPAIR: '完成维修',
  DELIVER: '交付客户',
  PUT_ON_CONSIGN: '上架寄卖',
  MARK_SOLD: '标记售出',
  CANCEL: '取消',
  ASSIGN_REPAIRER: '分配维修师',
  CONFIRM_SETTLEMENT: '确认结算',
  CANCEL_SETTLEMENT: '取消结算',
  GENERATE_MONTHLY: '生成月度结算',
  EXPORT: '导出',
  BATCH_UPDATE: '批量更新',
  BATCH_DELETE: '批量删除'
};

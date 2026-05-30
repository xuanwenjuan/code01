import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';
import { AuthRequest } from './auth.middleware';

const moduleMap: Record<string, string> = {
  '/api/auth': '认证模块',
  '/api/work-areas': '作业区域模块',
  '/api/cleaners': '保洁人员模块',
  '/api/work-orders': '工单模块',
  '/api/performances': '绩效模块'
};

const operationMap: Record<string, Record<string, string>> = {
  GET: { 'default': '查询' },
  POST: { 'default': '新增' },
  PUT: { 'default': '更新' },
  DELETE: { 'default': '删除' }
};

export const operationLogMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseBody: any;

  res.send = function(this: Response, body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const path = req.path;
      const method = req.method;

      let module = '其他模块';
      for (const [prefix, name] of Object.entries(moduleMap)) {
        if (path.startsWith(prefix)) {
          module = name;
          break;
        }
      }

      let operation = operationMap[method]?.['default'] || method;
      if (path.includes('/login')) operation = '登录';
      if (path.includes('/logout')) operation = '登出';
      if (path.includes('/assign')) operation = '分配';
      if (path.includes('/accept')) operation = '接单';
      if (path.includes('/complete')) operation = '完成';
      if (path.includes('/review')) operation = '审核';

      let result: string | undefined;
      let errorMessage: string | undefined;

      try {
        if (responseBody) {
          const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          if (parsed.code === 200 || parsed.code === 201) {
            result = JSON.stringify({ success: true, duration });
          } else {
            errorMessage = parsed.message;
          }
        }
      } catch {}

      await OperationLog.create({
        userId: req.user?.id,
        username: req.user?.username,
        module,
        operation,
        method,
        url: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress,
        params: {
          body: req.body,
          query: req.query,
          params: req.params
        },
        result,
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'fail',
        errorMessage
      });
    } catch (error) {
      console.error('Failed to create operation log:', error);
    }
  });

  next();
};
import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';
import { Logger } from '../utils/logger';

const logModules: Record<string, string> = {
  '/api/auth': '认证',
  '/api/service-categories': '服务类目',
  '/api/workers': '师傅管理',
  '/api/orders': '订单管理',
  '/api/settlements': '结算管理',
  '/api/users': '用户管理'
};

const logOperations: Record<string, string> = {
  POST: '新增',
  PUT: '修改',
  DELETE: '删除',
  GET: '查询'
};

export const operationLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  let responseBody: any;
  
  res.send = function(body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const path = req.path;
      
      let module = '其他';
      for (const [prefix, name] of Object.entries(logModules)) {
        if (path.startsWith(prefix)) {
          module = name;
          break;
        }
      }

      const operation = logOperations[req.method] || req.method;
      
      let params = '';
      if (Object.keys(req.params).length > 0) {
        params += `Params: ${JSON.stringify(req.params)}; `;
      }
      if (Object.keys(req.query).length > 0) {
        params += `Query: ${JSON.stringify(req.query)}; `;
      }
      if (Object.keys(req.body).length > 0) {
        const body = { ...req.body };
        if (body.password) delete body.password;
        params += `Body: ${JSON.stringify(body)}`;
      }

      let result = '';
      let errorMessage = '';
      let status = true;

      if (responseBody) {
        try {
          const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          status = parsed.code === 200 || parsed.code === 201;
          if (!status) {
            errorMessage = parsed.message || '操作失败';
          }
          result = JSON.stringify({ code: parsed.code, message: parsed.message });
        } catch {
          result = responseBody.substring(0, 500);
        }
      }

      await OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        module,
        operation,
        method: req.method,
        url: path,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        params: params || undefined,
        result: result || undefined,
        status,
        errorMessage: errorMessage || undefined,
        duration
      });
    } catch (error) {
      Logger.error('保存操作日志失败', error);
    }
  });

  next();
};

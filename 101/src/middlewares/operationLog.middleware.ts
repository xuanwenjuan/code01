import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog.model';

const moduleMapping: Record<string, string> = {
  '/api/auth': '认证模块',
  '/api/categories': '品类模块',
  '/api/pigeons': '赛鸽模块',
  '/api/work-orders': '工单模块',
  '/api/expenses': '开销模块',
  '/api/breeding': '繁育模块',
  '/api/users': '用户模块',
  '/api/logs': '日志模块'
};

const operationMapping: Record<string, Record<string, string>> = {
  POST: {
    '/login': '登录',
    '/register': '注册',
    'default': '新增'
  },
  PUT: {
    'default': '修改'
  },
  DELETE: {
    'default': '删除'
  },
  GET: {
    'default': '查询'
  }
};

export const operationLogMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseBody: any;

  res.send = function(this: Response, body: any): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const method = req.method;
      const url = req.path;
      
      let moduleName = '其他模块';
      for (const [path, module] of Object.entries(moduleMapping)) {
        if (url.startsWith(path)) {
          moduleName = module;
          break;
        }
      }

      let operation = operationMapping[method]?.['default'] || '未知操作';
      for (const [path, op] of Object.entries(operationMapping[method] || {})) {
        if (path !== 'default' && url.includes(path)) {
          operation = op;
          break;
        }
      }

      let params = '';
      if (Object.keys(req.body).length > 0) {
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '***';
        params = JSON.stringify(bodyCopy);
      } else if (Object.keys(req.query).length > 0) {
        params = JSON.stringify(req.query);
      }

      let result = '';
      let status: 'SUCCESS' | 'FAIL' = 'SUCCESS';
      let errorMessage = '';

      if (responseBody) {
        try {
          const parsed = typeof responseBody === 'string' 
            ? JSON.parse(responseBody) 
            : responseBody;
          result = JSON.stringify(parsed);
          status = parsed.success ? 'SUCCESS' : 'FAIL';
          if (!parsed.success) {
            errorMessage = parsed.message || '';
          }
        } catch {
          result = responseBody.toString();
        }
      }

      await OperationLog.create({
        userId: req.user?.id,
        username: req.user?.username,
        module: moduleName,
        operation,
        method,
        url,
        ip: req.ip || req.socket.remoteAddress,
        params,
        result: result.substring(0, 1000),
        status,
        errorMessage,
        duration
      });
    } catch (error) {
    }
  });

  next();
};

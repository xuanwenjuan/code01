import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';
import logger from '../config/logger';

const moduleMapping: Record<string, string> = {
  '/api/auth': '认证模块',
  '/api/users': '用户管理',
  '/api/categories': '菌种分类',
  '/api/mother-strains': '母种档案',
  '/api/batches': '培育批次',
  '/api/traceability': '溯源台账'
};

export const operationLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalJson = res.json;
  let responseData: any;

  res.json = function(data: any) {
    responseData = data;
    return originalJson.call(this, data);
  };

  res.on('finish', async () => {
    try {
      const executionTime = Date.now() - startTime;
      const moduleName = Object.keys(moduleMapping).find(key => 
        req.path.startsWith(key)
      ) || '其他模块';

      await OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username || 'anonymous',
        module: moduleMapping[moduleName] || moduleName,
        operation: `${req.method} ${req.path}`,
        method: req.method,
        url: req.path,
        ip: req.ip || req.socket.remoteAddress || '',
        params: {
          query: req.query,
          body: req.method !== 'GET' ? req.body : {},
          params: req.params
        },
        result: responseData?.success ? responseData.data : null,
        status: responseData?.success !== false,
        errorMessage: !responseData?.success ? responseData?.message : '',
        executionTime
      });
    } catch (error) {
      logger.error('操作日志记录失败:', error);
    }
  });

  next();
};
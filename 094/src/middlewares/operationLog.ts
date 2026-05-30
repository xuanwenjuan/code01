import { Request, Response, NextFunction } from 'express';
import { OperationLogService } from '../services/operationLog.service';
import { LogModule, LogAction } from '../types';

const routeLogMapping: Record<string, { module: LogModule; action: LogAction; description: string }> = {
  'POST:/api/materials': { module: LogModule.MATERIAL, action: LogAction.CREATE, description: '创建物料' },
  'PUT:/api/materials/:id': { module: LogModule.MATERIAL, action: LogAction.UPDATE, description: '更新物料' },
  'DELETE:/api/materials/:id': { module: LogModule.MATERIAL, action: LogAction.DELETE, description: '删除物料' },
  'POST:/api/materials/batch-stock': { module: LogModule.MATERIAL, action: LogAction.UPDATE, description: '批量更新库存' },
  
  'POST:/api/material-categories': { module: LogModule.MATERIAL_CATEGORY, action: LogAction.CREATE, description: '创建物料类目' },
  'PUT:/api/material-categories/:id': { module: LogModule.MATERIAL_CATEGORY, action: LogAction.UPDATE, description: '更新物料类目' },
  'DELETE:/api/material-categories/:id': { module: LogModule.MATERIAL_CATEGORY, action: LogAction.DELETE, description: '删除物料类目' },
  
  'POST:/api/work-orders': { module: LogModule.WORK_ORDER, action: LogAction.CREATE, description: '创建工单' },
  'PUT:/api/work-orders/:id': { module: LogModule.WORK_ORDER, action: LogAction.UPDATE, description: '更新工单' },
  'DELETE:/api/work-orders/:id': { module: LogModule.WORK_ORDER, action: LogAction.DELETE, description: '删除工单' },
  'PATCH:/api/work-orders/:id/status': { module: LogModule.WORK_ORDER, action: LogAction.UPDATE, description: '更新工单状态' },
  'PATCH:/api/work-orders/:id/pay-deposit': { module: LogModule.WORK_ORDER, action: LogAction.PAY, description: '支付工单定金' },
  
  'POST:/api/material-consumptions': { module: LogModule.MATERIAL_CONSUMPTION, action: LogAction.COLLECT, description: '物料领用' },
  'PUT:/api/material-consumptions/:id': { module: LogModule.MATERIAL_CONSUMPTION, action: LogAction.UPDATE, description: '更新物料消耗' },
  'DELETE:/api/material-consumptions/:id': { module: LogModule.MATERIAL_CONSUMPTION, action: LogAction.DELETE, description: '删除物料消耗' },
  
  'POST:/api/auth/login': { module: LogModule.AUTH, action: LogAction.CREATE, description: '用户登录' },
};

const matchRoute = (method: string, path: string): { module: LogModule; action: LogAction; description: string } | null => {
  for (const [route, config] of Object.entries(routeLogMapping)) {
    const [routeMethod, routePath] = route.split(':');
    if (routeMethod !== method) continue;
    
    const routePattern = routePath
      .replace(/:\w+/g, '[^/]+')
      .replace(/\*/g, '.*');
    
    const regex = new RegExp(`^${routePattern}$`);
    if (regex.test(path)) {
      return config;
    }
  }
  return null;
};

export const operationLogMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseData: any;

  res.send = function (data: any) {
    responseData = data;
    return originalSend.call(this, data);
  };

  const logConfig = matchRoute(req.method, req.path);

  res.on('finish', async () => {
    if (logConfig && req.user) {
      try {
        const duration = Date.now() - startTime;
        const success = res.statusCode >= 200 && res.statusCode < 300;
        
        if (success) {
          await OperationLogService.logSuccess(
            req,
            logConfig.module,
            logConfig.action,
            logConfig.description,
            duration,
            responseData
          );
        }
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    }
  });

  next();
};

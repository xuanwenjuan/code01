import { Request, Response, NextFunction } from 'express';
import OperationLog, { OperationType } from '../models/OperationLog';

export const operationLog = (module: string, operationType: OperationType, description?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseData: any;
    
    res.send = function(data: any) {
      responseData = data;
      return originalSend.call(this, data);
    };
    
    res.on('finish', async () => {
      try {
        let targetId: number | undefined;
        
        if (req.params.id) {
          targetId = parseInt(req.params.id);
        }
        
        const logDescription = description || `${req.method} ${req.path}`;
        
        await OperationLog.create({
          userId: req.user?.userId,
          operationType,
          module,
          targetId,
          description: logDescription,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          requestParams: JSON.stringify({
            params: req.params,
            query: req.query,
            body: req.body,
          }),
          responseResult: typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
        });
      } catch (error) {
        console.error('创建操作日志失败:', error);
      }
    });
    
    next();
  };
};

export const Modules = {
  AUTH: 'auth',
  CATEGORY: 'category',
  EQUIPMENT: 'equipment',
  AUCTION: 'auction',
  ORDER: 'order',
  COMMISSION: 'commission',
  REGION: 'region',
  USER: 'user',
};


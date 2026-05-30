import { Request, Response, NextFunction } from 'express';
import { OperationLog, OperationType } from '../database/models/operationLog.model';

export const logOperation = (module: string, operation: OperationType, description?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseSent = false;

    res.send = function (this: Response, body: any) {
      if (!responseSent) {
        responseSent = true;
        const logData = {
          operatorId: req.user?.id,
          operatorName: req.user?.username,
          module,
          operation,
          description: description || `${module} ${operation}`,
          ip: req.ip || req.socket.remoteAddress,
          requestParams: JSON.stringify({
            query: req.query,
            params: req.params,
            body: req.body,
          }),
          responseResult: typeof body === 'string' ? body.substring(0, 1000) : JSON.stringify(body).substring(0, 1000),
        };

        OperationLog.create(logData).catch((err) => {
          console.error('操作日志记录失败:', err);
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};

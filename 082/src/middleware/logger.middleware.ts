import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';

export const operationLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseBody: any;
  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };
  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      let status = true;
      let errorMsg: string | undefined;
      if (res.statusCode >= 400) {
        status = false;
        try {
          const parsed = JSON.parse(responseBody);
          errorMsg = parsed.message || '操作失败';
        } catch {
          errorMsg = '操作失败';
        }
      }
      const pathParts = req.path.split('/').filter(Boolean);
      const module = pathParts[1] || 'system';
      const operation = pathParts[2] || 'unknown';
      let params: string | undefined;
      if (Object.keys(req.body).length > 0) {
        const bodyToLog = { ...req.body };
        if (bodyToLog.password) delete bodyToLog.password;
        if (bodyToLog.idCard) delete bodyToLog.idCard;
        params = JSON.stringify(bodyToLog);
      } else if (Object.keys(req.query).length > 0) {
        params = JSON.stringify(req.query);
      }
      await OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        module,
        operation,
        method: req.method,
        params,
        ip: req.ip || req.socket.remoteAddress,
        status,
        errorMsg,
        duration
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  });
  next();
};

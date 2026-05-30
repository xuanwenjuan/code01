import { Request, Response, NextFunction } from 'express';
import { createOperationLog, getModuleNameByPath } from '../services/operationLogService';
import { OperationType, LogLevel } from '../types';

export function operationLogMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const module = getModuleNameByPath(req.path);
      const method = req.method;

      let operation = OperationType.UPDATE;
      if (method === 'POST') {
        operation = OperationType.CREATE;
      } else if (method === 'DELETE') {
        operation = OperationType.DELETE;
      } else if (method === 'GET') {
        operation = '查询';
      }

      let result = '';
      let status = res.statusCode >= 200 && res.statusCode < 300;
      let errorMsg = '';

      if (responseBody) {
        try {
          const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          result = JSON.stringify({ code: parsed.code, message: parsed.message });
          if (!status) {
            errorMsg = parsed.message || '';
          }
        } catch {
          result = String(responseBody);
        }
      }

      await createOperationLog({
        operatorId: req.user?.userId,
        operatorName: req.user?.realName,
        module,
        operation,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress,
        params: { ...req.params, ...req.query, ...req.body },
        result,
        status,
        errorMsg,
        logLevel: status ? LogLevel.INFO : LogLevel.ERROR
      });
    } catch (err) {
      console.error('Failed to create operation log:', err);
    }
  });

  next();
}

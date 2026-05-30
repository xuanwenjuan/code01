import { Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AuthRequest } from './auth';

export const operationLog = (module: string, operation: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const start = Date.now();

    res.send = function (this: Response, body: any) {
      const duration = Date.now() - start;
      
      let success = true;
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        success = parsed.success;
      } catch (e) {}

      logger.info('操作日志', {
        module,
        operation,
        userId: req.user?.id,
        username: req.user?.username,
        userRole: req.user?.role,
        method: req.method,
        path: req.path,
        ip: req.ip,
        params: req.params,
        query: req.query,
        body: { ...req.body, password: undefined },
        success,
        duration: `${duration}ms`,
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

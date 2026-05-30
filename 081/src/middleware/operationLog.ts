import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';

export const operationLog = (description?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody: any;

    const captureResponse = (body: any) => {
      responseBody = body;
      return body;
    };

    res.send = function(this: Response, body: any) {
      captureResponse(body);
      return originalSend.call(this, body);
    };

    res.json = function(this: Response, body: any) {
      captureResponse(body);
      return originalJson.call(this, body);
    };

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const user = (req as any).user;
      
      const logData = {
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        method: req.method,
        path: req.path,
        description: description || '',
        userId: user?.userId,
        username: user?.username,
        role: user?.role,
        storeId: user?.storeId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        body: JSON.stringify(req.body).substring(0, 500)
      };

      console.log('[Operation Log]', JSON.stringify(logData));
    });

    next();
  };
};

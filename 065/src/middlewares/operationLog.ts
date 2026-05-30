import { Request, Response, NextFunction } from 'express';

export const operationLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, ip, body } = req;
  const user = (req as any).user;

  const originalSend = res.send;
  res.send = function(this: Response, bodyData: any) {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      path,
      ip,
      user: user ? { id: user.userId, role: user.role, username: user.username } : null,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestBody: method !== 'GET' ? body : undefined,
    };

    console.log('[Operation Log]', JSON.stringify(logData, null, 2));

    return originalSend.call(this, bodyData);
  };

  next();
};
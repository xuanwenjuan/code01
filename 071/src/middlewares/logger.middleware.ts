import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} - ${duration}ms`
    );
  });

  next();
};

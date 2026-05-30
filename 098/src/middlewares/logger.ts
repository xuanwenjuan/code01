import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, originalUrl, ip, body } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const userId = req.user?.userId || 'anonymous';

    const logData = {
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      method,
      url: originalUrl,
      ip,
      userId,
      statusCode,
      duration: `${duration}ms`,
      body: method !== 'GET' ? body : undefined
    };

    console.log('[Request Log]', JSON.stringify(logData));
  });

  next();
};

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/environment';
import logger from './config/logger';
import { connectDatabase } from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import { startScheduler } from './scheduler';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import materialRoutes from './routes/materialRoutes';
import orderRoutes from './routes/orderRoutes';
import costReportRoutes from './routes/costReportRoutes';
import operationLogRoutes from './routes/operationLogRoutes';

const app = express();
const PORT = env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cost-reports', costReportRoutes);
app.use('/api/operation-logs', operationLogRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    code: 404,
    message: '接口不存在',
    timestamp: Date.now(),
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    startScheduler();

    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`);
      logger.info(`环境: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

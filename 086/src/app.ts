import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { operationLogger } from './middleware/operationLog';
import { initScheduler } from './utils/scheduler';
import { Logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import serviceCategoryRoutes from './routes/serviceCategory.routes';
import workerRoutes from './routes/worker.routes';
import orderRoutes from './routes/order.routes';
import settlementRoutes from './routes/settlement.routes';

const app = express();
const PORT = env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use(operationLogger);

app.use('/api/auth', authRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settlements', settlementRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务运行正常',
    timestamp: Date.now(),
    data: {
      environment: env.NODE_ENV,
      uptime: process.uptime()
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    initScheduler();

    app.listen(PORT, () => {
      Logger.info(`服务器启动成功，端口: ${PORT}`);
      Logger.info(`环境: ${env.NODE_ENV}`);
    });
  } catch (error) {
    Logger.error('服务器启动失败', error);
    process.exit(1);
  }
};

startServer();

export default app;

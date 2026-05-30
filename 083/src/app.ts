import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { operationLogMiddleware } from './middlewares/operationLog';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import supplierRoutes from './routes/supplier.routes';
import partRoutes from './routes/part.routes';
import purchaseRoutes from './routes/purchase.routes';
import outboundRoutes from './routes/outbound.routes';
import stockRoutes from './routes/stock.routes';
import operationLogRoutes from './routes/operationLog.routes';
import consumptionLogRoutes from './routes/consumptionLog.routes';
import { authService } from './services/auth.service';
import { startScheduler } from './utils/scheduler';
import { logger } from './utils/logger';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '请求过于频繁，请稍后再试',
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(operationLogMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '汽车4S店配件进销存管理系统' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/outbound', outboundRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/operation-logs', operationLogRoutes);
app.use('/api/consumption-logs', consumptionLogRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    await authService.initRoles();
    logger.info('角色初始化完成');

    startScheduler();

    app.listen(config.port, () => {
      logger.info(`服务器运行在端口 ${config.port}`);
      logger.info(`环境: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

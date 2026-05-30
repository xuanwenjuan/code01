import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import sequelize from './config/database';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { operationLogger } from './middleware/operationLog';
import cronService from './services/cron.service';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import motherStrainRoutes from './routes/motherStrain.routes';
import cultivationBatchRoutes from './routes/cultivationBatch.routes';
import traceabilityRoutes from './routes/traceability.routes';
import operationLogRoutes from './routes/operationLog.routes';
import lossStatRoutes from './routes/lossStat.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

app.use(operationLogger);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/mother-strains', motherStrainRoutes);
app.use('/api/batches', cultivationBatchRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/operation-logs', operationLogRoutes);
app.use('/api/loss-statistics', lossStatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM信号接收，正在关闭服务...');
  cronService.stopAllTasks();
  sequelize.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT信号接收，正在关闭服务...');
  cronService.stopAllTasks();
  sequelize.close();
  process.exit(0);
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    logger.info('数据库模型同步完成');

    cronService.startAllTasks();

    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;
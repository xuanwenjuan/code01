import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import logger from './utils/logger';
import schedulerService from './services/scheduler.service';

import authRoutes from './routes/auth.routes';
import equipmentCategoryRoutes from './routes/equipmentCategory.routes';
import observationSiteRoutes from './routes/observationSite.routes';
import inspectionWorkOrderRoutes from './routes/inspectionWorkOrder.routes';
import consumableRecordRoutes from './routes/consumableRecord.routes';
import operationLogRoutes from './routes/operationLog.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/equipment-categories', equipmentCategoryRoutes);
app.use('/api/observation-sites', observationSiteRoutes);
app.use('/api/inspection-work-orders', inspectionWorkOrderRoutes);
app.use('/api/consumable-records', consumableRecordRoutes);
app.use('/api/operation-logs', operationLogRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '气象观测站点设备运维管理系统后端服务运行正常' });
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDatabase();
    
    schedulerService.start();

    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`);
      logger.info('气象观测站点设备运维管理系统后端服务启动成功');
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器');
  schedulerService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器');
  schedulerService.stop();
  process.exit(0);
});

export default app;

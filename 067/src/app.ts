import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database';
import logger from './config/logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { operationLogMiddleware } from './middleware/operationLog.middleware';
import { setupCronJobs } from './cron/settlement.cron';

import userRoutes from './routes/user.routes';
import siteCategoryRoutes from './routes/siteCategory.routes';
import feeTemplateRoutes from './routes/feeTemplate.routes';
import chargingSiteRoutes from './routes/chargingSite.routes';
import chargingPileRoutes from './routes/chargingPile.routes';
import chargingOrderRoutes from './routes/chargingOrder.routes';
import settlementRoutes from './routes/settlement.routes';
import operationLogRoutes from './routes/operationLog.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(operationLogMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '新能源充电桩运营管理系统后端服务运行正常' });
});

app.use('/api/users', userRoutes);
app.use('/api/site-categories', siteCategoryRoutes);
app.use('/api/fee-templates', feeTemplateRoutes);
app.use('/api/charging-sites', chargingSiteRoutes);
app.use('/api/charging-piles', chargingPileRoutes);
app.use('/api/charging-orders', chargingOrderRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/operation-logs', operationLogRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ alter: false });
    logger.info('数据库模型同步完成');

    setupCronJobs();

    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

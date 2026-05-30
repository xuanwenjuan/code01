import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import branchRoutes from './routes/branches';
import vehicleRoutes from './routes/vehicles';
import orderRoutes from './routes/orders';
import settlementRoutes from './routes/settlements';
import schedulerService from './services/schedulerService';
import { Logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settlements', settlementRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: '公路物流货运调度管理系统运行正常'
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    Logger.info('数据库连接成功');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    Logger.info('数据库模型同步完成');

    schedulerService.startAllTasks();

    app.listen(PORT, () => {
      Logger.info(`服务器启动成功，运行在端口 ${PORT}`);
      Logger.info(`环境：${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    Logger.error('服务器启动失败', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  Logger.info('收到 SIGTERM 信号，正在关闭服务器...');
  schedulerService.stopAllTasks();
  sequelize.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('收到 SIGINT 信号，正在关闭服务器...');
  schedulerService.stopAllTasks();
  sequelize.close();
  process.exit(0);
});

startServer();

export default app;

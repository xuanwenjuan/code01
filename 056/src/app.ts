import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import sequelize from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import departmentRoutes from './routes/department.routes';
import equipmentCategoryRoutes from './routes/equipmentCategory.routes';
import equipmentRoutes from './routes/equipment.routes';
import inspectionPlanRoutes from './routes/inspectionPlan.routes';
import inspectionTaskRoutes from './routes/inspectionTask.routes';
import workOrderRoutes from './routes/workOrder.routes';
import statisticsRoutes from './routes/statistics.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info('请求', { method: req.method, path: req.path, ip: req.ip });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/equipment-categories', equipmentCategoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/inspection-plans', inspectionPlanRoutes);
app.use('/api/inspection-tasks', inspectionTaskRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常运行',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('数据库模型同步完成');

    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

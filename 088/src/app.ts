import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './models';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './config/logger';
import { initScheduledTasks } from './services/scheduledTasks';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import collectionRoutes from './routes/collectionRoutes';
import restorationRoutes from './routes/restorationRoutes';
import exhibitionRoutes from './routes/exhibitionRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '标本馆藏文博藏品管理系统运行正常' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/restorations', restorationRoutes);
app.use('/api/exhibitions', exhibitionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await sequelize.sync({ alter: true });
    logger.info('数据库同步完成');

    initScheduledTasks();

    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

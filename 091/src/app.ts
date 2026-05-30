import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import logger from './config/logger';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware';
import routes from './routes';
import authService from './services/auth.service';
import taskService from './services/task.service';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('数据库连接成功');

    await authService.initAdminUser();
    logger.info('管理员用户初始化完成');

    taskService.startAllTasks();
    logger.info('定时任务已启动');

    app.listen(env.PORT, () => {
      logger.info(`服务器运行在端口 ${env.PORT}`);
      logger.info(`环境: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器');
  taskService.stopAllTasks();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器');
  taskService.stopAllTasks();
  process.exit(0);
});

export default app;

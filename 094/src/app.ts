import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import sequelize from './config/database';
import logger from './utils/logger';
import initScheduler from './utils/scheduler';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { operationLogMiddleware } from './middlewares/operationLog';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(operationLogMiddleware);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    logger.info('数据库模型同步完成');

    app.listen(config.port, () => {
      logger.info(`服务器运行在 http://localhost:${config.port}`);
      logger.info(`环境: ${config.nodeEnv}`);
      initScheduler();
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

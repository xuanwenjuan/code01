import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { startCronJobs } from './cron';
import logger from './utils/logger';

const app = express();

app.use(helmet());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } } }));

app.use('/api', routes);

app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    const port = env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`服务器运行在端口 ${port}`);
      logger.info(`环境: ${env.NODE_ENV}`);
    });

    startCronJobs();
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

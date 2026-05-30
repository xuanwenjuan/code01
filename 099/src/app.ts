import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import forageRoutes from './routes/forage.routes';
import horseRoutes from './routes/horse.routes';
import applicationRoutes from './routes/application.routes';
import costRoutes from './routes/cost.routes';
import './services/cron.service';
import './models';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`[HTTP] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/forage', forageRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/costs', costRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('数据库连接成功');

    app.listen(config.port, () => {
      logger.info(`服务器运行在 http://localhost:${config.port}`);
      logger.info(`环境: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

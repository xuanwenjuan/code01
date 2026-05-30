import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './config/database';
import logger from './config/logger';
import { responseHandler } from './middleware/responseHandler';
import { errorHandler } from './middleware/errorHandler';
import { initScheduler } from './utils/scheduler';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import merchantRoutes from './routes/merchantRoutes';
import activityRoutes from './routes/activityRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(responseHandler);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/activities', activityRoutes);

app.get('/api/health', (req, res) => {
  res.success({ status: 'ok', timestamp: new Date().toISOString() }, '服务运行正常');
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    initScheduler();

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

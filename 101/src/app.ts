import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { operationLogMiddleware } from './middlewares/operationLog.middleware';
import { startScheduler } from './tasks/scheduler';
import logger from './utils/logger';
import { ResponseUtil } from './utils/response';
import './models';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import pigeonRoutes from './routes/pigeon.routes';
import workOrderRoutes from './routes/workOrder.routes';
import expenseRoutes from './routes/expense.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use(operationLogMiddleware);

app.get('/health', (req, res) => {
  res.json(ResponseUtil.success({ status: 'ok', timestamp: new Date() }));
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pigeons', pigeonRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/expenses', expenseRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    startScheduler();
    
    app.listen(PORT, () => {
      logger.info(`服务器启动成功，运行在端口 ${PORT}`);
      logger.info(`API 文档: http://localhost:${PORT}`);
      logger.info(`健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

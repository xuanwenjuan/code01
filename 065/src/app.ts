import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { operationLog } from './middlewares/operationLog';
import { requestIdMiddleware } from './middlewares/auth';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import auntRoutes from './routes/aunt.routes';
import orderRoutes from './routes/order.routes';
import settlementRoutes from './routes/settlement.routes';

import { startOrderTasks } from './tasks/orderTasks';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);

app.use(operationLog);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/aunts', auntRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settlements', settlementRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    if (config.env !== 'test') {
      startOrderTasks();
    }

    app.listen(config.port, () => {
      console.log(`
      ====================================
      🚀 家政服务平台后端服务启动成功！
      📍 环境: ${config.env}
      🌐 端口: ${config.port}
      📅 时间: ${new Date().toISOString()}
      ====================================
      `);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

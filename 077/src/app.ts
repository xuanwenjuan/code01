import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { ApiResponse } from './utils/response';
import { startScheduledTasks } from './scheduledTasks';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import equipmentRoutes from './routes/equipment.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import financeRoutes from './routes/finance.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/finance', financeRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json(ApiResponse.success({ status: 'ok', timestamp: new Date() }, '服务运行正常'));
});

app.use('*', notFoundHandler);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`服务器运行在 http://localhost:${config.port}`);
      console.log(`环境: ${config.nodeEnv}`);
    });

    startScheduledTasks();
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

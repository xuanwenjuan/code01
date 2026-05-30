import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './database/config';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { startScheduler } from './utils/scheduler';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import supplierRoutes from './routes/supplierRoutes';
import productRoutes from './routes/productRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import statisticsRoutes from './routes/statisticsRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morgan.token('message', (req: any, res: any) => res.locals.errorMessage || '');
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '户外路亚垂钓渔具仓配管理系统运行正常' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    if (process.env.NODE_ENV !== 'test') {
      startScheduler();
    }

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

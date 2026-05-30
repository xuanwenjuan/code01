
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { initModels } from './models';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initScheduler } from './utils/scheduler';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import assetRoutes from './routes/asset.routes';
import applicationRoutes from './routes/application.routes';
import inventoryRoutes from './routes/inventory.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '工业园区物业资产管理系统服务正常' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/inventories', inventoryRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await initModels();
    console.log('数据库连接成功');
    
    initScheduler();
    console.log('定时任务调度器已启动');

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

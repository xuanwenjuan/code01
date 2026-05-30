import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import artistRoutes from './routes/artistRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import settlementRoutes from './routes/settlementRoutes';

import { startOrderTasks } from './tasks/orderTasks';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => Logger.info(message.trim()) } }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settlements', settlementRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    
    if (config.nodeEnv !== 'test') {
      startOrderTasks();
    }

    app.listen(config.port, () => {
      Logger.info(`🚀 Server is running on port ${config.port}`);
      Logger.info(`📍 Environment: ${config.nodeEnv}`);
      Logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

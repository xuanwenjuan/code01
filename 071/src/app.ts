import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { setupCronJobs } from './utils/cron';

import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import leaderRoutes from './routes/leader.routes';
import groupBuyRoutes from './routes/groupbuy.routes';
import orderRoutes from './routes/order.routes';
import commissionRoutes from './routes/commission.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(loggerMiddleware);

app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/leaders', leaderRoutes);
app.use('/api/groupbuys', groupBuyRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/commissions', commissionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized.');

    if (process.env.NODE_ENV !== 'test') {
      setupCronJobs();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import workAreaRoutes from './routes/workArea.routes';
import cleanerRoutes from './routes/cleaner.routes';
import workOrderRoutes from './routes/workOrder.routes';
import performanceRoutes from './routes/performance.routes';
import { initScheduler } from './scheduler';
import ResponseUtil from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/health', (req: Request, res: Response) => {
  ResponseUtil.success(res, { status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/work-areas', workAreaRoutes);
app.use('/api/cleaners', cleanerRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/performances', performanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully.');

    initScheduler();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler, notFoundHandler, requestLogger, operationLogMiddleware } from './middleware';
import { initCronJobs } from './cron';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import treatmentRoutes from './routes/treatment.routes';
import staffRoutes from './routes/staff.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import recordRoutes from './routes/record.routes';
import billingRoutes from './routes/billing.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: '请求过于频繁，请稍后再试',
});
app.use(limiter);

app.use(requestLogger);
app.use(operationLogMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '口腔诊所管理系统服务运行正常' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/billings', billingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    initCronJobs();

    app.listen(config.port, () => {
      logger.info(`服务器运行在端口 ${config.port}`);
      logger.info(`环境: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

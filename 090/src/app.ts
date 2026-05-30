import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { operationLog } from './middleware/operationLog';
import { startScheduler } from './cron/scheduler';
import { AuthService } from './services/AuthService';
import { Logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(operationLog);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    Logger.info('数据库连接成功');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    Logger.info('数据库同步完成');

    await AuthService.createSuperAdmin();

    startScheduler();

    app.listen(PORT, () => {
      Logger.info(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    Logger.error('服务器启动失败', error);
    process.exit(1);
  }
};

startServer();

export default app;

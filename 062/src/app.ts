import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import { TaskSchedulerService } from './services/taskScheduler.service';
import { AuthController } from './controllers/auth.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '酒店PMS系统运行正常' });
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ 数据库同步完成');

    await AuthController.initAdmin();
    console.log('✅ 管理员账号初始化完成');

    TaskSchedulerService.init();

    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

bootstrap();

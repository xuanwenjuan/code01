import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { connectDatabase } from './database';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { TaskService } from './services/task.service';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '职业技能培训学校教务管理系统运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    console.log('数据库连接成功');

    if (config.env !== 'test') {
      TaskService.init();
    }

    app.listen(config.port, () => {
      console.log(`服务器运行在 http://localhost:${config.port}`);
      console.log(`环境: ${config.env}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;

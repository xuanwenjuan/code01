import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './models';
import router from './routes';
import { errorHandlerMiddleware, notFoundMiddleware } from './middleware/errorHandler';
import { operationLogMiddleware } from './middleware/operationLog';
import { setupScheduledTasks } from './scheduler/tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/api', operationLogMiddleware, router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Service is running' });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');

    setupScheduledTasks();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;

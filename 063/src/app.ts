import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import logger from './utils/logger';
import './tasks/cronTask';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

export default app;
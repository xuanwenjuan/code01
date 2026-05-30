import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import logger from '../utils/logger';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'fishing_warehouse',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  timezone: '+08:00',
  models: [path.join(__dirname, '../models')],
  logging: (sql) => logger.debug(sql),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('数据库模型同步完成');
    }
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export default sequelize;

import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pigeon_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    timezone: '+08:00',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export default sequelize;

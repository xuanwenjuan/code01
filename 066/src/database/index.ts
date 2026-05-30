import { Sequelize } from 'sequelize';
import { config } from '../config';
import logger from '../utils/logger';

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
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

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('数据库模型同步完成');
    }
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export default sequelize;
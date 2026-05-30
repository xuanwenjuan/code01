import { Sequelize } from 'sequelize';
import { config } from '../config';
import logger from '../utils/logger';

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: (sql) => logger.debug(sql),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    if (config.nodeEnv !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('数据库模型同步完成');
    }
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export default sequelize;

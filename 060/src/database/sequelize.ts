import { Sequelize } from 'sequelize-typescript';
import { config } from '../config';
import logger from '../utils/logger';

const sequelize = new Sequelize({
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  dialect: 'mysql',
  models: [__dirname + '/models/**/*.model.ts'],
  logging: (sql) => logger.debug(sql),
  timezone: '+08:00',
});

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export default sequelize;

import { Sequelize } from 'sequelize';
import { env } from './env';
import { Logger } from '../utils/logger';

const sequelize = new Sequelize(
  env.DB.NAME,
  env.DB.USER,
  env.DB.PASSWORD,
  {
    host: env.DB.HOST,
    port: env.DB.PORT,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: (msg => Logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    Logger.info('数据库连接成功');
    
    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      Logger.info('数据库模型同步完成');
    }
  } catch (error) {
    Logger.error('数据库连接失败', error);
    process.exit(1);
  }
};

export { sequelize };
export default sequelize;

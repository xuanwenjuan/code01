import { Sequelize } from 'sequelize-typescript';
import { config } from './index';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  models: [path.join(__dirname, '../models')],
  logging: config.nodeEnv === 'development' ? console.log : false,
  timezone: '+08:00',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('数据库模型同步完成');
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

export { sequelize };
export default sequelize;
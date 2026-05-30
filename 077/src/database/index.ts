import { Sequelize } from 'sequelize';
import { config } from '../config';
import { setupAssociations } from './associations';

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: config.nodeEnv === 'development' ? console.log : false,
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
    console.log('数据库连接成功');
    
    setupAssociations();
    
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      console.log('数据库模型同步完成');
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

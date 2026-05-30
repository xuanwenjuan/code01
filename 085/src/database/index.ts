import { Sequelize } from 'sequelize';
import { config } from '../config';
import { Logger } from '../utils/logger';

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: (msg) => Logger.debug(msg),
    timezone: '+08:00',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    Logger.info('Database connection has been established successfully.');
    
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      Logger.info('Database synchronized successfully.');
    } else {
      await sequelize.sync();
      Logger.info('Database synchronized successfully.');
    }
  } catch (error) {
    Logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

export { sequelize };

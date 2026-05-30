import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    NAME: process.env.DB_NAME || 'housekeeping_service',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || ''
  },
  
  JWT: {
    SECRET: process.env.JWT_SECRET || 'default_secret_key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

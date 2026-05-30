import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'winery_management',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    dialect: 'mysql' as const,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'winery-management-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

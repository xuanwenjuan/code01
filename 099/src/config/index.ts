export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    name: process.env.DB_NAME || 'horse_forage_management',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'horse_forage_jwt_secret_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

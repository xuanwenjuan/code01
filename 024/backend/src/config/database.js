const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_store',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  timezone: '+08:00',
  charset: 'utf8mb4',
  dateStrings: true
});

pool.getConnection()
  .then((connection) => {
    console.log('✅ 数据库连接成功');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败:', err.message);
    console.error('请检查数据库配置并确保MySQL服务已启动');
    console.error('数据库配置:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'smart_store'
    });
  });

module.exports = pool;

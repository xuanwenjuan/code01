const pool = require('../config/database');

async function createOperationLog(type, action, target, details, operator = '系统') {
  try {
    const [result] = await pool.execute(
      `INSERT INTO operation_logs (type, action, target, details, operator, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type, action, target, details, operator]
    );
    return result.insertId;
  } catch (error) {
    console.error('记录操作日志失败:', error);
    return null;
  }
}

module.exports = { createOperationLog };

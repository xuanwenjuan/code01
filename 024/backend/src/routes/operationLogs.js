const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const VALID_TYPES = ['商品管理', '分类管理', '出入库管理', '系统操作'];
const VALID_ACTIONS = ['新增', '修改', '删除', '入库', '销售', '下架'];

router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      action, 
      target,
      operator,
      start_date, 
      end_date,
      page = 1,
      page_size = 20
    } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (type && VALID_TYPES.includes(type)) {
      whereConditions.push('type = ?');
      params.push(type);
    }
    
    if (action && VALID_ACTIONS.includes(action)) {
      whereConditions.push('action = ?');
      params.push(action);
    }
    
    if (target && target.trim() !== '') {
      whereConditions.push('target LIKE ?');
      params.push(`%${target.trim()}%`);
    }
    
    if (operator && operator.trim() !== '') {
      whereConditions.push('operator LIKE ?');
      params.push(`%${operator.trim()}%`);
    }
    
    if (start_date) {
      whereConditions.push('DATE(created_at) >= ?');
      params.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push('DATE(created_at) <= ?');
      params.push(end_date);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const countQuery = `SELECT COUNT(*) as total FROM operation_logs ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = Number(countResult[0].total) || 0;
    
    const validPageSize = Math.min(Math.max(Number(page_size) || 20, 1), 100);
    const validPage = Math.max(Number(page) || 1, 1);
    const offset = (validPage - 1) * validPageSize;
    
    const dataQuery = `
      SELECT * FROM operation_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.execute(dataQuery, [...params, validPageSize, offset]);
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: validPage,
        page_size: validPageSize,
        total,
        total_pages: Math.ceil(total / validPageSize)
      }
    });
  } catch (error) {
    console.error('查询操作日志错误:', error);
    res.status(500).json({ success: false, error: error.message || '查询失败' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [typeStats] = await pool.execute(
      `SELECT type, COUNT(*) as count 
       FROM operation_logs 
       GROUP BY type 
       ORDER BY count DESC`
    );
    
    const [actionStats] = await pool.execute(
      `SELECT action, COUNT(*) as count 
       FROM operation_logs 
       GROUP BY action 
       ORDER BY count DESC`
    );
    
    const [today] = await pool.execute(
      `SELECT COUNT(*) as count FROM operation_logs WHERE DATE(created_at) = CURDATE()`
    );
    
    const [week] = await pool.execute(
      `SELECT COUNT(*) as count FROM operation_logs WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    
    res.json({
      success: true,
      data: {
        type_stats: typeStats,
        action_stats: actionStats,
        today_count: Number(today[0].count) || 0,
        week_count: Number(week[0].count) || 0
      }
    });
  } catch (error) {
    console.error('日志统计错误:', error);
    res.status(500).json({ success: false, error: error.message || '统计失败' });
  }
});

module.exports = router;

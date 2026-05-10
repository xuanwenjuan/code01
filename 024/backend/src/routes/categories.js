const express = require('express');
const pool = require('../config/database');
const { createOperationLog } = require('../utils/operationLog');

const router = express.Router();

function isValidNumber(value) {
  if (value === undefined || value === null || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

function toNumber(value) {
  return Number(value);
}

function validateParentId(id) {
  if (id === null || id === undefined || id === '') return null;
  const num = Number(id);
  if (!isNaN(num) && num > 0) return num;
  return null;
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c1.*, 
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c1.id) as product_count,
              c2.name as parent_name
       FROM categories c1 
       LEFT JOIN categories c2 ON c1.parent_id = c2.id
       ORDER BY c1.sort_order ASC, c1.id ASC`
    );
    
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          product_count: Number(item.product_count) || 0,
          children: buildTree(items, item.id)
        }));
    };
    
    const flatRows = rows.map(item => ({
      ...item,
      product_count: Number(item.product_count) || 0
    }));
    
    res.json({ success: true, data: buildTree(rows), flat: flatRows });
  } catch (error) {
    console.error('查询分类错误:', error);
    res.status(500).json({ success: false, error: error.message || '查询失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidNumber(req.params.id)) {
      return res.status(400).json({ success: false, error: '无效的分类ID' });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('查询分类详情错误:', error);
    res.status(500).json({ success: false, error: error.message || '查询失败' });
  }
});

router.post('/', async (req, res) => {
  const { name, parent_id, description, sort_order } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: '分类名称不能为空' });
  }
  
  try {
    const validParentId = validateParentId(parent_id);
    const validSortOrder = isValidNumber(sort_order) ? Math.max(toNumber(sort_order), 0) : 0;
    
    const [result] = await pool.execute(
      `INSERT INTO categories (name, parent_id, description, sort_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name.trim(), validParentId, description?.trim() || null, validSortOrder]
    );
    
    await createOperationLog('分类管理', '新增', name, `新增分类: ${name}`);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        name: name.trim(), 
        parent_id: validParentId, 
        description: description?.trim() || null, 
        sort_order: validSortOrder 
      } 
    });
  } catch (error) {
    console.error('新增分类错误:', error);
    res.status(500).json({ success: false, error: error.message || '新增失败' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, parent_id, description, sort_order } = req.body;
  
  try {
    if (!isValidNumber(req.params.id)) {
      return res.status(400).json({ success: false, error: '无效的分类ID' });
    }
    
    const [oldData] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (oldData.length === 0) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    const validParentId = parent_id !== undefined ? validateParentId(parent_id) : undefined;
    const validSortOrder = sort_order !== undefined ? 
      (isValidNumber(sort_order) ? Math.max(toNumber(sort_order), 0) : 0) : 
      undefined;
    
    await pool.execute(
      `UPDATE categories 
       SET name = COALESCE(?, name), 
           parent_id = COALESCE(?, parent_id), 
           description = COALESCE(?, description), 
           sort_order = COALESCE(?, sort_order),
           updated_at = NOW()
       WHERE id = ?`,
      [
        name?.trim() || null, 
        validParentId, 
        description !== undefined ? (description?.trim() || null) : undefined, 
        validSortOrder, 
        req.params.id
      ]
    );
    
    const categoryName = name?.trim() || oldData[0].name;
    await createOperationLog('分类管理', '修改', categoryName, `修改分类: ${categoryName}`);
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('修改分类错误:', error);
    res.status(500).json({ success: false, error: error.message || '更新失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!isValidNumber(req.params.id)) {
      return res.status(400).json({ success: false, error: '无效的分类ID' });
    }
    
    const [category] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (category.length === 0) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    const [childCheck] = await pool.execute('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [req.params.id]);
    if (Number(childCheck[0].count) > 0) {
      return res.status(400).json({ success: false, error: '存在子分类，无法删除' });
    }
    
    const [productCheck] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
    if (Number(productCheck[0].count) > 0) {
      return res.status(400).json({ success: false, error: '分类下存在商品，无法删除' });
    }
    
    await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    await createOperationLog('分类管理', '删除', category[0].name, `删除分类: ${category[0].name}`);
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ success: false, error: error.message || '删除失败' });
  }
});

module.exports = router;

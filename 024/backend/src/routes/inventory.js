const express = require('express');
const pool = require('../config/database');
const { createOperationLog } = require('../utils/operationLog');

const router = express.Router();

function validatePositiveNumber(value, fieldName) {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`${fieldName}必须是有效数字`);
  }
  if (num <= 0) {
    throw new Error(`${fieldName}必须大于0`);
  }
  return num;
}

function validateNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`${fieldName}必须是有效数字`);
  }
  if (num < 0) {
    throw new Error(`${fieldName}不能为负数`);
  }
  return num;
}

router.post('/inbound', async (req, res) => {
  const { product_id, quantity, supplier, purchase_price, remark, operator = '管理员' } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ success: false, error: '请选择商品' });
  }

  let validQuantity;
  let validPrice;
  try {
    validQuantity = validatePositiveNumber(quantity, '入库数量');
    validPrice = validateNonNegativeNumber(purchase_price, '进货单价');
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    const product = products[0];
    
    const currentStock = Number(product.stock) || 0;
    const newStock = currentStock + validQuantity;
    
    await connection.execute(
      'UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?',
      [newStock, product_id]
    );
    
    const amount = validPrice !== null ? validPrice * validQuantity : null;
    
    const [result] = await connection.execute(
      `INSERT INTO inventory_records (
        product_id, operation_type, quantity, before_stock, after_stock,
        supplier, unit_price, amount, remark, operator, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        product_id, 'inbound', validQuantity,
        currentStock, newStock,
        supplier || null, validPrice, amount,
        remark || null, operator
      ]
    );
    
    await connection.commit();
    
    await createOperationLog('出入库管理', '入库', product.name, 
      `商品入库: ${product.name}, 数量: ${validQuantity}, 入库后库存: ${newStock}`);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        product_id, 
        quantity: validQuantity, 
        new_stock: newStock 
      } 
    });
  } catch (error) {
    await connection.rollback();
    console.error('入库错误:', error);
    res.status(500).json({ success: false, error: error.message || '入库失败' });
  } finally {
    connection.release();
  }
});

router.post('/sale', async (req, res) => {
  const { product_id, quantity, sale_price, remark, operator = '管理员' } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ success: false, error: '请选择商品' });
  }

  let validQuantity;
  let validPrice;
  try {
    validQuantity = validatePositiveNumber(quantity, '销售数量');
    validPrice = validateNonNegativeNumber(sale_price, '销售单价');
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    const product = products[0];
    
    const currentStock = Number(product.stock) || 0;
    if (currentStock < validQuantity) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: `库存不足，当前库存: ${currentStock}, 需要: ${validQuantity}` 
      });
    }
    
    const newStock = currentStock - validQuantity;
    
    await connection.execute(
      'UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?',
      [newStock, product_id]
    );
    
    const finalPrice = validPrice !== null ? validPrice : (Number(product.price) || 0);
    const amount = finalPrice > 0 ? finalPrice * validQuantity : null;
    
    const [result] = await connection.execute(
      `INSERT INTO inventory_records (
        product_id, operation_type, quantity, before_stock, after_stock,
        unit_price, amount, remark, operator, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        product_id, 'sale', validQuantity,
        currentStock, newStock,
        finalPrice || null, amount,
        remark || null, operator
      ]
    );
    
    await connection.commit();
    
    await createOperationLog('出入库管理', '销售', product.name, 
      `商品销售: ${product.name}, 数量: ${validQuantity}, 销售后库存: ${newStock}`);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        product_id, 
        quantity: validQuantity, 
        new_stock: newStock 
      } 
    });
  } catch (error) {
    await connection.rollback();
    console.error('销售错误:', error);
    res.status(500).json({ success: false, error: error.message || '销售失败' });
  } finally {
    connection.release();
  }
});

router.post('/offline', async (req, res) => {
  const { product_id, quantity, reason, remark, operator = '管理员' } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ success: false, error: '请选择商品' });
  }
  if (!reason) {
    return res.status(400).json({ success: false, error: '请选择下架原因' });
  }

  let validQuantity;
  try {
    validQuantity = validatePositiveNumber(quantity, '下架数量');
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    const product = products[0];
    
    const currentStock = Number(product.stock) || 0;
    if (currentStock < validQuantity) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        error: `库存不足，当前库存: ${currentStock}, 需要: ${validQuantity}` 
      });
    }
    
    const newStock = currentStock - validQuantity;
    const newStatus = newStock === 0 ? 'inactive' : product.status;
    
    await connection.execute(
      'UPDATE products SET stock = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [newStock, newStatus, product_id]
    );
    
    const [result] = await connection.execute(
      `INSERT INTO inventory_records (
        product_id, operation_type, quantity, before_stock, after_stock,
        reason, remark, operator, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        product_id, 'offline', validQuantity,
        currentStock, newStock,
        reason, remark || null, operator
      ]
    );
    
    await connection.commit();
    
    const reasonText = reason === 'expired' ? '过期' : reason === 'damaged' ? '破损' : reason;
    await createOperationLog('出入库管理', '下架', product.name, 
      `商品下架: ${product.name}, 数量: ${validQuantity}, 原因: ${reasonText}`);
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        product_id, 
        quantity: validQuantity, 
        new_stock: newStock 
      } 
    });
  } catch (error) {
    await connection.rollback();
    console.error('下架错误:', error);
    res.status(500).json({ success: false, error: error.message || '下架失败' });
  } finally {
    connection.release();
  }
});

router.get('/records', async (req, res) => {
  try {
    const { 
      product_id, 
      operation_type, 
      start_date, 
      end_date,
      page = 1,
      page_size = 20
    } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (product_id && product_id !== '' && product_id !== '0') {
      whereConditions.push('ir.product_id = ?');
      params.push(product_id);
    }
    if (operation_type && ['inbound', 'sale', 'offline'].includes(operation_type)) {
      whereConditions.push('ir.operation_type = ?');
      params.push(operation_type);
    }
    if (start_date) {
      whereConditions.push('DATE(ir.created_at) >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereConditions.push('DATE(ir.created_at) <= ?');
      params.push(end_date);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const countQuery = `SELECT COUNT(*) as total FROM inventory_records ir ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = Number(countResult[0].total) || 0;
    
    const validPageSize = Math.min(Math.max(Number(page_size) || 20, 1), 100);
    const validPage = Math.max(Number(page) || 1, 1);
    const offset = (validPage - 1) * validPageSize;
    
    const dataQuery = `
      SELECT ir.*, p.name as product_name, p.barcode
      FROM inventory_records ir
      LEFT JOIN products p ON ir.product_id = p.id
      ${whereClause}
      ORDER BY ir.created_at DESC
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
    console.error('查询记录错误:', error);
    res.status(500).json({ success: false, error: error.message || '查询失败' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (start_date) {
      whereConditions.push('DATE(created_at) >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereConditions.push('DATE(created_at) <= ?');
      params.push(end_date);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [inbound] = await pool.execute(
      `SELECT COALESCE(SUM(quantity), 0) as total, COALESCE(SUM(amount), 0) as amount 
       FROM inventory_records WHERE operation_type = 'inbound' ${whereClause ? `AND ${whereClause.replace('WHERE ', '')}` : ''}`,
      params
    );
    const [sale] = await pool.execute(
      `SELECT COALESCE(SUM(quantity), 0) as total, COALESCE(SUM(amount), 0) as amount 
       FROM inventory_records WHERE operation_type = 'sale' ${whereClause ? `AND ${whereClause.replace('WHERE ', '')}` : ''}`,
      params
    );
    const [offline] = await pool.execute(
      `SELECT COALESCE(SUM(quantity), 0) as total 
       FROM inventory_records WHERE operation_type = 'offline' ${whereClause ? `AND ${whereClause.replace('WHERE ', '')}` : ''}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        inbound: { 
          total: Number(inbound[0].total) || 0, 
          amount: Number(inbound[0].amount) || 0 
        },
        sale: { 
          total: Number(sale[0].total) || 0, 
          amount: Number(sale[0].amount) || 0 
        },
        offline: { 
          total: Number(offline[0].total) || 0 
        }
      }
    });
  } catch (error) {
    console.error('统计错误:', error);
    res.status(500).json({ success: false, error: error.message || '统计失败' });
  }
});

module.exports = router;

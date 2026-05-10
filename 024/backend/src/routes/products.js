const express = require('express');
const pool = require('../config/database');
const { createOperationLog } = require('../utils/operationLog');

const router = express.Router();

function validateProductId(id) {
  if (!id) return false;
  const num = Number(id);
  return !isNaN(num) && num > 0;
}

function isValidNumber(value) {
  if (value === undefined || value === null || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

function toNumber(value) {
  return Number(value);
}

router.get('/', async (req, res) => {
  try {
    const { 
      keyword, 
      category_id, 
      status, 
      min_stock, 
      max_stock,
      min_price,
      max_price,
      is_expiring_soon,
      page = 1,
      page_size = 20
    } = req.query;
    
    let whereConditions = [];
    let params = [];
    
    if (keyword && keyword.trim() !== '') {
      whereConditions.push('(p.name LIKE ? OR p.barcode LIKE ? OR p.brand LIKE ?)');
      const kw = `%${keyword.trim()}%`;
      params.push(kw, kw, kw);
    }
    
    if (validateProductId(category_id)) {
      whereConditions.push('p.category_id = ?');
      params.push(toNumber(category_id));
    }
    
    if (status && ['active', 'inactive'].includes(status)) {
      whereConditions.push('p.status = ?');
      params.push(status);
    }
    
    if (isValidNumber(min_stock)) {
      whereConditions.push('p.stock >= ?');
      params.push(toNumber(min_stock));
    }
    
    if (isValidNumber(max_stock)) {
      whereConditions.push('p.stock <= ?');
      params.push(toNumber(max_stock));
    }
    
    if (isValidNumber(min_price)) {
      whereConditions.push('p.price >= ?');
      params.push(toNumber(min_price));
    }
    
    if (isValidNumber(max_price)) {
      whereConditions.push('p.price <= ?');
      params.push(toNumber(max_price));
    }
    
    if (is_expiring_soon === 'true') {
      whereConditions.push(`p.expiry_date IS NOT NULL AND 
                           DATEDIFF(p.expiry_date, CURDATE()) <= 7 AND 
                           DATEDIFF(p.expiry_date, CURDATE()) >= 0`);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = Number(countResult[0].total) || 0;
    
    const validPageSize = Math.min(Math.max(Number(page_size) || 20, 1), 100);
    const validPage = Math.max(Number(page) || 1, 1);
    const offset = (validPage - 1) * validPageSize;
    
    const dataQuery = `
      SELECT p.*, c.name as category_name,
             CASE 
               WHEN p.expiry_date IS NULL THEN 'normal'
               WHEN DATEDIFF(p.expiry_date, CURDATE()) < 0 THEN 'expired'
               WHEN DATEDIFF(p.expiry_date, CURDATE()) <= 7 THEN 'expiring'
               ELSE 'normal'
             END as expiry_status,
             DATEDIFF(p.expiry_date, CURDATE()) as days_to_expiry
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.updated_at DESC
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
    console.error('查询商品错误:', error);
    res.status(500).json({ success: false, error: error.message || '查询失败' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [totalProducts] = await pool.execute('SELECT COUNT(*) as count FROM products');
    const [lowStock] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock < 10');
    const [expiring] = await pool.execute(
      `SELECT COUNT(*) as count FROM products 
       WHERE expiry_date IS NOT NULL AND 
             DATEDIFF(expiry_date, CURDATE()) <= 7 AND 
             DATEDIFF(expiry_date, CURDATE()) >= 0`
    );
    const [outOfStock] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock = 0');
    
    res.json({
      success: true,
      data: {
        total: Number(totalProducts[0].count) || 0,
        low_stock: Number(lowStock[0].count) || 0,
        expiring: Number(expiring[0].count) || 0,
        out_of_stock: Number(outOfStock[0].count) || 0
      }
    });
  } catch (error) {
    console.error('统计错误:', error);
    res.status(500).json({ success: false, error: error.message || '统计失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({ success: false, error: '无效的商品ID' });
    }
    
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('查询商品详情错误:', error);
    res.status(500).json({ success: false, error: error.message || '查询失败' });
  }
});

router.post('/', async (req, res) => {
  const {
    name, barcode, category_id, brand, price, cost_price,
    stock = 0, unit, description, image_url,
    expiry_date, production_date, shelf_life_days,
    supplier, purchase_price, status = 'active', weight
  } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: '商品名称不能为空' });
  }
  if (!barcode || !barcode.trim()) {
    return res.status(400).json({ success: false, error: '条码不能为空' });
  }
  
  try {
    const [check] = await pool.execute('SELECT id FROM products WHERE barcode = ?', [barcode.trim()]);
    if (check.length > 0) {
      return res.status(400).json({ success: false, error: '条码已存在' });
    }
    
    const validCategoryId = validateProductId(category_id) ? toNumber(category_id) : null;
    const validPrice = isValidNumber(price) ? toNumber(price) : 0;
    const validCostPrice = isValidNumber(cost_price) ? toNumber(cost_price) : 0;
    const validStock = isValidNumber(stock) ? Math.max(toNumber(stock), 0) : 0;
    const validPurchasePrice = isValidNumber(purchase_price) ? toNumber(purchase_price) : null;
    const validWeight = isValidNumber(weight) ? toNumber(weight) : null;
    const validShelfLife = isValidNumber(shelf_life_days) ? Math.max(toNumber(shelf_life_days), 0) : null;
    const validStatus = ['active', 'inactive'].includes(status) ? status : 'active';
    
    const [result] = await pool.execute(
      `INSERT INTO products (
        name, barcode, category_id, brand, price, cost_price,
        stock, unit, description, image_url,
        expiry_date, production_date, shelf_life_days,
        supplier, purchase_price, status, weight,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name.trim(), barcode.trim(), validCategoryId, brand?.trim() || null, 
        validPrice, validCostPrice, validStock, unit?.trim() || null, description?.trim() || null, 
        image_url || null, expiry_date || null, production_date || null, 
        validShelfLife, supplier?.trim() || null, validPurchasePrice, 
        validStatus, validWeight
      ]
    );
    
    await createOperationLog('商品管理', '新增', name, `新增商品: ${name} (条码: ${barcode})`);
    
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('新增商品错误:', error);
    res.status(500).json({ success: false, error: error.message || '新增失败' });
  }
});

router.put('/:id', async (req, res) => {
  const {
    name, barcode, category_id, brand, price, cost_price,
    stock, unit, description, image_url,
    expiry_date, production_date, shelf_life_days,
    supplier, purchase_price, status, weight
  } = req.body;
  
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({ success: false, error: '无效的商品ID' });
    }
    
    const [oldData] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (oldData.length === 0) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    
    const oldProduct = oldData[0];
    
    if (barcode && barcode.trim() && barcode.trim() !== oldProduct.barcode) {
      const [check] = await pool.execute(
        'SELECT id FROM products WHERE barcode = ? AND id != ?', 
        [barcode.trim(), req.params.id]
      );
      if (check.length > 0) {
        return res.status(400).json({ success: false, error: '条码已存在' });
      }
    }
    
    const validCategoryId = category_id !== undefined ? 
      (validateProductId(category_id) ? toNumber(category_id) : null) : 
      undefined;
    const validPrice = price !== undefined ? 
      (isValidNumber(price) ? toNumber(price) : 0) : 
      undefined;
    const validCostPrice = cost_price !== undefined ? 
      (isValidNumber(cost_price) ? toNumber(cost_price) : 0) : 
      undefined;
    const validStock = stock !== undefined ? 
      (isValidNumber(stock) ? Math.max(toNumber(stock), 0) : 0) : 
      undefined;
    const validPurchasePrice = purchase_price !== undefined ? 
      (isValidNumber(purchase_price) ? toNumber(purchase_price) : null) : 
      undefined;
    const validWeight = weight !== undefined ? 
      (isValidNumber(weight) ? toNumber(weight) : null) : 
      undefined;
    const validShelfLife = shelf_life_days !== undefined ? 
      (isValidNumber(shelf_life_days) ? Math.max(toNumber(shelf_life_days), 0) : null) : 
      undefined;
    const validStatus = status !== undefined ? 
      (['active', 'inactive'].includes(status) ? status : oldProduct.status) : 
      undefined;
    
    await pool.execute(
      `UPDATE products SET
        name = COALESCE(?, name),
        barcode = COALESCE(?, barcode),
        category_id = COALESCE(?, category_id),
        brand = COALESCE(?, brand),
        price = COALESCE(?, price),
        cost_price = COALESCE(?, cost_price),
        stock = COALESCE(?, stock),
        unit = COALESCE(?, unit),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        expiry_date = ?,
        production_date = ?,
        shelf_life_days = COALESCE(?, shelf_life_days),
        supplier = COALESCE(?, supplier),
        purchase_price = COALESCE(?, purchase_price),
        status = COALESCE(?, status),
        weight = COALESCE(?, weight),
        updated_at = NOW()
      WHERE id = ?`,
      [
        name?.trim() || null, barcode?.trim() || null, validCategoryId, 
        brand?.trim() || null, validPrice, validCostPrice, validStock, 
        unit?.trim() || null, description?.trim() || null, image_url || null,
        expiry_date !== undefined ? (expiry_date || null) : undefined,
        production_date !== undefined ? (production_date || null) : undefined,
        validShelfLife, supplier?.trim() || null, validPurchasePrice, 
        validStatus, validWeight, req.params.id
      ]
    );
    
    const productName = name?.trim() || oldProduct.name;
    await createOperationLog('商品管理', '修改', productName, `修改商品: ${productName}`);
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('修改商品错误:', error);
    res.status(500).json({ success: false, error: error.message || '更新失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({ success: false, error: '无效的商品ID' });
    }
    
    const [product] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (product.length === 0) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    await createOperationLog('商品管理', '删除', product[0].name, `删除商品: ${product[0].name}`);
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({ success: false, error: error.message || '删除失败' });
  }
});

module.exports = router;

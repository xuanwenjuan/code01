import pool from '../config/database';
import { Product, ProductFilter, MysqlResult } from '../types';
import { logOperation } from '../utils/logger';

export class ProductService {
  async getAllProducts(filter?: ProductFilter): Promise<Product[]> {
    let sql = `
      SELECT p.*, c.name as category_name, pc.name as parent_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (filter) {
      if (filter.keyword) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.supplier LIKE ?)';
        params.push(`%${filter.keyword}%`, `%${filter.keyword}%`, `%${filter.keyword}%`);
      }
      if (filter.category_id) {
        sql += ' AND (p.category_id = ? OR c.parent_id = ?)';
        params.push(filter.category_id, filter.category_id);
      }
      if (filter.quality_level) {
        sql += ' AND p.quality_level = ?';
        params.push(filter.quality_level);
      }
      if (filter.min_price !== undefined) {
        sql += ' AND p.price >= ?';
        params.push(filter.min_price);
      }
      if (filter.max_price !== undefined) {
        sql += ' AND p.price <= ?';
        params.push(filter.max_price);
      }
      if (filter.min_stock !== undefined) {
        sql += ' AND p.stock >= ?';
        params.push(filter.min_stock);
      }
      if (filter.max_stock !== undefined) {
        sql += ' AND p.stock <= ?';
        params.push(filter.max_stock);
      }
      if (filter.supplier) {
        sql += ' AND p.supplier LIKE ?';
        params.push(`%${filter.supplier}%`);
      }
      if (filter.is_low_stock) {
        sql += ' AND p.stock <= p.min_stock';
      }
    }

    sql += ' ORDER BY p.id DESC';

    const [rows] = await pool.query(sql, params);
    const products = rows as Product[];

    const today = new Date();
    return products.map(product => {
      const isLowStock = product.stock <= product.min_stock;
      let isAging = false;
      if (product.expiry_date) {
        const expiry = new Date(product.expiry_date);
        const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        isAging = daysLeft <= 30 && daysLeft > 0;
      }
      return { ...product, is_low_stock: isLowStock, is_aging: isAging };
    });
  }

  async getProductById(id: number): Promise<Product | null> {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name, pc.name as parent_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE p.id = ?
    `, [id]);
    const products = rows as Product[];
    if (products.length === 0) return null;

    const product = products[0];
    const today = new Date();
    const isLowStock = product.stock <= product.min_stock;
    let isAging = false;
    if (product.expiry_date) {
      const expiry = new Date(product.expiry_date);
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      isAging = daysLeft <= 30 && daysLeft > 0;
    }
    return { ...product, is_low_stock: isLowStock, is_aging: isAging };
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const [result] = await pool.query(`
      INSERT INTO products 
      (name, category_id, price, cost_price, stock, min_stock, unit, description, 
       quality_level, warranty_period, manufacturing_date, expiry_date, supplier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name, data.category_id, data.price || 0, data.cost_price || 0,
      data.stock || 0, data.min_stock || 10, data.unit || '个',
      data.description || null, data.quality_level || '普通',
      data.warranty_period || 0, data.manufacturing_date || null,
      data.expiry_date || null, data.supplier || null
    ]);
    const mysqlResult = result as MysqlResult;
    const insertId = mysqlResult.insertId;
    const product = await this.getProductById(insertId);
    await logOperation('用品管理', '新增', insertId, `新增用品: ${data.name}`);
    return product!;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    await pool.query(`
      UPDATE products SET 
      name = ?, category_id = ?, price = ?, cost_price = ?, stock = ?, min_stock = ?, 
      unit = ?, description = ?, quality_level = ?, warranty_period = ?, 
      manufacturing_date = ?, expiry_date = ?, supplier = ?
      WHERE id = ?
    `, [
      data.name, data.category_id, data.price || 0, data.cost_price || 0,
      data.stock || 0, data.min_stock || 10, data.unit || '个',
      data.description || null, data.quality_level || '普通',
      data.warranty_period || 0, data.manufacturing_date || null,
      data.expiry_date || null, data.supplier || null, id
    ]);
    const product = await this.getProductById(id);
    await logOperation('用品管理', '更新', id, `更新用品: ${data.name}`);
    return product!;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.getProductById(id);
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    await logOperation('用品管理', '删除', id, `删除用品: ${product?.name || id}`);
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, id]);
  }

  async getLowStockProducts(): Promise<Product[]> {
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name, pc.name as parent_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE p.stock <= p.min_stock
      ORDER BY p.stock ASC
    `);
    return rows as Product[];
  }

  async getAgingProducts(): Promise<Product[]> {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name, pc.name as parent_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE p.expiry_date IS NOT NULL 
      AND p.expiry_date <= ? 
      AND p.expiry_date > ?
      ORDER BY p.expiry_date ASC
    `, [thirtyDaysLater, today]);
    
    return rows as Product[];
  }
}

export default new ProductService();

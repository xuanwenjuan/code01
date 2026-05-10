import pool from '../config/database';
import { InventoryLog, MysqlResult } from '../types';
import productService from './product.service';
import { logOperation } from '../utils/logger';

export class InventoryService {
  async getAllLogs(): Promise<InventoryLog[]> {
    const [rows] = await pool.query(`
      SELECT il.*, p.name as product_name
      FROM inventory_logs il
      LEFT JOIN products p ON il.product_id = p.id
      ORDER BY il.id DESC
    `);
    return rows as InventoryLog[];
  }

  async getLogById(id: number): Promise<InventoryLog | null> {
    const [rows] = await pool.query(`
      SELECT il.*, p.name as product_name
      FROM inventory_logs il
      LEFT JOIN products p ON il.product_id = p.id
      WHERE il.id = ?
    `, [id]);
    const logs = rows as InventoryLog[];
    return logs.length > 0 ? logs[0] : null;
  }

  async createInbound(productId: number, quantity: number, price: number, reason: string | null): Promise<InventoryLog> {
    const product = await productService.getProductById(productId);
    if (!product) {
      throw new Error('产品不存在');
    }

    const [result] = await pool.query(`
      INSERT INTO inventory_logs (product_id, type, quantity, price, reason)
      VALUES (?, '入库', ?, ?, ?)
    `, [productId, quantity, price, reason]);

    const mysqlResult = result as MysqlResult;
    const insertId = mysqlResult.insertId;

    await productService.updateStock(productId, quantity);
    await logOperation('出入库管理', '入库', productId, `入库: ${product.name}, 数量: ${quantity}`);

    return (await this.getLogById(insertId))!;
  }

  async createSale(productId: number, quantity: number, price: number, reason: string | null): Promise<InventoryLog> {
    const product = await productService.getProductById(productId);
    if (!product) {
      throw new Error('产品不存在');
    }
    if (product.stock < quantity) {
      throw new Error('库存不足');
    }

    const [result] = await pool.query(`
      INSERT INTO inventory_logs (product_id, type, quantity, price, reason)
      VALUES (?, '售卖', ?, ?, ?)
    `, [productId, quantity, price, reason]);

    const mysqlResult = result as MysqlResult;
    const insertId = mysqlResult.insertId;

    await productService.updateStock(productId, -quantity);
    await logOperation('出入库管理', '售卖', productId, `售卖: ${product.name}, 数量: ${quantity}`);

    return (await this.getLogById(insertId))!;
  }

  async createDefective(productId: number, quantity: number, reason: string | null): Promise<InventoryLog> {
    const product = await productService.getProductById(productId);
    if (!product) {
      throw new Error('产品不存在');
    }
    if (product.stock < quantity) {
      throw new Error('库存不足');
    }

    const [result] = await pool.query(`
      INSERT INTO inventory_logs (product_id, type, quantity, price, reason)
      VALUES (?, '残次下架', ?, 0, ?)
    `, [productId, quantity, reason]);

    const mysqlResult = result as MysqlResult;
    const insertId = mysqlResult.insertId;

    await productService.updateStock(productId, -quantity);
    await logOperation('出入库管理', '残次下架', productId, `残次下架: ${product.name}, 数量: ${quantity}`);

    return (await this.getLogById(insertId))!;
  }
}

export default new InventoryService();

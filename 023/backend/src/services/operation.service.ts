import pool from '../config/database';
import { OperationLog } from '../types';

export class OperationService {
  async getAllLogs(): Promise<OperationLog[]> {
    const [rows] = await pool.query('SELECT * FROM operation_logs ORDER BY id DESC');
    return rows as OperationLog[];
  }

  async getLogsByModule(module: string): Promise<OperationLog[]> {
    const [rows] = await pool.query(
      'SELECT * FROM operation_logs WHERE module = ? ORDER BY id DESC',
      [module]
    );
    return rows as OperationLog[];
  }

  async searchLogs(keyword: string): Promise<OperationLog[]> {
    const [rows] = await pool.query(
      'SELECT * FROM operation_logs WHERE module LIKE ? OR action LIKE ? OR detail LIKE ? ORDER BY id DESC',
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows as OperationLog[];
  }
}

export default new OperationService();

import pool from '../config/database';

export async function logOperation(module: string, action: string, targetId: number | null, detail: string): Promise<void> {
  try {
    await pool.query(
      'INSERT INTO operation_logs (module, action, target_id, detail) VALUES (?, ?, ?, ?)',
      [module, action, targetId, detail]
    );
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

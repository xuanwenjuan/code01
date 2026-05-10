import pool from '../config/database';
import { Category, MysqlResult } from '../types';
import { logOperation } from '../utils/logger';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    return rows as Category[];
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    const categories = rows as Category[];
    return categories.length > 0 ? categories[0] : null;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const [result] = await pool.query(
      'INSERT INTO categories (name, parent_id, description) VALUES (?, ?, ?)',
      [data.name, data.parent_id || null, data.description || null]
    );
    const mysqlResult = result as MysqlResult;
    const insertId = mysqlResult.insertId;
    const category = await this.getCategoryById(insertId);
    await logOperation('分类管理', '新增', insertId, `新增分类: ${data.name}`);
    return category!;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    await pool.query(
      'UPDATE categories SET name = ?, parent_id = ?, description = ? WHERE id = ?',
      [data.name, data.parent_id || null, data.description || null, id]
    );
    const category = await this.getCategoryById(id);
    await logOperation('分类管理', '更新', id, `更新分类: ${data.name}`);
    return category!;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.getCategoryById(id);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    await logOperation('分类管理', '删除', id, `删除分类: ${category?.name || id}`);
  }

  async getCategoriesWithTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.getAllCategories();
    const map = new Map<number, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id === null) {
        roots.push(node);
      } else {
        const parent = map.get(cat.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  }
}

export default new CategoryService();

import { Department } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';
import { FindOptions, Op } from 'sequelize';

export class DepartmentService {
  async create(data: { name: string; code: string; parentId?: number; description?: string; sort?: number }) {
    const exists = await Department.findOne({ where: { code: data.code } });
    if (exists) {
      throw new ConflictError('部门编码已存在');
    }

    return Department.create(data);
  }

  async update(id: number, data: { name?: string; code?: string; parentId?: number; description?: string; sort?: number; isActive?: boolean }) {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new NotFoundError('部门不存在');
    }

    if (data.code && data.code !== department.code) {
      const exists = await Department.findOne({ where: { code: data.code } });
      if (exists) {
        throw new ConflictError('部门编码已存在');
      }
    }

    return department.update(data);
  }

  async delete(id: number) {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new NotFoundError('部门不存在');
    }

    const childCount = await Department.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new ConflictError('该部门下还有子部门，无法删除');
    }

    return department.destroy();
  }

  async findById(id: number) {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new NotFoundError('部门不存在');
    }
    return department;
  }

  async findAll(params: { name?: string; isActive?: boolean; page?: number; pageSize?: number }) {
    const { name, isActive, page = 1, pageSize = 10 } = params;
    const where: Record<string, unknown> = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const options: FindOptions = {
      where,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await Department.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async getTree() {
    const departments = await Department.findAll({
      where: { isActive: true },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    return this.buildTree(departments);
  }

  private buildTree(departments: Department[], parentId: number | null = null): any[] {
    return departments
      .filter((dept) => dept.parentId === parentId)
      .map((dept) => ({
        ...dept.toJSON(),
        children: this.buildTree(departments, dept.id),
      }));
  }
}

export default new DepartmentService();

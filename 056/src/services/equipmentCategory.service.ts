import { EquipmentCategory } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';
import { FindOptions, Op } from 'sequelize';

export class EquipmentCategoryService {
  async create(data: { name: string; code: string; parentId?: number; description?: string; sort?: number }) {
    const exists = await EquipmentCategory.findOne({ where: { code: data.code } });
    if (exists) {
      throw new ConflictError('分类编码已存在');
    }

    return EquipmentCategory.create(data);
  }

  async update(id: number, data: { name?: string; code?: string; parentId?: number; description?: string; sort?: number; isActive?: boolean }) {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    if (data.code && data.code !== category.code) {
      const exists = await EquipmentCategory.findOne({ where: { code: data.code } });
      if (exists) {
        throw new ConflictError('分类编码已存在');
      }
    }

    return category.update(data);
  }

  async delete(id: number) {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const childCount = await EquipmentCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new ConflictError('该分类下还有子分类，无法删除');
    }

    return category.destroy();
  }

  async findById(id: number) {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }
    return category;
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

    const { count, rows } = await EquipmentCategory.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async getTree() {
    const categories = await EquipmentCategory.findAll({
      where: { isActive: true },
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    return this.buildTree(categories);
  }

  private buildTree(categories: EquipmentCategory[], parentId: number | null = null): any[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat.toJSON(),
        children: this.buildTree(categories, cat.id),
      }));
  }
}

export default new EquipmentCategoryService();

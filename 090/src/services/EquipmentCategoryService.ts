import { EquipmentCategory, Equipment } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

interface CreateCategoryRequest {
  name: string;
  parentId?: number;
  sort?: number;
  icon?: string;
  description?: string;
}

interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  status?: number;
}

export class EquipmentCategoryService {
  static async create(data: CreateCategoryRequest): Promise<EquipmentCategory> {
    let level = 1;
    
    if (data.parentId) {
      const parent = await EquipmentCategory.findByPk(data.parentId);
      if (!parent) {
        throw new AppError('父类目不存在', 400);
      }
      if (parent.status === 0) {
        throw new AppError('父类目已停产，无法新增子类目', 400);
      }
      level = parent.level + 1;
    }

    return await EquipmentCategory.create({
      ...data,
      level,
      sort: data.sort || 0,
      status: 1
    });
  }

  static async update(id: number, data: UpdateCategoryRequest): Promise<EquipmentCategory> {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    if (data.parentId && data.parentId !== category.parentId) {
      if (data.parentId === id) {
        throw new AppError('不能将自己设为父类目', 400);
      }
      const parent = await EquipmentCategory.findByPk(data.parentId);
      if (!parent) {
        throw new AppError('父类目不存在', 400);
      }
      if (parent.status === 0) {
        throw new AppError('父类目已停产', 400);
      }
      (data as any).level = parent.level + 1;

      await this.updateChildrenLevel(id, (data as any).level);
    }

    if (data.status === 0) {
      const equipmentCount = await Equipment.count({
        where: { categoryId: id }
      });
      if (equipmentCount > 0) {
        throw new AppError('该类目下存在装备，无法停产', 400);
      }
    }

    await category.update(data);
    return category;
  }

  private static async updateChildrenLevel(parentId: number, parentLevel: number): Promise<void> {
    const children = await EquipmentCategory.findAll({
      where: { parentId }
    });

    for (const child of children) {
      const newLevel = parentLevel + 1;
      await child.update({ level: newLevel });
      await this.updateChildrenLevel(child.id, newLevel);
    }
  }

  static async delete(id: number): Promise<void> {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    const childCount = await EquipmentCategory.count({
      where: { parentId: id }
    });
    if (childCount > 0) {
      throw new AppError('请先删除子类目', 400);
    }

    const equipmentCount = await Equipment.count({
      where: { categoryId: id }
    });
    if (equipmentCount > 0) {
      throw new AppError('该类目下存在装备，无法删除', 400);
    }

    await category.destroy();
  }

  static async getById(id: number): Promise<EquipmentCategory> {
    const category = await EquipmentCategory.findByPk(id, {
      include: [{ model: EquipmentCategory, as: 'parent' }]
    });
    if (!category) {
      throw new AppError('类目不存在', 404);
    }
    return category;
  }

  static async getTree(includeDisabled: boolean = false): Promise<EquipmentCategory[]> {
    const where: any = {};
    if (!includeDisabled) {
      where.status = 1;
    }

    const categories = await EquipmentCategory.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    return this.buildTreeIterative(categories);
  }

  private static buildTreeIterative(categories: EquipmentCategory[]): EquipmentCategory[] {
    const map = new Map<number, EquipmentCategory & { dataValues: { children?: EquipmentCategory[] } }>();
    const roots: EquipmentCategory[] = [];

    for (const category of categories) {
      (category as any).dataValues.children = [];
      map.set(category.id, category as any);
    }

    for (const category of categories) {
      if (category.parentId) {
        const parent = map.get(category.parentId);
        if (parent) {
          parent.dataValues.children!.push(category);
        } else {
          roots.push(category);
        }
      } else {
        roots.push(category);
      }
    }

    return roots;
  }

  static async getFlatList(parentId?: number | null): Promise<EquipmentCategory[]> {
    const where: any = { status: 1 };
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    return await EquipmentCategory.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });
  }

  static async getList(params: {
    page?: number;
    pageSize?: number;
    name?: string;
    status?: number;
  }): Promise<{ list: EquipmentCategory[]; total: number }> {
    const { page = 1, pageSize = 10, name, status } = params;
    
    const where: any = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await EquipmentCategory.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['sort', 'ASC'], ['id', 'DESC']],
      include: [{ model: EquipmentCategory, as: 'parent' }]
    });

    return { list: rows, total: count };
  }
}

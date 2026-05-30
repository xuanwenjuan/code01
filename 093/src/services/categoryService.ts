import Category from '../models/Category';
import Order from '../models/Order';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { Op } from 'sequelize';

interface CreateCategoryRequest {
  name: string;
  code: string;
  parentId?: number;
  description?: string;
  sortOrder?: number;
  icon?: string;
}

interface UpdateCategoryRequest {
  name?: string;
  code?: string;
  parentId?: number | null;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string;
}

export class CategoryService {
  static async create(data: CreateCategoryRequest): Promise<Category> {
    const existingCategory = await Category.findOne({ where: { code: data.code } });
    if (existingCategory) {
      throw new BadRequestError('类目编码已存在');
    }

    if (data.parentId) {
      const parent = await Category.findByPk(data.parentId);
      if (!parent) {
        throw new NotFoundError('父类目不存在');
      }
      if (!parent.isActive) {
        throw new BadRequestError('父类目已停产，无法新增子类目');
      }
    }

    let level = 1;
    if (data.parentId) {
      const parent = await Category.findByPk(data.parentId);
      level = parent!.level + 1;
    }

    const category = await Category.create({
      ...data,
      level,
    });

    return category;
  }

  static async update(id: number, data: UpdateCategoryRequest): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('类目不存在');
    }

    if (data.code && data.code !== category.code) {
      const existingCategory = await Category.findOne({ where: { code: data.code } });
      if (existingCategory) {
        throw new BadRequestError('类目编码已存在');
      }
    }

    if (data.isActive === false) {
      const activeChildren = await Category.findOne({
        where: { parentId: id, isActive: true },
      });
      if (activeChildren) {
        throw new ConflictError('存在启用的子类目，请先停用子类目');
      }
    }

    let level = category.level;
    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      if (data.parentId === null) {
        level = 1;
      } else {
        const parent = await Category.findByPk(data.parentId);
        if (!parent) {
          throw new NotFoundError('父类目不存在');
        }
        if (!parent.isActive) {
          throw new BadRequestError('父类目已停产，无法移动到该类目下');
        }
        level = parent.level + 1;
      }
    }

    await category.update({ ...data, level });

    return category;
  }

  static async delete(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('类目不存在');
    }

    const children = await Category.findOne({ where: { parentId: id } });
    if (children) {
      throw new BadRequestError('请先删除子类目');
    }

    const hasOrders = await Order.findOne({ where: { categoryId: id } });
    if (hasOrders) {
      throw new ConflictError('该类目下存在订单，无法删除');
    }

    await category.destroy();
  }

  static async getById(id: number): Promise<Category> {
    const category = await Category.findByPk(id, {
      include: [{ model: Category, as: 'children' }],
    });
    if (!category) {
      throw new NotFoundError('类目不存在');
    }
    return category;
  }

  static async getTree(includeInactive: boolean = false): Promise<Category[]> {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });

    return this.buildTreeIterative(categories);
  }

  private static buildTreeIterative(categories: Category[]): Category[] {
    const categoryMap = new Map<number, any>();
    const roots: any[] = [];

    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat.toJSON(), children: [] });
    });

    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        parent.children.push(node);
      } else if (!cat.parentId) {
        roots.push(node);
      }
    });

    return roots;
  }

  static async getList(
    page: number = 1,
    pageSize: number = 10,
    name?: string,
    isActive?: boolean
  ): Promise<{ list: Category[]; total: number }> {
    const where: any = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name', 'isActive'] }],
    });

    return { list: rows, total: count };
  }

  static async toggleActive(id: number): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('类目不存在');
    }

    if (category.isActive) {
      const activeChildren = await Category.findOne({
        where: { parentId: id, isActive: true },
      });
      if (activeChildren) {
        throw new ConflictError('存在启用的子类目，请先停用子类目');
      }
    }

    if (!category.isActive && category.parentId) {
      const parent = await Category.findByPk(category.parentId);
      if (parent && !parent.isActive) {
        throw new BadRequestError('父类目已停产，无法启用该类目');
      }
    }

    await category.update({ isActive: !category.isActive });

    return category;
  }

  static async validateActiveCategory(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('配件类目不存在');
    }
    if (!category.isActive) {
      throw new BadRequestError(`配件类目【${category.name}】已停产，无法选择`);
    }
  }

  static async getCategoryPath(id: number): Promise<string> {
    const category = await Category.findByPk(id);
    if (!category) {
      return '';
    }

    const path: string[] = [category.name];
    let currentId = category.parentId;

    while (currentId) {
      const parent = await Category.findByPk(currentId);
      if (parent) {
        path.unshift(parent.name);
        currentId = parent.parentId;
      } else {
        break;
      }
    }

    return path.join(' / ');
  }
}

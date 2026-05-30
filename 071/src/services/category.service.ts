import Category, { CategoryAttributes } from '../models/Category.model';
import Product from '../models/Product.model';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import { Op } from 'sequelize';

class CategoryService {
  async createCategory(data: Omit<CategoryAttributes, 'id' | 'level'>): Promise<Category> {
    let level = 1;
    if (data.parentId > 0) {
      const parent = await Category.findByPk(data.parentId);
      if (!parent) {
        throw new BadRequestException('父类目不存在');
      }
      if (parent.status === 0) {
        throw new BadRequestException('父类目已下架，无法创建子类目');
      }
      level = parent.level + 1;
    }

    return await Category.create({
      ...data,
      level,
      status: 1
    });
  }

  async updateCategory(id: number, data: Partial<CategoryAttributes>): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      if (data.parentId === id) {
        throw new BadRequestException('不能将自己设为父类目');
      }
      let level = 1;
      if (data.parentId > 0) {
        const parent = await Category.findByPk(data.parentId);
        if (!parent) {
          throw new BadRequestException('父类目不存在');
        }
        if (parent.status === 0) {
          throw new BadRequestException('父类目已下架，无法移动到该类目下');
        }
        const children = await this.getAllChildIds(id);
        if (children.includes(data.parentId)) {
          throw new BadRequestException('不能将子类目设为父类目');
        }
        level = parent.level + 1;
      }
      (data as any).level = level;
      await this.updateChildLevels(id, level);
    }

    await category.update(data);
    return category;
  }

  private async updateChildLevels(parentId: number, parentLevel: number): Promise<void> {
    const children = await Category.findAll({ where: { parentId } });
    for (const child of children) {
      const newLevel = parentLevel + 1;
      await child.update({ level: newLevel });
      await this.updateChildLevels(child.id, newLevel);
    }
  }

  private async getAllChildIds(parentId: number): Promise<number[]> {
    const children = await Category.findAll({ where: { parentId }, attributes: ['id'] });
    let ids = children.map(c => c.id);
    for (const id of ids) {
      const childIds = await this.getAllChildIds(id);
      ids = [...ids, ...childIds];
    }
    return ids;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const hasChildren = await Category.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw new BadRequestException('该类目下有子类目，无法删除');
    }

    const hasProducts = await Product.count({ where: { categoryId: id } });
    if (hasProducts > 0) {
      throw new BadRequestException('该类目下有商品，无法删除');
    }

    await category.destroy();
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await Category.findByPk(id, {
      include: [{ model: Product, as: 'products', limit: 10 }]
    });
    if (!category) {
      throw new NotFoundException('类目不存在');
    }
    return category;
  }

  async getCategoryTree(includeProducts: boolean = false): Promise<CategoryAttributes[]> {
    const allCategories = await Category.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC'], ['id', 'ASC']],
      raw: true
    });

    let productsMap: Map<number, any[]> | null = null;
    if (includeProducts) {
      const products = await Product.findAll({
        where: { status: 1 },
        order: [['sort', 'ASC']],
        raw: true
      });
      productsMap = new Map();
      for (const product of products) {
        const list = productsMap.get(product.categoryId) || [];
        list.push(product);
        productsMap.set(product.categoryId, list);
      }
    }

    return this.buildTree(allCategories, 0, productsMap);
  }

  private buildTree(categories: CategoryAttributes[], parentId: number, productsMap?: Map<number, any[]> | null): CategoryAttributes[] {
    const result: CategoryAttributes[] = [];
    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildTree(categories, category.id!, productsMap);
        const categoryData: any = { ...category };
        if (children.length > 0) {
          categoryData.children = children;
        }
        if (productsMap && productsMap.has(category.id!)) {
          categoryData.products = productsMap.get(category.id!);
        }
        result.push(categoryData);
      }
    }
    return result;
  }

  async getCategoryList(params: {
    page?: number;
    pageSize?: number;
    status?: number;
    parentId?: number;
  }): Promise<{ list: Category[]; total: number; page: number; pageSize: number }> {
    const { page = 1, pageSize = 10, status, parentId } = params;
    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['sort', 'ASC'], ['id', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateStatus(id: number, status: number): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    if (status === 0) {
      const childIds = await this.getAllChildIds(id);
      const allCategoryIds = [id, ...childIds];
      
      const hasActiveProducts = await Product.count({
        where: {
          categoryId: { [Op.in]: allCategoryIds },
          status: 1
        }
      });
      if (hasActiveProducts > 0) {
        throw new BadRequestException('该类目或其子类目下有上架商品，无法下架');
      }

      await Category.update({ status: 0 }, { where: { id: { [Op.in]: allCategoryIds } } });
    } else {
      await category.update({ status });
    }

    return await Category.findByPk(id) as Category;
  }

  async getCategoryPath(id: number): Promise<CategoryAttributes[]> {
    const path: CategoryAttributes[] = [];
    let currentId = id;
    
    while (currentId > 0) {
      const category = await Category.findByPk(currentId, { raw: true });
      if (!category) break;
      path.unshift(category);
      currentId = category.parentId;
    }
    
    return path;
  }
}

export default new CategoryService();

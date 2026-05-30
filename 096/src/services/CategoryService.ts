import Category, { CategoryAttributes } from '../models/Category';
import Collection from '../models/Collection';
import WorkOrder from '../models/WorkOrder';
import { NotFoundException, BusinessException } from '../exceptions/BusinessException';
import { Op, literal } from 'sequelize';

class CategoryService {
  async createCategory(data: Omit<CategoryAttributes, 'id'>): Promise<Category> {
    if (data.parentId) {
      const parent = await Category.findByPk(data.parentId);
      if (!parent) {
        throw new NotFoundException('父类目不存在');
      }
      if (parent.status === 0) {
        throw new BusinessException('父类目已下线，不能在其下创建子类目');
      }
      data.level = parent.level + 1;
    }

    const existing = await Category.findOne({ where: { code: data.code } });
    if (existing) {
      throw new BusinessException('类目编码已存在');
    }

    return Category.create(data);
  }

  async updateCategory(id: number, data: Partial<CategoryAttributes>): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    if (data.code && data.code !== category.code) {
      const existing = await Category.findOne({ where: { code: data.code } });
      if (existing) {
        throw new BusinessException('类目编码已存在');
      }
    }

    if (data.parentId && data.parentId !== category.parentId) {
      const parent = await Category.findByPk(data.parentId);
      if (!parent) {
        throw new NotFoundException('父类目不存在');
      }
      if (parent.status === 0) {
        throw new BusinessException('不能移动到已下线的父类目下');
      }
      data.level = parent.level + 1;
    }

    await category.update(data);
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const children = await Category.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BusinessException('请先删除子类目');
    }

    const collectionCount = await Collection.count({ where: { categoryId: id } });
    if (collectionCount > 0) {
      throw new BusinessException(`该类目下存在 ${collectionCount} 个藏品档案，请先移走藏品后再删除`);
    }

    await category.destroy();
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await Category.findByPk(id, {
      include: [{ model: Category, as: 'parent' }]
    });
    if (!category) {
      throw new NotFoundException('类目不存在');
    }
    return category;
  }

  async getCategoryTree(includeOffline: boolean = false): Promise<Category[]> {
    const where: any = {};
    if (!includeOffline) {
      where.status = 1;
    }

    const allCategories = await Category.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const categoryMap = new Map<number, any>();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat.toJSON(), children: [] });
    });

    const rootCategories: any[] = [];
    categoryMap.forEach((category) => {
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId).children.push(category);
      } else if (!category.parentId) {
        rootCategories.push(category);
      }
    });

    const removeEmptyChildren = (categories: any[]): any[] => {
      return categories.map(cat => {
        if (cat.children && cat.children.length > 0) {
          cat.children = removeEmptyChildren(cat.children);
        } else {
          delete cat.children;
        }
        return cat;
      });
    };

    return removeEmptyChildren(rootCategories);
  }

  async getCategoryList(params: {
    page?: number;
    pageSize?: number;
    name?: string;
    status?: number;
    parentId?: number;
  }): Promise<{ list: Category[]; total: number; page: number; pageSize: number }> {
    const { page = 1, pageSize = 10, name, status, parentId } = params;

    const where: any = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status !== undefined) where.status = status;
    if (parentId !== undefined) where.parentId = parentId;

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['sort', 'ASC'], ['id', 'DESC']],
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateCategoryStatus(id: number, status: number): Promise<Category> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    if (status === 0) {
      const childrenCount = await Category.count({ 
        where: { parentId: id, status: 1 } 
      });
      if (childrenCount > 0) {
        throw new BusinessException(`该类目下存在 ${childrenCount} 个启用的子类目，请先下线子类目`);
      }

      const collectionCount = await Collection.count({ where: { categoryId: id } });
      if (collectionCount > 0) {
        throw new BusinessException(`该类目下存在 ${collectionCount} 个藏品档案，请先移走藏品后再下线`);
      }

      const activeWorkOrders = await WorkOrder.count({
        include: [{
          model: Collection,
          as: 'collection',
          where: { categoryId: id }
        }],
        where: {
          status: {
            [Op.in]: [
              'pending_inspection',
              'inspecting',
              'pending_quotation',
              'quotation_sent',
              'quotation_approved',
              'in_repair',
              'repair_completed',
              'on_consign'
            ]
          }
        }
      });
      if (activeWorkOrders > 0) {
        throw new BusinessException(`该类目下存在 ${activeWorkOrders} 个进行中的工单，请先处理完成后再下线`);
      }
    }

    await category.update({ status });
    return category;
  }

  async getCategoryPath(id: number): Promise<Category[]> {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const path: Category[] = [];
    let currentId: number | null = id;

    while (currentId) {
      const cat = await Category.findByPk(currentId);
      if (cat) {
        path.unshift(cat);
        currentId = cat.parentId;
      } else {
        break;
      }
    }

    return path;
  }
}

export default new CategoryService();
import { Category } from '../models/category.model';
import { CategoryStatus } from '../constants/business';
import { BusinessError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../database';
import { operationLogService } from './operationLog.service';

export class CategoryService {
  async createCategory(
    data: {
      name: string;
      description?: string;
      parentId?: number;
      sort?: number;
    },
    operatorId?: number,
    operatorName?: string
  ) {
    if (data.parentId) {
      const parent = await Category.findByPk(data.parentId);
      if (!parent) {
        throw new BusinessError('父级类目不存在');
      }
      if (parent.status === CategoryStatus.DISABLED) {
        throw new BusinessError('父级类目已被封存，无法在其下新增子类目');
      }
    }

    const category = await Category.create(data);

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'category',
        operation: 'create',
        targetId: category.id,
        afterData: category.toJSON(),
        operatorId,
        operatorName,
        remark: '创建类目',
      });
    }

    return category;
  }

  private async getCategoryChain(id: number): Promise<Category[]> {
    const categories: Category[] = [];
    let currentId: number | null = id;
    
    while (currentId) {
      const category = await Category.findByPk(currentId);
      if (!category) break;
      categories.push(category);
      currentId = category.parentId;
    }
    
    return categories;
  }

  private async getAllChildIds(parentId: number): Promise<number[]> {
    const childIds: number[] = [];
    const children = await Category.findAll({ where: { parentId } });
    
    for (const child of children) {
      childIds.push(child.id);
      const grandChildIds = await this.getAllChildIds(child.id);
      childIds.push(...grandChildIds);
    }
    
    return childIds;
  }

  async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
      parentId?: number;
      sort?: number;
      status?: CategoryStatus;
    },
    operatorId?: number,
    operatorName?: string
  ) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new BusinessError('类目不存在');
    }

    if (data.parentId && data.parentId !== category.parentId) {
      const parent = await Category.findByPk(data.parentId);
      if (!parent) {
        throw new BusinessError('父级类目不存在');
      }
      if (data.parentId === id) {
        throw new BusinessError('不能将自己设为父级');
      }
      if (parent.status === CategoryStatus.DISABLED) {
        throw new BusinessError('父级类目已被封存，无法移动到该类目下');
      }
    }

    const beforeData = category.toJSON();

    if (data.status === CategoryStatus.DISABLED && category.status !== CategoryStatus.DISABLED) {
      await sequelize.transaction(async (t: Transaction) => {
        await category.update(data, { transaction: t });
        const childIds = await this.getAllChildIds(id);
        if (childIds.length > 0) {
          await Category.update(
            { status: CategoryStatus.DISABLED },
            { where: { id: { [Op.in]: childIds } }, transaction: t }
          );
        }
      });
      
      if (operatorId) {
        await operationLogService.logOperation({
          module: 'category',
          operation: 'update',
          targetId: id,
          beforeData,
          afterData: (await Category.findByPk(id))?.toJSON(),
          operatorId,
          operatorName,
          remark: '更新类目（级联封存子类目）',
        });
      }
      
      return await Category.findByPk(id);
    }

    await category.update(data);

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'category',
        operation: 'update',
        targetId: id,
        beforeData,
        afterData: category.toJSON(),
        operatorId,
        operatorName,
        remark: '更新类目',
      });
    }

    return category;
  }

  async deleteCategory(id: number, operatorId?: number, operatorName?: string) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new BusinessError('类目不存在');
    }

    const hasChildren = await Category.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw new BusinessError('请先删除子级类目');
    }

    const beforeData = category.toJSON();
    await category.destroy();

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'category',
        operation: 'delete',
        targetId: id,
        beforeData,
        operatorId,
        operatorName,
        remark: '删除类目',
      });
    }

    return true;
  }

  async getCategory(id: number) {
    return await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
        },
      ],
    });
  }

  async getCategoryTree(status?: CategoryStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const categories = await Category.findAll({
      where,
      order: [['sort', 'ASC']],
    });

    return this.buildTreeEfficient(categories);
  }

  async getCategoryList(params: {
    page?: number;
    pageSize?: number;
    name?: string;
    status?: CategoryStatus;
  }) {
    const { page = 1, pageSize = 10, name, status } = params;
    const where: any = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['sort', 'ASC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  private buildTreeEfficient(categories: Category[]): Category[] {
    const categoryMap = new Map<number | null, Category[]>();
    
    for (const category of categories) {
      const parentId = category.parentId || null;
      if (!categoryMap.has(parentId)) {
        categoryMap.set(parentId, []);
      }
      categoryMap.get(parentId)!.push(category);
    }

    const buildTree = (parentId: number | null = null): Category[] => {
      const children = categoryMap.get(parentId) || [];
      return children.map(category => {
        const childCategories = buildTree(category.id);
        if (childCategories.length > 0) {
          (category as any).dataValues.children = childCategories;
        }
        return category;
      });
    };

    return buildTree(null);
  }
}

export const categoryService = new CategoryService();

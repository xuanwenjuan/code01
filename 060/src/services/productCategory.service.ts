import { ProductCategory } from '../database/models/productCategory.model';
import { AppError } from '../middleware/errorHandler';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database/sequelize';

export class ProductCategoryService {
  async create(data: Partial<ProductCategory>) {
    if (data.parentId) {
      const parent = await ProductCategory.findByPk(data.parentId);
      if (!parent) {
        throw new AppError('父分类不存在', 400);
      }
      if (!parent.enabled) {
        throw new AppError('父分类已下架，无法添加子分类', 400);
      }
    }

    if (data.sortOrder === undefined || data.sortOrder === null) {
      const maxSort = await ProductCategory.max('sortOrder', {
        where: data.parentId ? { parentId: data.parentId } : { parentId: null },
      });
      data.sortOrder = (maxSort as number || 0) + 1;
    }

    return ProductCategory.create(data);
  }

  async update(id: number, data: Partial<ProductCategory>) {
    const category = await ProductCategory.findByPk(id);
    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    if (data.parentId && data.parentId === id) {
      throw new AppError('不能将自己设为父分类', 400);
    }

    if (data.parentId) {
      const parent = await ProductCategory.findByPk(data.parentId);
      if (!parent) {
        throw new AppError('父分类不存在', 400);
      }
      if (!parent.enabled) {
        throw new AppError('父分类已下架，无法移动到该分类下', 400);
      }

      const hasChild = await this.checkHasChild(id, data.parentId);
      if (hasChild) {
        throw new AppError('不能移动到自己的子分类下', 400);
      }
    }

    await category.update(data);
    return category;
  }

  private async checkHasChild(parentId: number, targetId: number): Promise<boolean> {
    const children = await ProductCategory.findAll({ where: { parentId } });
    for (const child of children) {
      if (child.id === targetId) return true;
      const hasChild = await this.checkHasChild(child.id, targetId);
      if (hasChild) return true;
    }
    return false;
  }

  async delete(id: number) {
    const category = await ProductCategory.findByPk(id);
    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    const children = await ProductCategory.count({ where: { parentId: id } });
    if (children > 0) {
      throw new AppError('该分类下存在子分类，无法删除', 400);
    }

    await category.destroy();
    return true;
  }

  async getById(id: number) {
    const category = await ProductCategory.findByPk(id, {
      include: [{ model: ProductCategory, as: 'parent' }],
    });
    if (!category) {
      throw new AppError('分类不存在', 404);
    }
    return category;
  }

  async getTree(type?: string, enabledOnly?: boolean) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (enabledOnly) {
      where.enabled = true;
    }

    const categories = await ProductCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      raw: false,
    });

    const buildTree = (parentId: number | null): any[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat.toJSON(),
          children: buildTree(cat.id),
        }));
    };

    return buildTree(null);
  }

  async getList(params: { page?: number; pageSize?: number; type?: string; enabled?: boolean }) {
    const { page = 1, pageSize = 10, type, enabled } = params;
    const where: any = {};

    if (type) where.type = type;
    if (enabled !== undefined) where.enabled = enabled;

    const { count, rows } = await ProductCategory.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      include: [{ model: ProductCategory, as: 'parent', attributes: ['id', 'name'] }],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async toggleStatus(id: number) {
    const t = await sequelize.transaction();

    try {
      const category = await ProductCategory.findByPk(id, { transaction: t });
      if (!category) {
        await t.rollback();
        throw new AppError('分类不存在', 404);
      }

      const newStatus = !category.enabled;

      if (!newStatus) {
        const enabledChildren = await ProductCategory.count({
          where: { parentId: id, enabled: true },
          transaction: t,
        });
        if (enabledChildren > 0) {
          await t.rollback();
          throw new AppError('该分类下存在启用的子分类，请先下架所有子分类', 400);
        }
      }

      await category.update({ enabled: newStatus }, { transaction: t });
      await t.commit();

      return category;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateSortOrder(ids: number[]) {
    const t = await sequelize.transaction();

    try {
      for (let i = 0; i < ids.length; i++) {
        await ProductCategory.update(
          { sortOrder: i + 1 },
          { where: { id: ids[i] }, transaction: t }
        );
      }

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export const productCategoryService = new ProductCategoryService();

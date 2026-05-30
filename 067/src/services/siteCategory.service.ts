import { SiteCategory, ChargingSite } from '../models';
import { SiteCategoryType } from '../types';
import { AppError } from '../middleware/error.middleware';
import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';

export class SiteCategoryService {
  async create(data: {
    name: string;
    type: SiteCategoryType;
    parentId?: number;
    sortOrder?: number;
    description?: string;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      if (data.parentId) {
        const parent = await SiteCategory.findByPk(data.parentId, {
          transaction: t,
        });

        if (!parent) {
          throw new AppError('父分类不存在', 404);
        }
      }

      const category = await SiteCategory.create(data, { transaction: t });
      await t.commit();

      return category;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const category = await SiteCategory.findByPk(id, {
      include: [
        {
          model: SiteCategory,
          as: 'children',
        },
        {
          model: ChargingSite,
          as: 'sites',
          attributes: ['id', 'siteCode', 'name'],
        },
      ],
    });

    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    return category;
  }

  private async buildCategoryTree(
    parentId: number | null,
    type?: SiteCategoryType,
    depth: number = 0,
    maxDepth: number = 10
  ): Promise<any[]> {
    if (depth >= maxDepth) {
      return [];
    }

    const where: any = { parentId, isActive: true };

    if (type) {
      where.type = type;
    }

    const categories = await SiteCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    const result: any[] = [];

    for (const category of categories) {
      const children = await this.buildCategoryTree(
        category.id,
        type,
        depth + 1,
        maxDepth
      );

      result.push({
        ...category.toJSON(),
        children,
      });
    }

    return result;
  }

  async getTree(type?: SiteCategoryType, maxDepth: number = 10) {
    return this.buildCategoryTree(null, type, 0, maxDepth);
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    type?: SiteCategoryType;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 10, type, keyword } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await SiteCategory.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        {
          model: SiteCategory,
          as: 'parent',
          attributes: ['id', 'name'],
        },
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async update(
    id: number,
    data: {
      name?: string;
      type?: SiteCategoryType;
      parentId?: number;
      sortOrder?: number;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const t: Transaction = await sequelize.transaction();

    try {
      const category = await SiteCategory.findByPk(id, { transaction: t });

      if (!category) {
        throw new AppError('分类不存在', 404);
      }

      if (data.parentId === id) {
        throw new AppError('不能将自己设为父分类', 400);
      }

      if (data.parentId) {
        const parent = await SiteCategory.findByPk(data.parentId, {
          transaction: t,
        });

        if (!parent) {
          throw new AppError('父分类不存在', 404);
        }
      }

      await category.update(data, { transaction: t });
      await t.commit();

      return category;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const category = await SiteCategory.findByPk(id, { transaction: t });

      if (!category) {
        throw new AppError('分类不存在', 404);
      }

      const hasChildren = await SiteCategory.count({
        where: { parentId: id },
        transaction: t,
      });

      if (hasChildren > 0) {
        throw new AppError('该分类下有子分类，无法删除', 400);
      }

      const hasSites = await ChargingSite.count({
        where: { categoryId: id },
        transaction: t,
      });

      if (hasSites > 0) {
        throw new AppError('该分类下有站点，无法删除', 400);
      }

      await category.destroy({ transaction: t });
      await t.commit();

      return null;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new SiteCategoryService();

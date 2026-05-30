import Category from '../models/Category';
import Material from '../models/Material';
import { BusinessError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

export interface CreateCategoryRequest {
  name: string;
  code: string;
  parentId?: number;
  sort?: number;
}

export interface UpdateCategoryRequest {
  id: number;
  name?: string;
  code?: string;
  parentId?: number;
  sort?: number;
  status?: number;
}

export enum CategoryStatus {
  ARCHIVED = 0,
  ACTIVE = 1
}

class CategoryService {
  async create(request: CreateCategoryRequest) {
    const existingCode = await Category.findOne({
      where: { code: request.code }
    });

    if (existingCode) {
      throw new BusinessError('类目编码已存在', 400);
    }

    const existingName = await Category.findOne({
      where: { 
        name: request.name,
        parentId: request.parentId || null
      }
    });

    if (existingName) {
      throw new BusinessError('同级类目下名称已存在', 400);
    }

    let level = 1;
    if (request.parentId) {
      const parent = await Category.findByPk(request.parentId);
      if (!parent) {
        throw new BusinessError('父类目不存在', 400);
      }
      if (parent.status === CategoryStatus.ARCHIVED) {
        throw new BusinessError('不能在已归档的类目下创建子类目', 400);
      }
      level = parent.level + 1;
    }

    return Category.create({
      ...request,
      level,
      status: CategoryStatus.ACTIVE
    });
  }

  async update(request: UpdateCategoryRequest) {
    const category = await Category.findByPk(request.id);
    if (!category) {
      throw new BusinessError('类目不存在', 404);
    }

    if (request.code && request.code !== category.code) {
      const existing = await Category.findOne({
        where: { code: request.code }
      });
      if (existing) {
        throw new BusinessError('类目编码已存在', 400);
      }
    }

    if (request.name && request.name !== category.name) {
      const existingName = await Category.findOne({
        where: { 
          name: request.name,
          parentId: category.parentId,
          id: { [Op.ne]: request.id }
        }
      });
      if (existingName) {
        throw new BusinessError('同级类目下名称已存在', 400);
      }
    }

    if (request.parentId && request.parentId !== category.parentId) {
      const parent = await Category.findByPk(request.parentId);
      if (!parent) {
        throw new BusinessError('父类目不存在', 400);
      }
      if (parent.status === CategoryStatus.ARCHIVED) {
        throw new BusinessError('不能将类目移动到已归档的类目下', 400);
      }
      (category as any).level = parent.level + 1;
    }

    return category.update(request);
  }

  async archive(id: number) {
    const t = await sequelize.transaction();
    
    try {
      const category = await Category.findByPk(id, { transaction: t });
      if (!category) {
        throw new BusinessError('类目不存在', 404);
      }

      if (category.status === CategoryStatus.ARCHIVED) {
        throw new BusinessError('类目已是归档状态', 400);
      }

      const childCount = await Category.count({
        where: { parentId: id, status: CategoryStatus.ACTIVE },
        transaction: t
      });
      if (childCount > 0) {
        throw new BusinessError('请先归档子类目', 400);
      }

      const materialCount = await Material.count({
        where: { categoryId: id, status: 1 },
        transaction: t
      });
      if (materialCount > 0) {
        throw new BusinessError('该类目下还有正常状态的物资，请先处理物资', 400);
      }

      await category.update({ status: CategoryStatus.ARCHIVED }, { transaction: t });
      
      await t.commit();
      return category;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async unarchive(id: number) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new BusinessError('类目不存在', 404);
    }

    if (category.status !== CategoryStatus.ARCHIVED) {
      throw new BusinessError('类目不是归档状态', 400);
    }

    if (category.parentId) {
      const parent = await Category.findByPk(category.parentId);
      if (parent && parent.status === CategoryStatus.ARCHIVED) {
        throw new BusinessError('父类目已归档，请先启用父类目', 400);
      }
    }

    return category.update({ status: CategoryStatus.ACTIVE });
  }

  async delete(id: number) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new BusinessError('类目不存在', 404);
    }

    if (category.status === CategoryStatus.ACTIVE) {
      throw new BusinessError('请先归档类目再删除', 400);
    }

    const childCount = await Category.count({
      where: { parentId: id }
    });
    if (childCount > 0) {
      throw new BusinessError('请先删除子类目', 400);
    }

    return category.destroy();
  }

  async getById(id: number) {
    return Category.findByPk(id);
  }

  async getTree() {
    const categories = await Category.findAll({
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    return this.buildTree(categories, null);
  }

  private buildTree(categories: Category[], parentId: number | null): Category[] {
    const tree: Category[] = [];
    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildTree(categories, category.id);
        (category as any).dataValues.children = children;
        tree.push(category);
      }
    }
    return tree;
  }

  async getList(params: { name?: string; status?: number }) {
    const where: any = {};
    if (params.name) {
      where.name = { [Op.like]: `%${params.name}%` };
    }
    if (params.status !== undefined) {
      where.status = params.status;
    }

    return Category.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });
  }
}

export default new CategoryService();
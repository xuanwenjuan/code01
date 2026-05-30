import { Request, Response, NextFunction } from 'express';
import { Category, Product } from '../models';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { CategoryStatus } from '../types';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../database';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { name, parentId, icon, sortOrder, description } = req.body;

    let parent: Category | null = null;
    let level = 1;
    let path = '';

    if (parentId) {
      parent = await Category.findByPk(parentId, { transaction: t });
      if (!parent) {
        throw new AppError('父级分类不存在', 400, 400);
      }
      level = parent.level + 1;
      path = parent.path ? `${parent.path},${parentId}` : `${parentId}`;
    }

    const category = await Category.create({
      name,
      parentId,
      icon,
      sortOrder: sortOrder || 0,
      status: CategoryStatus.ACTIVE,
      level,
      path,
      description
    }, { transaction: t });

    await t.commit();
    res.status(201).json(ResponseUtil.success(category, '分类创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const where: any = {};

    const allCategories = await Category.findAll({
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    if (status) {
      where.status = status;
    }

    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    const activeCategoryIds = new Set(categories.map(c => c.id));
    
    const tree = buildTreeRecursive(allCategories, null, activeCategoryIds, status !== undefined);

    res.json(ResponseUtil.success(tree));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }

    res.json(ResponseUtil.success(category));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, parentId, icon, sortOrder, status, description } = req.body;

    const category = await Category.findByPk(id, { transaction: t });

    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }

    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId !== null) {
        const parent = await Category.findByPk(parentId, { transaction: t });
        if (!parent) {
          throw new AppError('父级分类不存在', 400, 400);
        }
        const level = parent.level + 1;
        const path = parent.path ? `${parent.path},${parentId}` : `${parentId}`;
        
        await category.update({ name, parentId, icon, sortOrder, status, description, level, path }, { transaction: t });
        
        await updateChildrenPath(id, path, level, t);
      } else {
        await category.update({ name, parentId: null, icon, sortOrder, status, description, level: 1, path: '' }, { transaction: t });
        
        await updateChildrenPath(id, '', 1, t);
      }
    } else {
      await category.update({ name, icon, sortOrder, status, description }, { transaction: t });
    }

    await t.commit();
    res.json(ResponseUtil.success(category, '分类更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, { transaction: t });

    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }

    const hasChildren = await Category.count({ where: { parentId: id }, transaction: t });

    if (hasChildren > 0) {
      throw new AppError('请先删除子分类', 400, 400);
    }

    const hasProducts = await Product.count({ where: { categoryId: id }, transaction: t });

    if (hasProducts > 0) {
      throw new AppError('该分类下存在商品，无法删除', 400, 400);
    }

    await category.destroy({ transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(null, '分类删除成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, { transaction: t });

    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }

    const newStatus = category.status === CategoryStatus.ACTIVE ? CategoryStatus.INACTIVE : CategoryStatus.ACTIVE;

    if (newStatus === CategoryStatus.INACTIVE) {
      const productCount = await Product.count({ 
        where: { categoryId: id, isActive: true },
        transaction: t 
      });
      
      if (productCount > 0) {
        throw new AppError(`该分类下有 ${productCount} 个上架商品，请先下架后再停售`, 400, 400);
      }
    }

    await category.update({ status: newStatus }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(category, '分类状态更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getCategoryPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      throw new AppError('分类不存在', 404, 404);
    }

    const pathIds = category.path ? category.path.split(',').map(Number).concat([category.id]) : [category.id];

    const pathCategories = await Category.findAll({
      where: { id: { [Op.in]: pathIds } },
      order: [['level', 'ASC']]
    });

    res.json(ResponseUtil.success(pathCategories));
  } catch (error) {
    next(error);
  }
};

async function updateChildrenPath(parentId: number, parentPath: string, parentLevel: number, t: Transaction) {
  const children = await Category.findAll({ where: { parentId }, transaction: t });
  
  for (const child of children) {
    const newLevel = parentLevel + 1;
    const newPath = parentPath ? `${parentPath},${parentId}` : `${parentId}`;
    
    await child.update({ level: newLevel, path: newPath }, { transaction: t });
    
    await updateChildrenPath(child.id, newPath, newLevel, t);
  }
}

function buildTreeRecursive(
  categories: Category[], 
  parentId: number | null, 
  activeCategoryIds: Set<number>,
  filterByStatus: boolean
): any[] {
  const result: any[] = [];

  for (const category of categories) {
    if (category.parentId === parentId) {
      if (filterByStatus && !activeCategoryIds.has(category.id)) {
        continue;
      }

      const children = buildTreeRecursive(categories, category.id, activeCategoryIds, filterByStatus);

      if (filterByStatus && children.length === 0 && !activeCategoryIds.has(category.id)) {
        continue;
      }

      result.push({
        ...category.toJSON(),
        children
      });
    }
  }

  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}

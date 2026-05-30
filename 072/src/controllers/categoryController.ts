import { Request, Response, NextFunction } from 'express';
import ActivityCategory from '../models/ActivityCategory';
import { AppError } from '../middleware/errorHandler';
import sequelize from '../config/database';
import { Op } from 'sequelize';

const buildTreeRecursive = async (parentId: number | null, status?: number): Promise<any[]> => {
  const where: any = { parentId };
  if (status !== undefined) {
    where.status = status;
  }

  const categories = await ActivityCategory.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });

  const result = [];
  for (const category of categories) {
    const children = await buildTreeRecursive(category.id, status);
    result.push({
      ...category.toJSON(),
      children
    });
  }

  return result;
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const statusFilter = status !== undefined ? Number(status) : undefined;
    
    const tree = await buildTreeRecursive(null, statusFilter);
    
    res.success(tree);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await ActivityCategory.findByPk(id);

    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    res.success(category);
  } catch (error) {
    next(error);
  }
};

export const getCategoryWithChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await ActivityCategory.findByPk(id);

    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    const children = await buildTreeRecursive(Number(id));
    const result = {
      ...category.toJSON(),
      children
    };

    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId, description, sortOrder = 0 } = req.body;

    if (!name || name.trim() === '') {
      throw new AppError('类目名称不能为空', 400);
    }

    if (parentId) {
      const parentCategory = await ActivityCategory.findByPk(parentId);
      if (!parentCategory) {
        throw new AppError('父级类目不存在', 400);
      }
    }

    const category = await ActivityCategory.create({
      name: name.trim(),
      parentId: parentId || null,
      description,
      sortOrder,
      status: 1
    });

    res.success(category, '类目创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, parentId, description, sortOrder, status } = req.body;

    const category = await ActivityCategory.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    if (parentId !== undefined && parentId !== null) {
      if (Number(parentId) === Number(id)) {
        throw new AppError('不能将自己设为父级类目', 400);
      }
      const parentCategory = await ActivityCategory.findByPk(parentId);
      if (!parentCategory) {
        throw new AppError('父级类目不存在', 400);
      }
    }

    await category.update({
      name: name ? name.trim() : undefined,
      parentId: parentId !== undefined ? parentId || null : undefined,
      description,
      sortOrder,
      status
    });

    res.success(category, '类目更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await ActivityCategory.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    const childCount = await ActivityCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new AppError('存在子类目，无法删除，请先删除子类目', 400);
    }

    await category.destroy();
    res.success(null, '类目删除成功');
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || status === null) {
      throw new AppError('状态值不能为空', 400);
    }

    const category = await ActivityCategory.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    await category.update({ status: status ? 1 : 0 });
    
    const message = status === 1 ? '类目已启用' : '类目已停办';
    res.success(category, message);
  } catch (error) {
    next(error);
  }
};

export const getActiveCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await ActivityCategory.findAll({
      where: { status: 1, parentId: null },
      order: [['sortOrder', 'ASC']]
    });

    const result = [];
    for (const category of categories) {
      const children = await buildTreeRecursive(category.id, 1);
      result.push({
        ...category.toJSON(),
        children
      });
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

import { Request, Response } from 'express';
import SparePartCategory from '../models/SparePartCategory.model';
import SparePart from '../models/SparePart.model';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { OperationType } from '../types';
import { createOperationLog } from '../services/operationLog.service';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

const MAX_CATEGORY_LEVEL = 5;

export interface CategoryTreeItem {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  path: string;
  sort: number;
  description: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryTreeItem[];
}

export const buildTree = (categories: SparePartCategory[], parentId: number | null = null): CategoryTreeItem[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map(cat => ({
      ...cat.toJSON(),
      children: buildTree(categories, cat.id)
    }));
};

const checkCircularReference = async (categoryId: number, parentId: number): Promise<boolean> => {
  if (categoryId === parentId) {
    return true;
  }

  const parent = await SparePartCategory.findByPk(parentId);
  if (!parent || !parent.parentId) {
    return false;
  }

  return checkCircularReference(categoryId, parent.parentId);
};

const updateChildrenLevelAndPath = async (
  parentId: number,
  parentPath: string,
  parentLevel: number,
  transaction: Transaction
): Promise<void> => {
  const children = await SparePartCategory.findAll({
    where: { parentId },
    transaction
  });

  for (const child of children) {
    const newLevel = parentLevel + 1;
    const newPath = parentPath ? `${parentPath},${parentId}` : String(parentId);

    await child.update(
      { level: newLevel, path: newPath },
      { transaction }
    );

    await updateChildrenLevelAndPath(child.id, newPath, newLevel, transaction);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { name, code, parentId = null, sort = 0, description = '', isEnabled = true } = req.body;

    if (!name || !code) {
      throw new AppError('分类名称和编码不能为空', 400);
    }

    const exists = await SparePartCategory.findOne({ where: { code }, transaction });
    if (exists) {
      throw new AppError('分类编码已存在', 400);
    }

    let level = 1;
    let path = '';

    if (parentId) {
      const parent = await SparePartCategory.findByPk(parentId, { transaction });
      if (!parent) {
        throw new AppError('父分类不存在', 400);
      }

      if (parent.level >= MAX_CATEGORY_LEVEL) {
        throw new AppError(`分类最多支持 ${MAX_CATEGORY_LEVEL} 层`, 400);
      }

      level = parent.level + 1;
      path = parent.path ? `${parent.path},${parentId}` : String(parentId);
    }

    const category = await SparePartCategory.create({
      name,
      code,
      parentId,
      level,
      path,
      sort,
      description,
      isEnabled
    }, { transaction });

    await transaction.commit();

    createOperationLog(req, 'category', OperationType.CREATE, `创建分类: ${name}`);
    return res.json(successResponse(category, '分类创建成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('创建分类失败'));
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, code, parentId, sort, description, isEnabled } = req.body;

    const category = await SparePartCategory.findByPk(id, { transaction });
    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    if (code && code !== category.code) {
      const exists = await SparePartCategory.findOne({ where: { code }, transaction });
      if (exists) {
        throw new AppError('分类编码已存在', 400);
      }
    }

    let newLevel = category.level;
    let newPath = category.path;

    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId === null) {
        newLevel = 1;
        newPath = '';
      } else {
        const hasCircular = await checkCircularReference(category.id, parentId);
        if (hasCircular) {
          throw new AppError('不能将分类移动到其自身或子分类下', 400);
        }

        const parent = await SparePartCategory.findByPk(parentId, { transaction });
        if (!parent) {
          throw new AppError('父分类不存在', 400);
        }

        if (parent.level >= MAX_CATEGORY_LEVEL) {
          throw new AppError(`分类最多支持 ${MAX_CATEGORY_LEVEL} 层`, 400);
        }

        newLevel = parent.level + 1;
        newPath = parent.path ? `${parent.path},${parentId}` : String(parentId);
      }

      await category.update(
        { name, code, parentId, level: newLevel, path: newPath, sort, description, isEnabled },
        { transaction }
      );

      await updateChildrenLevelAndPath(category.id, newPath, newLevel, transaction);
    } else {
      await category.update(
        { name, code, sort, description, isEnabled },
        { transaction }
      );
    }

    await transaction.commit();

    createOperationLog(req, 'category', OperationType.UPDATE, `更新分类: ${name}`);
    return res.json(successResponse(category, '分类更新成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('更新分类失败'));
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const category = await SparePartCategory.findByPk(id, { transaction });
    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    const hasChildren = await SparePartCategory.count({ where: { parentId: id }, transaction });
    if (hasChildren > 0) {
      throw new AppError('请先删除子分类', 400);
    }

    const hasSpareParts = await SparePart.count({ where: { categoryId: id }, transaction });
    if (hasSpareParts > 0) {
      throw new AppError('该分类下存在备件，无法删除', 400);
    }

    await category.destroy({ transaction });

    await transaction.commit();

    createOperationLog(req, 'category', OperationType.DELETE, `删除分类: ${category.name}`);
    return res.json(successResponse(null, '分类删除成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('删除分类失败'));
  }
};

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const { isEnabled } = req.query;
    const where: any = {};

    if (isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true';
    }

    const categories = await SparePartCategory.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const tree = buildTree(categories);
    return res.json(successResponse(tree));
  } catch (error) {
    return res.status(500).json(errorResponse('获取分类树失败'));
  }
};

export const getCategoryList = async (req: Request, res: Response) => {
  try {
    const { keyword, isEnabled, page = 1, pageSize = 10 } = req.query;
    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true';
    }

    const { count, rows } = await SparePartCategory.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    return res.json(successResponse({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    return res.status(500).json(errorResponse('获取分类列表失败'));
  }
};

export const getCategoryDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await SparePartCategory.findByPk(id, {
      include: [{ model: SparePartCategory, as: 'parent' }]
    });

    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    return res.json(successResponse(category));
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('获取分类详情失败'));
  }
};

export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;

    const categories = await SparePartCategory.findAll({
      where: { parentId: parentId === 'root' ? null : parentId },
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    return res.json(successResponse(categories));
  } catch (error) {
    return res.status(500).json(errorResponse('获取子分类失败'));
  }
};

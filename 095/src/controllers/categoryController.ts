import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import Category from '../models/Category';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { CategoryStatus } from '../types';
import { Op } from 'sequelize';

export const createCategoryValidation = [
  body('name').notEmpty().withMessage('类目名称不能为空').trim().isLength({ min: 1, max: 100 }).withMessage('类目名称长度应在1-100字符之间'),
  body('parentId').optional().isInt({ min: 1 }).withMessage('父类目ID必须为正整数'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
  body('description').optional().isLength({ max: 500 }).withMessage('描述长度不能超过500字符'),
  body('status').optional().isIn(Object.values(CategoryStatus)).withMessage('状态值无效，有效值：' + Object.values(CategoryStatus).join(', ')),
];

export const updateCategoryValidation = [
  param('id').isInt({ min: 1 }).withMessage('类目ID必须为正整数'),
  ...createCategoryValidation,
];

const hasDescendant = async (parentId: number, childId: number, visited: Set<number> = new Set()): Promise<boolean> => {
  if (visited.has(parentId)) return false;
  visited.add(parentId);

  const children = await Category.findAll({ where: { parentId } });
  for (const child of children) {
    if (child.id === childId) {
      return true;
    }
    const hasNested = await hasDescendant(child.id, childId, new Set(visited));
    if (hasNested) {
      return true;
    }
  }
  return false;
};

export const hasDiscontinuedAncestor = async (categoryId: number | null): Promise<boolean> => {
  if (!categoryId) return false;

  const category = await Category.findByPk(categoryId);
  if (!category) return false;

  if (category.status === CategoryStatus.DISCONTINUED) {
    return true;
  }

  if (category.parentId) {
    return await hasDiscontinuedAncestor(category.parentId);
  }

  return false;
};

export const getCategoryChain = async (categoryId: number | null): Promise<Category[]> => {
  const chain: Category[] = [];
  let currentId = categoryId;

  while (currentId) {
    const category = await Category.findByPk(currentId);
    if (!category) break;
    chain.unshift(category);
    currentId = category.parentId;
  }

  return chain;
};

const buildCategoryTree = (
  categories: Category[],
  parentId: number | null = null,
  level: number = 0,
  maxDepth: number = 10
): Category[] => {
  if (level >= maxDepth) return [];

  return categories
    .filter((cat) => cat.parentId === parentId)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.id - b.id;
    })
    .map((cat) => {
      const children = buildCategoryTree(categories, cat.id, level + 1, maxDepth);
      return {
        ...cat.toJSON(),
        level: cat.level,
        children,
        hasChildren: children.length > 0,
      } as Category;
    });
};

const buildCategoryTreeWithStatus = (
  categories: Category[],
  parentId: number | null = null,
  statusFilter?: CategoryStatus
): Category[] => {
  return categories
    .filter((cat) => {
      if (cat.parentId !== parentId) return false;
      if (statusFilter && cat.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => {
      const children = buildCategoryTreeWithStatus(categories, cat.id, statusFilter);
      return {
        ...cat.toJSON(),
        children,
      } as Category;
    });
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { name, parentId, sortOrder, description, status } = req.body;

    let level = 1;
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return next(new AppError('父类目不存在', 404));
      }
      level = parent.level + 1;
    }

    const category = await Category.create({
      name,
      parentId: parentId || null,
      level,
      sortOrder: sortOrder || 0,
      description,
      status: status || CategoryStatus.ACTIVE,
    });

    res.json(successResponse(category, '类目创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, maxDepth = '10' } = req.query;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });

    const tree = buildCategoryTree(categories, null, 0, parseInt(maxDepth as string));
    res.json(successResponse(tree));
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, name, status, parentId, level } = req.query;

    const where: any = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status) where.status = status;
    if (parentId !== undefined) where.parentId = parentId === 'null' ? null : Number(parentId);
    if (level) where.level = Number(level);

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name', 'status'] }],
    });

    res.json(paginatedResponse(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name', 'status'] }],
    });

    if (!category) {
      return next(new AppError('类目不存在', 404));
    }

    const chain = await getCategoryChain(category.id);

    res.json(successResponse({
      ...category.toJSON(),
      categoryChain: chain.map(c => ({ id: c.id, name: c.name, status: c.status })),
    }));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { id } = req.params;
    const { name, parentId, sortOrder, description, status } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return next(new AppError('类目不存在', 404));
    }

    if (status === CategoryStatus.DISCONTINUED && category.status !== CategoryStatus.DISCONTINUED) {
      const { Product } = await import('../models');
      const productCount = await Product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        return next(new AppError(`该类目下还有 ${productCount} 个产品，请先处理产品后再下架类目`, 400));
      }
    }

    let level = category.level;
    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId === null) {
        level = 1;
      } else {
        if (Number(parentId) === category.id) {
          return next(new AppError('不能将自己设为父类目', 400));
        }

        const parent = await Category.findByPk(parentId);
        if (!parent) {
          return next(new AppError('父类目不存在', 404));
        }

        if (parent.status === CategoryStatus.DISCONTINUED) {
          return next(new AppError('父类目已停产，不能设为父类目', 400));
        }

        const hasCycle = await hasDescendant(parentId, category.id);
        if (hasCycle) {
          return next(new AppError('设置的父类目会导致循环引用', 400));
        }

        level = parent.level + 1;
      }
    }

    await category.update({
      name,
      parentId: parentId === undefined ? category.parentId : (parentId || null),
      level,
      sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
      description: description !== undefined ? description : category.description,
      status: status !== undefined ? status : category.status,
    });

    res.json(successResponse(category, '类目更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return next(new AppError('类目不存在', 404));
    }

    const childCount = await Category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return next(new AppError(`该类目下还有 ${childCount} 个子类目，请先处理子类目后再操作`, 400));
    }

    const { Product } = await import('../models');
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return next(new AppError(`该类目下还有 ${productCount} 个产品，请先处理产品后再操作`, 400));
    }

    await category.update({ status: CategoryStatus.DISCONTINUED });

    res.json(successResponse(null, '类目已下架'));
  } catch (error) {
    next(error);
  }
};

export const batchUpdateCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('请选择要操作的类目', 400));
    }

    if (!Object.values(CategoryStatus).includes(status)) {
      return next(new AppError('状态值无效', 400));
    }

    if (status === CategoryStatus.DISCONTINUED) {
      for (const id of ids) {
        const childCount = await Category.count({ where: { parentId: id } });
        if (childCount > 0) {
          return next(new AppError(`类目ID ${id} 下还有子类目，请先处理子类目后再操作`, 400));
        }
      }
    }

    await Category.update(
      { status },
      { where: { id: { [Op.in]: ids } } }
    );

    res.json(successResponse(null, `批量更新${ids.length}个类目状态成功`));
  } catch (error) {
    next(error);
  }
};
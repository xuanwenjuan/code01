
import { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { Op, Transaction } from 'sequelize';
import { AssetCategory, sequelize } from '../models';
import { success, paginatedSuccess, error } from '../utils/response';
import { UserRole } from '../types';

const getAllChildIds = async (parentId: number): Promise<number[]> => {
  const childIds: number[] = [];
  const children = await AssetCategory.findAll({ where: { parentId } });
  
  for (const child of children) {
    childIds.push(child.id);
    const grandChildIds = await getAllChildIds(child.id);
    childIds.push(...grandChildIds);
  }
  
  return childIds;
};

const buildCategoryTree = (categories: any[], parentId: number | null = null, level: number = 0): any[] => {
  const result: any[] = [];
  const maxDepth = 100;
  
  if (level >= maxDepth) {
    return result;
  }
  
  for (const category of categories) {
    if (category.parentId === parentId) {
      const children = buildCategoryTree(categories, category.id, level + 1);
      const categoryData = category.toJSON();
      if (children.length > 0) {
        categoryData.children = children;
      }
      result.push(categoryData);
    }
  }
  return result;
};

const buildFlatCategoryList = (categories: any[], parentId: number | null = null, level: number = 0): any[] => {
  const result: any[] = [];
  const maxDepth = 100;
  
  if (level >= maxDepth) {
    return result;
  }
  
  for (const category of categories) {
    if (category.parentId === parentId) {
      const categoryData = category.toJSON();
      categoryData.level = level;
      result.push(categoryData);
      const children = buildFlatCategoryList(categories, category.id, level + 1);
      result.push(...children);
    }
  }
  return result;
};

export const categoryValidationRules = {
  create: [
    body('name').trim().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称长度不能超过100个字符'),
    body('code').trim().notEmpty().withMessage('分类编码不能为空').isLength({ max: 50 }).withMessage('分类编码长度不能超过50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须为正整数'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序值必须为非负整数'),
    body('description').optional().isLength({ max: 1000 }).withMessage('描述长度不能超过1000个字符')
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
    body('name').optional().trim().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称长度不能超过100个字符'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序值必须为非负整数'),
    body('description').optional().isLength({ max: 1000 }).withMessage('描述长度不能超过1000个字符'),
    body('isActive').optional().isBoolean().withMessage('isActive必须为布尔值')
  ],
  delete: [
    param('id').isInt({ min: 1 }).withMessage('分类ID必须为正整数')
  ],
  getDetail: [
    param('id').isInt({ min: 1 }).withMessage('分类ID必须为正整数')
  ]
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg);
    }

    const { name, code, parentId, sort, description } = req.body;

    const existingCategory = await AssetCategory.findOne({ where: { code } });
    if (existingCategory) {
      return error(res, '分类编码已存在');
    }

    let level = 1;
    if (parentId) {
      const parentCategory = await AssetCategory.findByPk(parentId);
      if (!parentCategory) {
        return error(res, '父分类不存在');
      }
      level = parentCategory.level + 1;
    }

    const category = await AssetCategory.create({
      name,
      code,
      parentId: parentId || null,
      level,
      sort: sort || 0,
      description
    });

    success(res, category, '分类创建成功');
  } catch (err) {
    error(res, '创建分类失败');
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return error(res, errors.array()[0].msg);
    }

    const { id } = req.params;
    const { name, sort, description, isActive } = req.body;

    const category = await AssetCategory.findByPk(id, { transaction });
    if (!category) {
      await transaction.rollback();
      return error(res, '分类不存在', 404);
    }

    const updateData: any = {
      name: name || category.name,
      sort: sort !== undefined ? sort : category.sort,
      description: description !== undefined ? description : category.description
    };

    if (isActive !== undefined) {
      updateData.isActive = isActive;
      
      if (!isActive) {
        const childIds = await getAllChildIds(parseInt(id));
        if (childIds.length > 0) {
          await AssetCategory.update(
            { isActive: false },
            { where: { id: { [Op.in]: childIds } }, transaction }
          );
        }
      }
    }

    await category.update(updateData, { transaction });
    await transaction.commit();

    success(res, category, isActive === false ? '分类及子分类已成功封存' : '分类更新成功');
  } catch (err) {
    await transaction.rollback();
    error(res, '更新分类失败');
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await AssetCategory.findByPk(id);
    if (!category) {
      return error(res, '分类不存在', 404);
    }

    const childCount = await AssetCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      return error(res, '该分类下存在子分类，无法删除');
    }

    await category.destroy();
    success(res, null, '分类删除成功');
  } catch (err) {
    error(res, '删除分类失败');
  }
};

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const { isActive, parentId } = req.query;
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await AssetCategory.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const rootParentId = parentId ? parseInt(parentId as string) : null;
    const tree = buildCategoryTree(categories, rootParentId);
    
    success(res, {
      list: tree,
      total: categories.length
    }, '查询成功');
  } catch (err) {
    error(res, '查询分类树失败');
  }
};

export const getFlatCategoryList = async (req: Request, res: Response) => {
  try {
    const { isActive, parentId } = req.query;
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await AssetCategory.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const rootParentId = parentId ? parseInt(parentId as string) : null;
    const flatList = buildFlatCategoryList(categories, rootParentId);
    
    success(res, {
      list: flatList,
      total: flatList.length
    }, '查询成功');
  } catch (err) {
    error(res, '查询分类列表失败');
  }
};

export const getCategoryList = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, keyword, isActive } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows } = await AssetCategory.findAndCountAll({
      where,
      include: [
        { model: AssetCategory, as: 'parent' }
      ],
      offset,
      limit: Number(pageSize),
      order: [['sort', 'ASC'], ['id', 'DESC']]
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (err) {
    error(res, '查询分类列表失败');
  }
};

export const getCategoryDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await AssetCategory.findByPk(id, {
      include: [
        { model: AssetCategory, as: 'parent' },
        { model: AssetCategory, as: 'children' }
      ]
    });

    if (!category) {
      return error(res, '分类不存在', 404);
    }

    success(res, category, '查询成功');
  } catch (err) {
    error(res, '查询分类详情失败');
  }
};

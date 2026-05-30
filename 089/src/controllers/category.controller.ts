import { Request, Response, NextFunction } from 'express';
import { Transaction } from 'sequelize';
import StrainCategory from '../models/StrainCategory';
import { ResponseUtil } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/error';
import { CategoryFilterParams, OperationType, Op } from '../types';
import sequelize from '../config/database';
import OperationLogService from '../services/operationLog.service';

const MAX_TREE_DEPTH = 20;

const buildTreeOptimized = (
  categories: StrainCategory[],
  parentId: number | null = null,
  currentDepth: number = 0
): any[] => {
  if (currentDepth > MAX_TREE_DEPTH) {
    console.warn(`树形查询深度超过限制 ${MAX_TREE_DEPTH}，已截断`);
    return [];
  }

  const categoryMap = new Map<number | null, StrainCategory[]>();
  
  categories.forEach(cat => {
    const key = cat.parentId !== null ? cat.parentId : null;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, []);
    }
    categoryMap.get(key)!.push(cat);
  });

  const buildNode = (pid: number | null, depth: number): any[] => {
    if (depth > MAX_TREE_DEPTH) return [];
    
    const children = categoryMap.get(pid) || [];
    return children
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(cat => ({
        ...cat.toJSON(),
        children: buildNode(cat.id, depth + 1),
        hasChildren: categoryMap.has(cat.id) && categoryMap.get(cat.id)!.length > 0
      }));
  };

  return buildNode(parentId, currentDepth);
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { categoryName, categoryCode, categoryType, parentId, description, sortOrder } = req.body;

    const existingCategory = await StrainCategory.findOne({ 
      where: { categoryCode },
      transaction: t
    });
    if (existingCategory) {
      throw new BadRequestError('分类编码已存在');
    }

    if (parentId) {
      const parentCategory = await StrainCategory.findByPk(parentId, { transaction: t });
      if (!parentCategory) {
        throw new NotFoundError('父分类不存在');
      }
    }

    const category = await StrainCategory.create({
      categoryName,
      categoryCode,
      categoryType,
      parentId: parentId || null,
      description,
      sortOrder: sortOrder || 0,
      isActive: true,
      createdBy: req.user?.userId
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'category',
      OperationType.CREATE,
      category.id,
      categoryCode,
      null,
      category.toJSON(),
      '创建菌种分类'
    );

    await t.commit();

    res.json(ResponseUtil.success(category, '分类创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page, 
      pageSize, 
      categoryName, 
      categoryCode, 
      categoryType, 
      isActive,
      parentId
    } = req.query as CategoryFilterParams;

    const where: any = {};
    
    if (categoryName) {
      where.categoryName = { [Op.like]: `%${categoryName}%` };
    }
    if (categoryCode) {
      where.categoryCode = { [Op.like]: `%${categoryCode}%` };
    }
    if (categoryType) {
      where.categoryType = categoryType;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : Number(parentId);
    }

    const allCategories = await StrainCategory.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    let result;
    if (page && pageSize) {
      const startIndex = (Number(page) - 1) * Number(pageSize);
      const paginatedList = allCategories.slice(startIndex, startIndex + Number(pageSize));
      
      result = {
        list: paginatedList,
        total: allCategories.length,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(allCategories.length / Number(pageSize))
      };
    } else {
      const treeData = buildTreeOptimized(allCategories);
      result = {
        list: treeData,
        total: treeData.length
      };
    }

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await StrainCategory.findByPk(id, {
      include: [{ model: StrainCategory, as: 'parent' }]
    });

    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    res.json(ResponseUtil.success(category));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await StrainCategory.findByPk(id, { transaction: t });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    if (updateData.categoryCode && updateData.categoryCode !== category.categoryCode) {
      const existingCategory = await StrainCategory.findOne({ 
        where: { categoryCode: updateData.categoryCode },
        transaction: t
      });
      if (existingCategory) {
        throw new BadRequestError('分类编码已存在');
      }
    }

    if (updateData.parentId === Number(id)) {
      throw new BadRequestError('不能将自己设为父分类');
    }

    const oldValue = category.toJSON();

    await category.update(updateData, { transaction: t });

    await OperationLogService.createLog(
      req,
      'category',
      OperationType.UPDATE,
      category.id,
      category.categoryCode,
      oldValue,
      category.toJSON(),
      '更新分类信息'
    );

    await t.commit();

    res.json(ResponseUtil.success(category, '分类更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await StrainCategory.findByPk(id, { transaction: t });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const oldValue = category.toJSON();
    const newStatus = !category.isActive;

    const deactivateChildren = async (parentId: number, active: boolean) => {
      const children = await StrainCategory.findAll({ 
        where: { parentId },
        transaction: t
      });
      
      for (const child of children) {
        await child.update({ isActive: active }, { transaction: t });
        await deactivateChildren(child.id, active);
      }
    };

    await category.update({ isActive: newStatus }, { transaction: t });
    await deactivateChildren(category.id, newStatus);

    await OperationLogService.createLog(
      req,
      'category',
      OperationType.STATUS_CHANGE,
      category.id,
      category.categoryCode,
      oldValue,
      category.toJSON(),
      `${newStatus ? '启用' : '停用'}分类及所有子分类`
    );

    await t.commit();

    res.json(ResponseUtil.success(category, `分类${newStatus ? '启用' : '停用'}成功`));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await StrainCategory.findByPk(id, { transaction: t });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const childCount = await StrainCategory.count({ 
      where: { parentId: id },
      transaction: t
    });
    if (childCount > 0) {
      throw new BadRequestError('请先删除子分类');
    }

    const oldValue = category.toJSON();

    await category.destroy({ transaction: t });

    await OperationLogService.createLog(
      req,
      'category',
      OperationType.DELETE,
      category.id,
      category.categoryCode,
      oldValue,
      null,
      '删除分类'
    );

    await t.commit();

    res.json(ResponseUtil.success(null, '分类删除成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

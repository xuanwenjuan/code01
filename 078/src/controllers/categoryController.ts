import { Response } from 'express';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import BenefitCategory from '../models/BenefitCategory';
import BenefitProduct from '../models/BenefitProduct';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const getAllChildIds = async (parentId: number): Promise<number[]> => {
  const childIds: number[] = [];
  const children = await BenefitCategory.findAll({
    where: { parentId },
    attributes: ['id']
  });
  
  for (const child of children) {
    childIds.push(child.id);
    const grandChildIds = await getAllChildIds(child.id);
    childIds.push(...grandChildIds);
  }
  
  return childIds;
};

const updateChildrenLevel = async (parentId: number, parentLevel: number): Promise<void> => {
  const children = await BenefitCategory.findAll({
    where: { parentId }
  });
  
  for (const child of children) {
    const newLevel = parentLevel + 1;
    await child.update({ level: newLevel });
    await updateChildrenLevel(child.id, newLevel);
  }
};

const buildTree = (categories: any[], parentId: number | null = null): any[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => {
      const categoryData = cat.toJSON ? cat.toJSON() : cat;
      return {
        ...categoryData,
        children: buildTree(categories, categoryData.id)
      };
    });
};

export const getCategoryTree = async (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  
  const where: any = {};
  if (status !== undefined && status !== '') {
    where.status = status;
  }

  const categories = await BenefitCategory.findAll({
    where,
    order: [['sort', 'ASC'], ['id', 'ASC']]
  });

  const tree = buildTree(categories);

  res.json(ResponseUtil.success(tree));
};

export const getCategoryList = async (req: AuthRequest, res: Response) => {
  const { name, status, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (status !== undefined && status !== '') {
    where.status = status;
  }

  const { count, rows } = await BenefitCategory.findAndCountAll({
    where,
    order: [['sort', 'ASC'], ['id', 'ASC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const category = await BenefitCategory.findByPk(id, {
    include: [{
      model: BenefitCategory,
      as: 'children'
    }]
  });

  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  res.json(ResponseUtil.success(category));
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const { code, parentId } = req.body;

  const existingCategory = await BenefitCategory.findOne({ where: { code } });
  if (existingCategory) {
    throw new AppError('分类编码已存在', 400);
  }

  let level = 1;
  if (parentId) {
    const parentCategory = await BenefitCategory.findByPk(parentId);
    if (!parentCategory) {
      throw new AppError('父分类不存在', 400);
    }
    level = parentCategory.level + 1;
  }

  const category = await BenefitCategory.create({
    ...req.body,
    level
  });

  res.json(ResponseUtil.success(category, '创建成功'));
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { parentId, code } = req.body;

    const category = await BenefitCategory.findByPk(id, { transaction: t });
    if (!category) {
      await t.rollback();
      throw new AppError('分类不存在', 404);
    }

    if (parentId !== undefined && Number(id) === Number(parentId)) {
      await t.rollback();
      throw new AppError('不能将自己设为父分类', 400);
    }

    if (parentId) {
      const allChildIds = await getAllChildIds(Number(id));
      if (allChildIds.includes(Number(parentId))) {
        await t.rollback();
        throw new AppError('不能将父分类设置为自己的子分类', 400);
      }
    }

    if (code) {
      const existingCategory = await BenefitCategory.findOne({
        where: { code, id: { [Op.ne]: id } },
        transaction: t
      });
      if (existingCategory) {
        await t.rollback();
        throw new AppError('分类编码已存在', 400);
      }
    }

    let newLevel = category.level;
    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId) {
        const parentCategory = await BenefitCategory.findByPk(parentId, { transaction: t });
        if (!parentCategory) {
          await t.rollback();
          throw new AppError('父分类不存在', 400);
        }
        newLevel = parentCategory.level + 1;
      } else {
        newLevel = 1;
      }
    }

    await category.update({
      ...req.body,
      level: newLevel
    }, { transaction: t });

    if (parentId !== undefined && parentId !== category.parentId) {
      await updateChildrenLevel(Number(id), newLevel);
    }

    await t.commit();
    
    logger.info(`分类更新成功: ID=${id}, 名称=${category.name}, 新层级=${newLevel}`);
    res.json(ResponseUtil.success(category, '更新成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await BenefitCategory.findByPk(id, { transaction: t });
    if (!category) {
      await t.rollback();
      throw new AppError('分类不存在', 404);
    }

    const allChildIds = await getAllChildIds(Number(id));
    if (allChildIds.length > 0) {
      await t.rollback();
      throw new AppError(`该分类下还有 ${allChildIds.length} 个子分类，请先删除所有子分类`, 400);
    }

    const productCount = await BenefitProduct.count({ 
      where: { categoryId: id },
      transaction: t
    });
    if (productCount > 0) {
      await t.rollback();
      throw new AppError(`该分类下还有 ${productCount} 个商品，不能删除`, 400);
    }

    await category.destroy({ transaction: t });
    await t.commit();

    logger.info(`分类删除成功: ID=${id}, 名称=${category.name}`);
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const toggleStop = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isStop } = req.body;

  const category = await BenefitCategory.findByPk(id);
  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  await category.update({ isStop });

  res.json(ResponseUtil.success(null, isStop ? '已停发' : '已恢复发放'));
};

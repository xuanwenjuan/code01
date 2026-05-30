import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Category from '../models/Category';
import Product from '../models/Product';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';

const createSchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.number().integer().allow(null).optional(),
  icon: Joi.string().optional(),
  sort: Joi.number().integer().default(0),
  status: Joi.number().integer().valid(0, 1).default(1),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  parentId: Joi.number().integer().allow(null).optional(),
  icon: Joi.string().optional(),
  sort: Joi.number().integer().optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
});

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    let level = 1;
    if (value.parentId) {
      const parent = await Category.findByPk(value.parentId);
      if (!parent) {
        throw new AppError('父级分类不存在', 400);
      }
      level = parent.level + 1;
    }

    const category = await Category.create({
      ...value,
      level,
    });

    return ResponseUtil.success(res, category, '创建分类成功');
  } catch (error) {
    next(error);
  }
};

const getAllCategoryIds = async (parentId: number | null): Promise<number[]> => {
  const categories = await Category.findAll({
    where: { parentId },
    attributes: ['id'],
  });

  let ids: number[] = [];
  for (const category of categories) {
    ids.push(category.id);
    const childIds = await getAllCategoryIds(category.id);
    ids = ids.concat(childIds);
  }
  return ids;
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const whereCondition: any = {};
    if (status !== undefined) {
      whereCondition.status = Number(status);
    }

    const allCategories = await Category.findAll({
      where: whereCondition,
      order: [['sort', 'ASC'], ['id', 'DESC']],
    });

    const buildTree = (parentId: number | null): any[] => {
      return allCategories
        .filter((cat) => cat.parentId === parentId)
        .map((category) => {
          const children = buildTree(category.id);
          return {
            ...category.toJSON(),
            children: children.length > 0 ? children : undefined,
          };
        });
    };

    const tree = buildTree(null);

    return ResponseUtil.success(res, tree, '获取分类树成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    return ResponseUtil.success(res, category, '获取分类成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { error, value } = updateSchema.validate(req.body);

    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const category = await Category.findByPk(id, { transaction });
    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    if (value.parentId && value.parentId !== category.parentId) {
      if (value.parentId === Number(id)) {
        throw new AppError('不能将自己设为父级分类', 400);
      }

      const parent = await Category.findByPk(value.parentId, { transaction });
      if (!parent) {
        throw new AppError('父级分类不存在', 400);
      }
      if (parent.status !== 1) {
        throw new AppError('不能将分类移动到已下架的父级分类下', 400);
      }
      value.level = parent.level + 1;
    }

    if (value.status === 0 && category.status === 1) {
      const allChildIds = await getAllCategoryIds(Number(id));
      const allCategoryIds = [Number(id), ...allChildIds];

      await Category.update(
        { status: 0 },
        { where: { id: { [Op.in]: allCategoryIds } }, transaction }
      );

      await Product.update(
        { status: 0 },
        { where: { categoryId: { [Op.in]: allCategoryIds } }, transaction }
      );
    }

    await category.update(value, { transaction });

    await transaction.commit();

    return ResponseUtil.success(res, category, '更新分类成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('分类不存在', 404);
    }

    const childCount = await Category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new AppError('该分类下存在子分类，无法删除', 400);
    }

    await category.destroy();

    return ResponseUtil.success(res, null, '删除分类成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;

    const whereCondition: any = {};
    if (keyword) {
      whereCondition.name = {
        [Op.like]: `%${keyword}%`,
      };
    }
    if (status !== undefined) {
      whereCondition.status = Number(status);
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereCondition,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sort', 'ASC'], ['id', 'DESC']],
    });

    return ResponseUtil.success(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '获取分类列表成功'
    );
  } catch (error) {
    next(error);
  }
};

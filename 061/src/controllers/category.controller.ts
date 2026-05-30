import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import TreatmentCategory from '../models/TreatmentCategory';
import TreatmentItem from '../models/TreatmentItem';
import { success, paginatedSuccess, ApiError } from '../utils/response';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '分类名称不能为空',
  }),
  code: Joi.string().required().messages({
    'any.required': '分类编码不能为空',
  }),
  parentId: Joi.number().allow(null),
  description: Joi.string().allow(null, ''),
  sort: Joi.number().default(0),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string(),
  code: Joi.string(),
  parentId: Joi.number().allow(null),
  description: Joi.string().allow(null, ''),
  sort: Joi.number(),
  status: Joi.string().valid('active', 'inactive'),
});

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, parentId, description, sort } = req.body;

    const existing = await TreatmentCategory.findOne({ where: { code } });
    if (existing) {
      throw new ApiError('分类编码已存在', 400);
    }

    if (parentId) {
      const parent = await TreatmentCategory.findByPk(parentId);
      if (!parent) {
        throw new ApiError('父分类不存在', 400);
      }
    }

    const category = await TreatmentCategory.create({
      name,
      code,
      parentId,
      description,
      sort: sort || 0,
      status: 'active',
    });

    success(res, category, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const category = await TreatmentCategory.findByPk(id);
    if (!category) {
      throw new ApiError('分类不存在', 404);
    }

    if (data.code && data.code !== category.code) {
      const existing = await TreatmentCategory.findOne({ where: { code: data.code } });
      if (existing) {
        throw new ApiError('分类编码已存在', 400);
      }
    }

    if (data.parentId && data.parentId === Number(id)) {
      throw new ApiError('不能将自己设为父分类', 400);
    }

    await category.update(data);
    success(res, category, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await TreatmentCategory.findByPk(id);
    if (!category) {
      throw new ApiError('分类不存在', 404);
    }

    const hasChildren = await TreatmentCategory.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw new ApiError('该分类下存在子分类，无法删除', 400);
    }

    const hasItems = await TreatmentItem.count({ where: { categoryId: id } });
    if (hasItems > 0) {
      throw new ApiError('该分类下存在诊疗项目，无法删除', 400);
    }

    await category.destroy();
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const category = await TreatmentCategory.findByPk(id);
    if (!category) {
      throw new ApiError('分类不存在', 404);
    }

    if (status === 'inactive') {
      const activeItems = await TreatmentItem.count({
        where: {
          categoryId: id,
          status: 'active'
        }
      });
      
      if (activeItems > 0) {
        throw new ApiError('该分类下存在启用中的诊疗项目，无法停诊', 400);
      }

      const hasChildren = await TreatmentCategory.count({
        where: {
          parentId: id,
          status: 'active'
        }
      });
      
      if (hasChildren > 0) {
        throw new ApiError('该分类下存在启用中的子分类，无法停诊', 400);
      }
    }

    await category.update({ status });
    success(res, category, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await TreatmentCategory.findByPk(id, {
      include: [
        { model: TreatmentCategory, as: 'parent' },
        { model: TreatmentCategory, as: 'children' },
      ],
    });

    if (!category) {
      throw new ApiError('分类不存在', 404);
    }

    success(res, category);
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, parentId } = req.query;

    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (parentId !== undefined) {
      where.parentId = parentId === '' ? null : parentId;
    }

    const { count, rows } = await TreatmentCategory.findAndCountAll({
      where,
      include: [
        { model: TreatmentCategory, as: 'parent' },
      ],
      order: [['sort', 'ASC'], ['id', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'active', includeItems = 'false' } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const include: any[] = [];
    if (includeItems === 'true') {
      include.push({
        model: TreatmentItem,
        as: 'items',
        attributes: ['id', 'name', 'code', 'price', 'status'],
        where: status ? { status } : undefined,
        required: false,
      });
    }

    const allCategories = await TreatmentCategory.findAll({
      where,
      include,
      order: [['sort', 'ASC'], ['id', 'DESC']],
    });

    const categoryMap = new Map<number | null, any[]>();
    allCategories.forEach(cat => {
      const parentId = cat.parentId ?? null;
      if (!categoryMap.has(parentId)) {
        categoryMap.set(parentId, []);
      }
      categoryMap.get(parentId)!.push(cat);
    });

    const buildTree = (parentId: number | null): any[] => {
      const children = categoryMap.get(parentId) || [];
      return children.map(cat => ({
        ...cat.toJSON(),
        children: buildTree(cat.id),
        hasChildren: (categoryMap.get(cat.id) || []).length > 0,
      }));
    };

    const tree = buildTree(null);
    success(res, tree);
  } catch (error) {
    next(error);
  }
};

export const getCategoryWithChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await TreatmentCategory.findByPk(id, {
      include: [
        {
          model: TreatmentCategory,
          as: 'children',
          include: [{
            model: TreatmentCategory,
            as: 'children',
          }],
        },
        {
          model: TreatmentItem,
          as: 'items',
        },
      ],
    });

    if (!category) {
      throw new ApiError('分类不存在', 404);
    }

    success(res, category);
  } catch (error) {
    next(error);
  }
};

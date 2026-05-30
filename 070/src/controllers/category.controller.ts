import { Response } from 'express';
import { ApiResponse } from '../utils/response';
import { Category, User, Influencer } from '../models';
import { AuthRequest } from '../middleware/auth';
import { CategoryStatus } from '../utils/constants';
import Joi from 'joi';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.number().integer().allow(null),
  sortOrder: Joi.number().integer().default(0),
  description: Joi.string().allow(''),
  icon: Joi.string().allow(''),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string(),
  parentId: Joi.number().integer().allow(null),
  sortOrder: Joi.number().integer(),
  status: Joi.string().valid(...Object.values(CategoryStatus)),
  description: Joi.string().allow(''),
  icon: Joi.string().allow(''),
});

const buildCategoryTree = (categories: Category[], parentId: number | null = null): any[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => {
      const children = buildCategoryTree(categories, cat.id);
      return {
        ...cat.toJSON(),
        children,
        hasChildren: children.length > 0,
      };
    });
};

const getAllCategoryIds = async (categoryId: number): Promise<number[]> => {
  const result: number[] = [categoryId];
  const children = await Category.findAll({
    where: { parentId: categoryId },
    attributes: ['id'],
  });
  
  for (const child of children) {
    const childIds = await getAllCategoryIds(child.id);
    result.push(...childIds);
  }
  
  return result;
};

export const getCategoryTree = async (req: AuthRequest, res: Response) => {
  try {
    const { status, includeDisabled } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    let categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });

    if (includeDisabled !== 'true') {
      const activeIds = new Set<number>();
      const categoriesMap = new Map(categories.map(c => [c.id, c]));

      const collectActiveIds = (cat: Category): boolean => {
        if (cat.status !== CategoryStatus.ACTIVE) {
          return false;
        }
        
        const children = categories.filter(c => c.parentId === cat.id);
        const hasActiveChildren = children.length > 0 
          ? children.some(child => collectActiveIds(child)) 
          : true;
        
        if (hasActiveChildren) {
          activeIds.add(cat.id);
        }
        return hasActiveChildren;
      };

      categories.filter(c => !c.parentId).forEach(c => collectActiveIds(c));
      categories = categories.filter(c => activeIds.has(c.id));
    }

    const tree = buildCategoryTree(categories);

    return ApiResponse.success(res, tree);
  } catch (error) {
    return ApiResponse.error(res, '获取分类树失败');
  }
};

export const getCategoryList = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
      ],
    });

    return ApiResponse.paginated(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    return ApiResponse.error(res, '获取分类列表失败');
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children' },
      ],
    });

    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    return ApiResponse.success(res, category);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '获取分类失败');
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId, sortOrder, description, icon } = req.body;

    let level = 1;
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        throw new BadRequestError('父分类不存在');
      }
      level = parent.level + 1;
    }

    const category = await Category.create({
      name,
      parentId,
      level,
      sortOrder: sortOrder || 0,
      status: CategoryStatus.ACTIVE,
      description,
      icon,
    });

    return ApiResponse.created(res, category, '分类创建成功');
  } catch (error) {
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '创建分类失败');
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId, sortOrder, status, description, icon } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    let level = category.level;
    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId === null) {
        level = 1;
      } else {
        const parent = await Category.findByPk(parentId);
        if (!parent) {
          throw new BadRequestError('父分类不存在');
        }
        level = parent.level + 1;
      }
    }

    await category.update({
      name,
      parentId,
      level,
      sortOrder,
      status,
      description,
      icon,
    });

    return ApiResponse.success(res, category, '分类更新成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '更新分类失败');
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const childCount = await Category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestError('请先删除子分类');
    }

    await category.destroy();

    return ApiResponse.success(res, null, '分类删除成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '删除分类失败');
  }
};

export const pauseCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const allCategoryIds = await getAllCategoryIds(id);
    
    const influencers = await Influencer.findAll();
    const boundInfluencers: string[] = [];
    
    for (const influencer of influencers) {
      if (influencer.categoryIds && Array.isArray(influencer.categoryIds)) {
        const hasCategory = allCategoryIds.some(cid => influencer.categoryIds.includes(cid));
        if (hasCategory) {
          const user = await User.findByPk(influencer.userId, { attributes: ['username'] });
          if (user) {
            boundInfluencers.push(user.username);
          }
        }
      }
    }

    if (boundInfluencers.length > 0) {
      throw new BadRequestError(`该分类下仍有 ${boundInfluencers.length} 位达人绑定，请先解绑达人：${boundInfluencers.join(', ')}`);
    }

    await category.update({ status: CategoryStatus.PAUSED });

    return ApiResponse.success(res, null, '分类已暂停招商');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '暂停分类失败');
  }
};

export const activateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    if (category.parentId) {
      const parent = await Category.findByPk(category.parentId);
      if (parent && parent.status !== CategoryStatus.ACTIVE) {
        throw new BadRequestError('父分类未激活，无法激活子分类');
      }
    }

    await category.update({ status: CategoryStatus.ACTIVE });

    return ApiResponse.success(res, null, '分类已启用招商');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '启用分类失败');
  }
};

import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import Joi from 'joi';
import { Op, fn, col, literal } from 'sequelize';
import { UserRole } from '../types/common';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': '分类名称不能为空',
    'string.max': '分类名称不能超过100个字符'
  }),
  description: Joi.string().allow('').max(500).messages({
    'string.max': '描述不能超过500个字符'
  }),
  parentId: Joi.number().integer().min(0).default(0).messages({
    'number.min': '父级分类ID不能为负数',
    'number.integer': '父级分类ID必须是整数'
  }),
  sort: Joi.number().integer().min(0).default(0).messages({
    'number.min': '排序值不能为负数',
    'number.integer': '排序值必须是整数'
  }),
  image: Joi.string().allow('').max(500).messages({
    'string.max': '图片地址不能超过500个字符'
  })
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().max(100).messages({
    'string.max': '分类名称不能超过100个字符'
  }),
  description: Joi.string().allow('').max(500).messages({
    'string.max': '描述不能超过500个字符'
  }),
  parentId: Joi.number().integer().min(0).messages({
    'number.min': '父级分类ID不能为负数',
    'number.integer': '父级分类ID必须是整数'
  }),
  sort: Joi.number().integer().min(0).messages({
    'number.min': '排序值不能为负数',
    'number.integer': '排序值必须是整数'
  }),
  image: Joi.string().allow('').max(500).messages({
    'string.max': '图片地址不能超过500个字符'
  }),
  isActive: Joi.boolean()
});

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  productCount?: number;
}

const buildCategoryTree = (
  categories: Category[],
  parentId: number = 0,
  onlyActive: boolean = false
): CategoryWithChildren[] => {
  return categories
    .filter(cat => {
      if (cat.parentId !== parentId) return false;
      if (onlyActive && !cat.isActive) return false;
      return true;
    })
    .sort((a, b) => a.sort - b.sort)
    .map(cat => {
      const children = buildCategoryTree(categories, cat.id, onlyActive);
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        parentId: cat.parentId,
        sort: cat.sort,
        image: cat.image,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        children,
        hasChildren: children.length > 0
      };
    });
};

const getAllChildIds = (categories: Category[], parentId: number): number[] => {
  let childIds: number[] = [];
  const children = categories.filter(cat => cat.parentId === parentId);
  for (const child of children) {
    childIds.push(child.id);
    childIds = [...childIds, ...getAllChildIds(categories, child.id)];
  }
  return childIds;
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以创建分类');
    }

    const { name, description, parentId, sort, image } = req.body;

    if (parentId && parentId > 0) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        throw new BadRequestException('父级分类不存在');
      }
      if (!parentCategory.isActive) {
        throw new BadRequestException('父级分类已停用，无法在其下创建子分类');
      }
    }

    const existingCategory = await Category.findOne({
      where: { name, parentId: parentId || 0 }
    });
    if (existingCategory) {
      throw new BadRequestException('同级分类下已存在相同名称的分类');
    }

    const category = await Category.create({
      name,
      description,
      parentId: parentId || 0,
      sort: sort || 0,
      image
    });

    res.status(201).json(ResponseUtil.created(category, '分类创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { onlyActive } = req.query;
    const isOnlyActive = onlyActive === 'true';

    const categories = await Category.findAll({
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    });

    const tree = buildCategoryTree(categories, 0, isOnlyActive);
    res.json(ResponseUtil.success(tree));
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, keyword, page = 1, pageSize = 20 } = req.query;
    
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    });

    const categoriesWithCount = await Promise.all(
      rows.map(async (cat) => {
        const productCount = await Product.count({ where: { categoryId: cat.id, isActive: true } });
        return {
          ...cat.toJSON(),
          productCount
        };
      })
    );

    res.json(ResponseUtil.success({
      list: categoriesWithCount,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const productCount = await Product.count({ where: { categoryId: category.id, isActive: true } });
    const childCount = await Category.count({ where: { parentId: category.id } });

    res.json(ResponseUtil.success({
      ...category.toJSON(),
      productCount,
      childCount
    }));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以更新分类');
    }

    const { id } = req.params;
    const { parentId, name, isActive } = req.body;
    const category = await Category.findByPk(id);

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (parentId !== undefined) {
      if (parentId === parseInt(id)) {
        throw new BadRequestException('不能将自己设为父级分类');
      }
      if (parentId > 0) {
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
          throw new BadRequestException('父级分类不存在');
        }
      }

      const allCategories = await Category.findAll();
      const childIds = getAllChildIds(allCategories, category.id);
      if (childIds.includes(parentId)) {
        throw new BadRequestException('不能将子分类设为父级分类，避免循环引用');
      }
    }

    if (name !== undefined && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          parentId: parentId !== undefined ? parentId : category.parentId,
          id: { [Op.ne]: category.id }
        }
      });
      if (existingCategory) {
        throw new BadRequestException('同级分类下已存在相同名称的分类');
      }
    }

    if (isActive === false && category.isActive) {
      const productCount = await Product.count({
        where: { categoryId: category.id, isActive: true }
      });
      if (productCount > 0) {
        throw new BadRequestException(`该分类下仍有 ${productCount} 个启用商品，无法淘汰停用`);
      }

      const allCategories = await Category.findAll();
      const childIds = getAllChildIds(allCategories, category.id);
      if (childIds.length > 0) {
        const hasActiveChild = await Category.count({
          where: { id: { [Op.in]: childIds }, isActive: true }
        });
        if (hasActiveChild > 0) {
          throw new BadRequestException('该分类下仍有启用的子分类，无法淘汰停用');
        }
      }
    }

    await category.update(req.body);
    res.json(ResponseUtil.success(category, '分类更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除分类');
    }

    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const childCount = await Category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException(`该分类下有 ${childCount} 个子分类，无法删除`);
    }

    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new BadRequestException(`该分类下有 ${productCount} 个商品，无法删除`);
    }

    await category.destroy();
    res.json(ResponseUtil.success(null, '分类删除成功'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const allCategories = await Category.findAll();
    
    const path: Category[] = [];
    let currentId = parseInt(id);

    while (currentId > 0) {
      const category = allCategories.find(cat => cat.id === currentId);
      if (!category) break;
      path.unshift(category);
      currentId = category.parentId;
    }

    res.json(ResponseUtil.success(path));
  } catch (error) {
    next(error);
  }
};

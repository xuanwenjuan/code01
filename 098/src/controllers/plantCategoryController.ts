import { Request, Response, NextFunction } from 'express';
import { PlantCategory } from '../models';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import Joi from 'joi';
import { PlantCategoryType, UserRole } from '../types';
import { Op } from 'sequelize';

const plantCategorySchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(50).messages({
    'string.empty': '分类名称不能为空',
    'string.min': '分类名称至少1个字符',
    'string.max': '分类名称最多50个字符',
    'any.required': '分类名称是必填项'
  }),
  type: Joi.string().valid(...Object.values(PlantCategoryType)).required().messages({
    'any.only': `类型必须是 ${Object.values(PlantCategoryType).join(', ')} 中的一个',
    'any.required': '类型是必填项'
  }),
  description: Joi.string().allow('').max(500).optional().messages({
    'string.max': '描述最多500个字符'
  }),
  parentId: Joi.number().integer().min(1).optional().messages({
    'number.base': '父分类ID必须是正整数'
  }),
  sortOrder: Joi.number().integer().min(0).default(0).messages({
    'number.base': '排序值必须是非负整数'
  })
});

const buildTreeRecursive = (categories: any[], parentId: number | null = null): any[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(cat => {
      const children = buildTreeRecursive(categories, cat.id);
      return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        description: cat.description,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        children,
        childCount: children.length
      };
    });
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, tree, includeInactive } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const categories = await PlantCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    if (tree === 'true') {
      const treeData = buildTreeRecursive(categories);
      ResponseUtil.success(res, treeData);
    } else {
      ResponseUtil.success(res, categories);
    }
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await PlantCategory.findByPk(id);

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const allCategories = await PlantCategory.findAll({
      where: { isActive: true }
    });
    const children = buildTreeRecursive(allCategories, Number(id));

    ResponseUtil.success(res, {
      ...category.toJSON(),
      children
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = plantCategorySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(d => d.message);
      throw new BadRequestException(errors.join('; '));
    }

    if (value.parentId) {
      const parent = await PlantCategory.findByPk(value.parentId);
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      if (!parent.isActive) {
        throw new BadRequestException('父分类已停用，无法在其下创建子分类');
      }
    }

    const existing = await PlantCategory.findOne({
      where: { name: value.name, type: value.type }
    });
    if (existing) {
      throw new BadRequestException('同名分类已存在');
    }

    const category = await PlantCategory.create(value);
    ResponseUtil.success(res, category, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error, value } = plantCategorySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(d => d.message);
      throw new BadRequestException(errors.join('; '));
    }

    const category = await PlantCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (value.parentId) {
      if (value.parentId === Number(id)) {
        throw new BadRequestException('不能将自己设为父分类');
      }
      const parent = await PlantCategory.findByPk(value.parentId);
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      if (!parent.isActive) {
        throw new BadRequestException('父分类已停用');
      }
    }

    if (value.name !== category.name) {
      const existing = await PlantCategory.findOne({
        where: { name: value.name, type: value.type || category.type }
      });
      if (existing && existing.id !== Number(id)) {
        throw new BadRequestException('同名分类已存在');
      }
    }

    await category.update(value);
    ResponseUtil.success(res, category, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await PlantCategory.findByPk(id);

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const childCount = await PlantCategory.count({
      where: { parentId: id, isActive: true }
    });
    if (childCount > 0) {
      throw new BadRequestException(`该分类下有${childCount}个活跃子分类，无法删除');
    }

    const { Plant } = await import('../models');
    const plantCount = await Plant.count({
      where: { categoryId: id, isActive: true }
    });
    if (plantCount > 0) {
      throw new BadRequestException(`该分类下有${plantCount}株绿植档案，无法删除');
    }

    await category.update({ isActive: false });
    ResponseUtil.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('状态值必须是布尔类型');
    }

    const category = await PlantCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (!isActive) {
      const childCount = await PlantCategory.count({
        where: { parentId: id, isActive: true }
      });
      if (childCount > 0) {
        throw new BadRequestException(`该分类下有${childCount}个活跃子分类，请先处理子分类');
      }

      const { Plant } = await import('../models');
      const plantCount = await Plant.count({
        where: { categoryId: id, isActive: true }
      });
      if (plantCount > 0) {
        throw new BadRequestException(`该分类下有${plantCount}株绿植档案，请先处理绿植');
      }
    }

    await category.update({ isActive });
    ResponseUtil.success(res, category, isActive ? '已启用' : '已停用');
  } catch (error) {
    next(error);
  }
};

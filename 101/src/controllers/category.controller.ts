import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import Category from '../models/Category.model';
import Pigeon from '../models/Pigeon.model';
import { CategoryStatus, CATEGORY_STATUS_LABELS } from '../constants/enum';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/base.exception';
import sequelize from '../config/database';
import logger from '../utils/logger';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.empty': '品类名称不能为空',
    'string.max': '品类名称不能超过100个字符',
    'any.required': '品类名称是必填项'
  }),
  code: Joi.string().required().max(50).pattern(/^[A-Za-z0-9_-]+$/).messages({
    'string.empty': '品类编码不能为空',
    'string.max': '品类编码不能超过50个字符',
    'string.pattern.base': '品类编码只能包含字母、数字、下划线和横杠',
    'any.required': '品类编码是必填项'
  }),
  parentId: Joi.number().integer().optional().allow(null),
  sort: Joi.number().integer().min(0).default(0).messages({
    'number.min': '排序值不能小于0'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': '描述不能超过500个字符'
  })
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().max(100).optional(),
  code: Joi.string().max(50).pattern(/^[A-Za-z0-9_-]+$/).optional(),
  parentId: Joi.number().integer().optional().allow(null),
  sort: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid(...Object.values(CategoryStatus)).optional(),
  description: Joi.string().max(500).optional()
});

const buildTreeRecursive = (
  categories: any[],
  parentId: number | null = null,
  level: number = 0
): any[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.sort - b.sort || a.id - b.id)
    .map(cat => ({
      ...cat.toJSON(),
      level,
      statusLabel: CATEGORY_STATUS_LABELS[cat.status as CategoryStatus],
      children: buildTreeRecursive(categories, cat.id, level + 1)
    }));
};

const checkCategoryCircular = async (
  categoryId: number,
  newParentId: number | null
): Promise<boolean> => {
  if (!newParentId) return false;
  
  let currentId: number | null = newParentId;
  const visited = new Set<number>();
  
  while (currentId) {
    if (currentId === categoryId) return true;
    if (visited.has(currentId)) return true;
    
    visited.add(currentId);
    const parent = await Category.findByPk(currentId, { attributes: ['parentId'] });
    currentId = parent?.parentId || null;
  }
  
  return false;
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { name, code, parentId, sort, description } = req.body;

    const existingCode = await Category.findOne({ 
      where: { code },
      transaction
    });
    if (existingCode) {
      throw new BadRequestException('品类编码已存在');
    }

    if (parentId) {
      const parent = await Category.findByPk(parentId, { transaction });
      if (!parent) {
        throw new BadRequestException('父品类不存在');
      }
      if (parent.status === CategoryStatus.INACTIVE) {
        throw new BadRequestException('父品类已下架，不能在其下创建子品类');
      }
    }

    const category = await Category.create({
      name,
      code,
      parentId: parentId || null,
      level: parentId ? 2 : 1,
      sort: sort || 0,
      status: CategoryStatus.ACTIVE,
      description
    }, { transaction });

    if (parentId) {
      let level = 2;
      let pid: number | null = parentId;
      while (pid) {
        const parent = await Category.findByPk(pid, { transaction });
        if (parent) {
          level = parent.level + 1;
          pid = parent.parentId;
        } else {
          break;
        }
      }
      await category.update({ level }, { transaction });
    }

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]创建品类: ${code} - ${name}`);
    
    res.json(ResponseUtil.success(category, '创建成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, keyword } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const categories = await Category.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const tree = buildTreeRecursive(categories);

    res.json(ResponseUtil.success(tree));
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      status, 
      parentId,
      keyword 
    } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (parentId !== undefined) where.parentId = parentId || null;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sort', 'ASC'], ['id', 'DESC']]
    });

    res.json(ResponseUtil.success({
      list: rows,
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
      throw new NotFoundException('品类不存在');
    }

    const pigeonCount = await Pigeon.count({ where: { categoryId: id } });
    const childCount = await Category.count({ where: { parentId: id } });

    res.json(ResponseUtil.success({
      ...category.toJSON(),
      pigeonCount,
      childCount,
      statusLabel: CATEGORY_STATUS_LABELS[category.status]
    }));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { name, code, parentId, sort, status, description } = req.body;

    const category = await Category.findByPk(id, { transaction });
    if (!category) {
      throw new NotFoundException('品类不存在');
    }

    if (code && code !== category.code) {
      const existingCode = await Category.findOne({ 
        where: { code },
        transaction
      });
      if (existingCode) {
        throw new BadRequestException('品类编码已存在');
      }
    }

    if (parentId !== undefined && parentId !== category.parentId) {
      const hasCircular = await checkCategoryCircular(category.id, parentId);
      if (hasCircular) {
        throw new BadRequestException('不能将父品类设置为自己或子品类');
      }

      if (parentId) {
        const parent = await Category.findByPk(parentId, { transaction });
        if (!parent) {
          throw new BadRequestException('父品类不存在');
        }
        if (parent.status === CategoryStatus.INACTIVE) {
          throw new BadRequestException('父品类已下架，不能移动到该父品类下');
        }
      }
    }

    await category.update({
      name,
      code,
      parentId,
      sort,
      status,
      description
    }, { transaction });

    if (parentId !== undefined) {
      let level = 1;
      let pid: number | null = parentId;
      while (pid) {
        const parent = await Category.findByPk(pid, { transaction });
        if (parent) {
          level = parent.level + 1;
          pid = parent.parentId;
        } else {
          break;
        }
      }
      await category.update({ level }, { transaction });

      const updateChildrenLevel = async (parentId: number, baseLevel: number) => {
        const children = await Category.findAll({ 
          where: { parentId },
          transaction
        });
        for (const child of children) {
          await child.update({ level: baseLevel + 1 }, { transaction });
          await updateChildrenLevel(child.id, baseLevel + 1);
        }
      };
      await updateChildrenLevel(category.id, level);
    }

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]更新品类: ${category.code}`);
    
    res.json(ResponseUtil.success(category, '更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, { transaction });
    if (!category) {
      throw new NotFoundException('品类不存在');
    }

    if (category.status === CategoryStatus.INACTIVE) {
      const childCount = await Category.count({ 
        where: { parentId: id, status: CategoryStatus.INACTIVE },
        transaction
      });
      if (childCount > 0) {
        throw new BadRequestException('存在未启用的子品类，请先启用所有子品类');
      }
    }

    const newStatus = category.status === CategoryStatus.ACTIVE 
      ? CategoryStatus.INACTIVE 
      : CategoryStatus.ACTIVE;

    await category.update({ status: newStatus }, { transaction });

    if (newStatus === CategoryStatus.INACTIVE) {
      const updateChildrenStatus = async (parentId: number) => {
        const children = await Category.findAll({ 
          where: { parentId, status: CategoryStatus.ACTIVE },
          transaction
        });
        for (const child of children) {
          await child.update({ status: CategoryStatus.INACTIVE }, { transaction });
          await updateChildrenStatus(child.id);
        }
      };
      await updateChildrenStatus(category.id);
    }

    await transaction.commit();
    
    const action = newStatus === CategoryStatus.ACTIVE ? '启用' : '下架';
    logger.info(`用户[${req.user?.username}]${action}品类: ${category.code}`);
    
    res.json(ResponseUtil.success(null, `${action}成功`));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, { transaction });
    if (!category) {
      throw new NotFoundException('品类不存在');
    }

    const childCount = await Category.count({ 
      where: { parentId: id },
      transaction
    });
    if (childCount > 0) {
      throw new BadRequestException('该品类下有子品类，无法删除');
    }

    const pigeonCount = await Pigeon.count({ 
      where: { categoryId: id },
      transaction
    });
    if (pigeonCount > 0) {
      throw new BadRequestException('该品类下有赛鸽档案，无法删除');
    }

    await category.destroy({ transaction });
    await transaction.commit();
    
    logger.info(`用户[${req.user?.username}]删除品类: ${category.code}`);
    
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getActiveCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.findAll({
      where: { status: CategoryStatus.ACTIVE },
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const tree = buildTreeRecursive(categories);

    res.json(ResponseUtil.success(tree));
  } catch (error) {
    next(error);
  }
};

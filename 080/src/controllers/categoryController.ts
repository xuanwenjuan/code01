import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import Category from '../models/Category';
import { ApiResponse } from '../utils/response';
import { validateRequest } from '../middlewares/validateRequest';
import { AppError, NotFoundError } from '../exceptions/AppError';
import { UserRole } from '../models';

const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.number().integer().optional(),
  sortOrder: Joi.number().integer().default(0),
  icon: Joi.string().optional(),
  commissionRate: Joi.number().min(0).max(100).default(0),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  parentId: Joi.number().integer().optional(),
  sortOrder: Joi.number().integer().optional(),
  icon: Joi.string().optional(),
  commissionRate: Joi.number().min(0).max(100).optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

export const createCategory = [
  validateRequest(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, parentId, sortOrder, icon, commissionRate } = req.body;
      
      let level = 1;
      if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) {
          throw new NotFoundError('父级分类不存在');
        }
        if (parent.isDeleted) {
          throw new AppError('父级分类已被删除', 400);
        }
        level = parent.level + 1;
      }
      
      const category = await Category.create({
        name,
        parentId: parentId || null,
        level,
        sortOrder,
        icon,
        commissionRate,
        status: 'active',
        isDeleted: false,
      });
      
      ApiResponse.success(res, category, '创建成功', 201);
    } catch (error) {
      next(error);
    }
  },
];

export const updateCategory = [
  validateRequest(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await Category.findByPk(id);
      if (!category || category.isDeleted) {
        throw new NotFoundError('分类不存在');
      }
      
      if (updateData.parentId && updateData.parentId !== category.parentId) {
        const parent = await Category.findByPk(updateData.parentId);
        if (!parent || parent.isDeleted) {
          throw new NotFoundError('父级分类不存在');
        }
        updateData.level = parent.level + 1;
      }
      
      await category.update(updateData);
      
      ApiResponse.success(res, category, '更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id);
    if (!category || category.isDeleted) {
      throw new NotFoundError('分类不存在');
    }
    
    const hasChildren = await Category.count({
      where: { parentId: id, isDeleted: false },
    });
    if (hasChildren > 0) {
      throw new AppError('该分类下存在子分类，无法删除', 400);
    }
    
    await category.update({ isDeleted: true, status: 'inactive' });
    
    ApiResponse.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'active' } = req.query;
    const whereCondition: any = { isDeleted: false };
    if (status) {
      whereCondition.status = status;
    }
    
    const categories = await Category.findAll({
      where: whereCondition,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
    
    const buildTree = (parentId: number | null): any[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          level: cat.level,
          sortOrder: cat.sortOrder,
          icon: cat.icon,
          commissionRate: cat.commissionRate,
          status: cat.status,
          children: buildTree(cat.id),
        }));
    };
    
    const tree = buildTree(null);
    
    ApiResponse.success(res, tree);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    if (!category || category.isDeleted) {
      throw new NotFoundError('分类不存在');
    }
    
    ApiResponse.success(res, category);
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query;
    
    const whereCondition: any = { isDeleted: false };
    if (status) {
      whereCondition.status = status;
    }
    if (keyword) {
      whereCondition.name = { [Op.like]: `%${keyword}%` };
    }
    
    const { count, rows } = await Category.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

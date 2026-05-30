import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import Category from '../models/Category';
import Product from '../models/Product';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { CategoryStatus } from '../types';
import sequelize from '../database';

export const categoryController = {
  async getTree(req: Request, res: Response) {
    const categories = await Category.findAll({
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });
    
    const buildTree = (parentId: number | null): any[] => {
      return categories
        .filter(c => c.parentId === parentId)
        .map(c => ({
          ...c.toJSON(),
          children: buildTree(c.id)
        }));
    };

    return ResponseUtil.success(res, buildTree(null));
  },

  async getList(req: Request, res: Response) {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const where: any = {};
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      include: [{ model: Category, as: 'parent' }],
      order: [['sort', 'ASC'], ['id', 'ASC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    return ResponseUtil.success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{ model: Category, as: 'parent' }]
    });
    
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    return ResponseUtil.success(res, category);
  },

  async create(req: Request, res: Response) {
    const { name, code, parentId, sort, description } = req.body;

    const exists = await Category.findOne({ where: { code } });
    if (exists) {
      throw new AppError('类目编码已存在', 400);
    }

    let level = 1;
    let path = '';
    
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        throw new AppError('父类目不存在', 400);
      }
      level = parent.level + 1;
      path = parent.path ? `${parent.path},${parentId}` : String(parentId);
    }

    const category = await Category.create({
        name,
        code,
        parentId,
        level,
        path,
        sort: sort || 0,
        status: CategoryStatus.ACTIVE,
        description
      });

    return ResponseUtil.success(res, category, '创建成功');
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, code, parentId, sort, status, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    if (code && code !== category.code) {
      const exists = await Category.findOne({ where: { code, id: { [Op.ne]: id } });
      if (exists) {
        throw new AppError('类目编码已存在', 400);
      }
    }

    if (parentId !== undefined) {
      if (parentId === Number(id)) {
        throw new AppError('不能将自己设为父类目', 400);
      }
      
      if (parentId) {
        const checkClosure = async (checkId: number): Promise<boolean> => {
          const child = await Category.findByPk(checkId);
          if (!child) return false;
          if (child.parentId === Number(id)) return true;
          if (child.parentId) return checkClosure(child.parentId);
          return false;
        };
        
        if (await checkClosure(parentId)) {
          throw new AppError('检测到闭环嵌套，不允许将子类目设为父类目', 400);
        }

        const parent = await Category.findByPk(parentId);
        if (!parent) {
          throw new AppError('父类目不存在', 400);
        }

        category.level = parent.level + 1;
        category.path = parent.path ? `${parent.path},${parentId}` : String(parentId);
      } else {
        category.level = 1;
        category.path = '';
      }
      category.parentId = parentId || null;
    }

    if (name) category.name = name;
    if (code) category.code = code;
    if (sort !== undefined) category.sort = sort;
    if (status) category.status = status;
    if (description !== undefined) category.description = description;

    await category.save();

    return ResponseUtil.success(res, category, '更新成功');
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    const childCount = await Category.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new AppError('该类目下还有子类目，无法删除', 400);
    }

    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new AppError('该类目下还有商品，无法删除', 400);
    }

    await category.destroy();

    return ResponseUtil.success(res, null, '删除成功');
  },

  async archive(req: Request, res: Response) {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('类目不存在', 404);
    }

    const childCount = await Category.count({
      where: { parentId: id, status: { [Op.ne]: CategoryStatus.ARCHIVED } }
    });
    if (childCount > 0) {
      throw new AppError('该类目下还有启用的子类目，请先归档子类目', 400);
    }

    const productCount = await Product.count({ where: { categoryId: id, status: true } });
    if (productCount > 0) {
      throw new AppError('该类目下还有启用的商品，请先下架商品', 400);
    }

    category.status = CategoryStatus.ARCHIVED;
    await category.save();

    return ResponseUtil.success(res, category, '归档成功');
  },

  async updateSort(req: Request, res: Response) {
    const { items } = req.body;

    await sequelize.transaction(async (t: Transaction) => {
      for (const item of items) {
        await Category.update(
          { sort: item.sort },
          { where: { id: item.id }, transaction: t }
        );
      }
    });

    return ResponseUtil.success(res, null, '排序更新成功');
  }
};

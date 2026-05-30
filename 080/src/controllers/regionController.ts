import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import Region from '../models/Region';
import Category from '../models/Category';
import Equipment, { EquipmentStatus } from '../models/Equipment';
import { ApiResponse } from '../utils/response';
import { validateRequest } from '../middlewares/validateRequest';
import { AppError, NotFoundError } from '../exceptions/AppError';
import { UserRole } from '../models';

const createRegionSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  parentId: Joi.number().integer().optional(),
  sortOrder: Joi.number().integer().default(0),
});

const updateRegionSchema = Joi.object({
  name: Joi.string().optional(),
  code: Joi.string().optional(),
  parentId: Joi.number().integer().optional(),
  sortOrder: Joi.number().integer().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

export const createRegion = [
  validateRequest(createRegionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, code, parentId, sortOrder } = req.body;
      
      const existingRegion = await Region.findOne({ where: { code } });
      if (existingRegion) {
        throw new AppError('地区编码已存在', 400);
      }
      
      let level = 1;
      if (parentId) {
        const parent = await Region.findByPk(parentId);
        if (!parent) {
          throw new NotFoundError('父级地区不存在');
        }
        level = parent.level + 1;
      }
      
      const region = await Region.create({
        name,
        code,
        parentId: parentId || null,
        level,
        sortOrder,
        status: 'active',
      });
      
      ApiResponse.success(res, region, '创建成功', 201);
    } catch (error) {
      next(error);
    }
  },
];

export const updateRegion = [
  validateRequest(updateRegionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const region = await Region.findByPk(id);
      if (!region) {
        throw new NotFoundError('地区不存在');
      }
      
      if (updateData.parentId && updateData.parentId !== region.parentId) {
        const parent = await Region.findByPk(updateData.parentId);
        if (!parent) {
          throw new NotFoundError('父级地区不存在');
        }
        updateData.level = parent.level + 1;
      }
      
      await region.update(updateData);
      
      ApiResponse.success(res, region, '更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const deleteRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const region = await Region.findByPk(id);
    if (!region) {
      throw new NotFoundError('地区不存在');
    }
    
    const hasChildren = await Region.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw new AppError('该地区下存在子地区，无法删除', 400);
    }
    
    await region.update({ status: 'inactive' });
    
    ApiResponse.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getRegionTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'active' } = req.query;
    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    
    const regions = await Region.findAll({
      where: whereCondition,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
    
    const buildTree = (parentId: number | null): any[] => {
      return regions
        .filter((region) => region.parentId === parentId)
        .map((region) => ({
          id: region.id,
          name: region.name,
          code: region.code,
          level: region.level,
          sortOrder: region.sortOrder,
          status: region.status,
          children: buildTree(region.id),
        }));
    };
    
    const tree = buildTree(null);
    
    ApiResponse.success(res, tree);
  } catch (error) {
    next(error);
  }
};

export const getRegionCategoryEquipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { regionId, categoryId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    
    const region = await Region.findByPk(regionId);
    if (!region) {
      throw new NotFoundError('地区不存在');
    }
    
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }
    
    const getChildIds = async (model: any, parentId: number | null): Promise<number[]> => {
      const items = await model.findAll({ where: { parentId, status: 'active' } });
      let ids: number[] = [];
      for (const item of items) {
        ids.push(item.id);
        const childIds = await getChildIds(model, item.id);
        ids = [...ids, ...childIds];
      }
      return ids;
    };
    
    const regionIds = [Number(regionId), ...(await getChildIds(Region, Number(regionId)))];
    const categoryIds = [Number(categoryId), ...(await getChildIds(Category, Number(categoryId)))];
    
    const { count, rows } = await Equipment.findAndCountAll({
      where: {
        isDeleted: false,
        categoryId: { [Op.in]: categoryIds },
        location: { [Op.or]: regionIds.map(id => ({ [Op.like]: `%${id}%` })) },
        status: EquipmentStatus.ON_SALE,
      },
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['id', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
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

export const getRegionCategoryLinkage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { regionId } = req.params;
    
    const regionChain = await Region.getRegionChain(Number(regionId));
    if (regionChain.length === 0) {
      throw new NotFoundError('地区不存在');
    }
    
    const getChildIds = async (model: any, parentId: number | null): Promise<number[]> => {
      const items = await model.findAll({ where: { parentId, status: 'active' } });
      let ids: number[] = [];
      for (const item of items) {
        ids.push(item.id);
        const childIds = await getChildIds(model, item.id);
        ids = [...ids, ...childIds];
      }
      return ids;
    };
    
    const regionIds = [Number(regionId), ...(await getChildIds(Region, Number(regionId)))];
    
    const categories = await Category.findAll({
      where: { isDeleted: false, status: 'active' },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
    
    const categoryEquipmentCounts: Record<number, number> = {};
    
    for (const category of categories) {
      const categoryIds = [category.id, ...(await getChildIds(Category, category.id))];
      const count = await Equipment.count({
        where: {
          isDeleted: false,
          categoryId: { [Op.in]: categoryIds },
          location: { [Op.or]: regionIds.map(id => ({ [Op.like]: `%${id}%` })) },
          status: EquipmentStatus.ON_SALE,
        },
      });
      categoryEquipmentCounts[category.id] = count;
    }
    
    const buildCategoryTree = (parentId: number | null): any[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          level: cat.level,
          icon: cat.icon,
          equipmentCount: categoryEquipmentCounts[cat.id] || 0,
          children: buildCategoryTree(cat.id),
        }));
    };
    
    const categoryTree = buildCategoryTree(null);
    
    ApiResponse.success(res, {
      region: {
        chain: regionChain.map(r => ({ id: r.id, name: r.name, code: r.code })),
        current: regionChain[regionChain.length - 1],
      },
      categories: categoryTree,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const region = await Region.findByPk(id, {
      include: [
        {
          model: Region,
          as: 'parent',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    if (!region) {
      throw new NotFoundError('地区不存在');
    }
    
    ApiResponse.success(res, region);
  } catch (error) {
    next(error);
  }
};

export const getRegionList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query;
    
    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    if (keyword) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
      ];
    }
    
    const { count, rows } = await Region.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      include: [
        {
          model: Region,
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

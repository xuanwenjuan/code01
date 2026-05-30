import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import Equipment, { EquipmentStatus, ConditionLevel } from '../models/Equipment';
import Category from '../models/Category';
import User from '../models/User';
import { ApiResponse } from '../utils/response';
import { validateRequest } from '../middlewares/validateRequest';
import { AppError, NotFoundError } from '../exceptions/AppError';
import { UserRole } from '../models';
import dayjs from 'dayjs';

const createEquipmentSchema = Joi.object({
  name: Joi.string().required(),
  categoryId: Joi.number().integer().required(),
  brand: Joi.string().required(),
  manufactureYear: Joi.number().integer().min(1990).max(dayjs().year()).required(),
  workingHours: Joi.number().integer().min(0).default(0),
  conditionLevel: Joi.string().valid(...Object.values(ConditionLevel)).required(),
  location: Joi.string().required(),
  description: Joi.string().optional(),
  images: Joi.string().optional(),
  startPrice: Joi.number().positive().required(),
  reservePrice: Joi.number().positive().optional(),
});

const updateEquipmentSchema = Joi.object({
  name: Joi.string().optional(),
  categoryId: Joi.number().integer().optional(),
  brand: Joi.string().optional(),
  manufactureYear: Joi.number().integer().min(1990).max(dayjs().year()).optional(),
  workingHours: Joi.number().integer().min(0).optional(),
  conditionLevel: Joi.string().valid(...Object.values(ConditionLevel)).optional(),
  location: Joi.string().optional(),
  description: Joi.string().optional(),
  images: Joi.string().optional(),
  startPrice: Joi.number().positive().optional(),
  reservePrice: Joi.number().positive().optional(),
  status: Joi.string().valid(...Object.values(EquipmentStatus)).optional(),
});

const queryEquipmentSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(EquipmentStatus)).optional(),
  categoryId: Joi.number().integer().optional(),
  brand: Joi.string().optional(),
  manufactureYear: Joi.number().integer().min(1990).max(dayjs().year()).optional(),
  minYear: Joi.number().integer().min(1990).max(dayjs().year()).optional(),
  maxYear: Joi.number().integer().min(1990).max(dayjs().year()).optional(),
  conditionLevel: Joi.string().valid(...Object.values(ConditionLevel)).optional(),
  keyword: Joi.string().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  location: Joi.string().optional(),
  sellerId: Joi.number().integer().optional(),
  sortBy: Joi.string().valid('createdAt', 'startPrice', 'manufactureYear', 'workingHours').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
});

const generateEquipmentNo = (): string => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EQ${timestamp}${random}`;
};

export const createEquipment = [
  validateRequest(createEquipmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.body;
      
      const categoryChainCheck = await Category.isCategoryChainActive(categoryId);
      if (!categoryChainCheck.valid) {
        const invalidCategory = categoryChainCheck.invalidCategory;
        if (!invalidCategory) {
          throw new NotFoundError('分类不存在');
        }
        if (invalidCategory.isDeleted) {
          throw new AppError(`分类 "${invalidCategory.name}" 已被删除，无法发布设备`, 400);
        }
        if (invalidCategory.status !== 'active') {
          throw new AppError(`分类 "${invalidCategory.name}" 已下线，无法发布设备`, 400);
        }
      }
      
      const equipmentNo = generateEquipmentNo();
      
      const equipment = await Equipment.create({
        ...req.body,
        equipmentNo,
        sellerId: req.user!.userId,
        status: EquipmentStatus.OFF_SHELF,
        isDeleted: false,
      });
      
      ApiResponse.success(res, equipment, '创建设备成功', 201);
    } catch (error) {
      next(error);
    }
  },
];

export const updateEquipment = [
  validateRequest(updateEquipmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const equipment = await Equipment.findByPk(id);
      if (!equipment || equipment.isDeleted) {
        throw new NotFoundError('设备不存在');
      }
      
      if (req.user!.role !== UserRole.ADMIN && equipment.sellerId !== req.user!.userId) {
        throw new AppError('无权修改此设备', 403);
      }
      
      if (updateData.categoryId && updateData.categoryId !== equipment.categoryId) {
        const categoryChainCheck = await Category.isCategoryChainActive(updateData.categoryId);
        if (!categoryChainCheck.valid) {
          const invalidCategory = categoryChainCheck.invalidCategory;
          if (!invalidCategory) {
            throw new NotFoundError('分类不存在');
          }
          if (invalidCategory.isDeleted) {
            throw new AppError(`分类 "${invalidCategory.name}" 已被删除，无法修改设备分类`, 400);
          }
          if (invalidCategory.status !== 'active') {
            throw new AppError(`分类 "${invalidCategory.name}" 已下线，无法修改设备分类`, 400);
          }
        }
      }
      
      await equipment.update(updateData);
      
      ApiResponse.success(res, equipment, '更新设备成功');
    } catch (error) {
      next(error);
    }
  },
];

export const deleteEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findByPk(id);
    if (!equipment || equipment.isDeleted) {
      throw new NotFoundError('设备不存在');
    }
    
    if (req.user!.role !== UserRole.ADMIN && equipment.sellerId !== req.user!.userId) {
      throw new AppError('无权删除此设备', 403);
    }
    
    if (equipment.status === EquipmentStatus.IN_AUCTION) {
      throw new AppError('设备正在竞拍中，无法删除', 400);
    }
    
    await equipment.update({ isDeleted: true, status: EquipmentStatus.OFF_SHELF });
    
    ApiResponse.success(res, null, '删除设备成功');
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'commissionRate'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'phone', 'realName'],
        },
      ],
    });
    
    if (!equipment || equipment.isDeleted) {
      throw new NotFoundError('设备不存在');
    }
    
    ApiResponse.success(res, equipment);
  } catch (error) {
    next(error);
  }
};

export const getEquipmentList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      categoryId,
      brand,
      manufactureYear,
      minYear,
      maxYear,
      conditionLevel,
      keyword,
      minPrice,
      maxPrice,
      location,
      sellerId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;
    
    const whereCondition: any = { isDeleted: false };
    
    if (status) {
      whereCondition.status = status;
    }
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }
    if (brand) {
      whereCondition.brand = { [Op.like]: `%${brand}%` };
    }
    if (manufactureYear) {
      whereCondition.manufactureYear = Number(manufactureYear);
    }
    if (minYear) {
      whereCondition.manufactureYear = { [Op.gte]: Number(minYear) };
    }
    if (maxYear) {
      whereCondition.manufactureYear = {
        ...whereCondition.manufactureYear,
        [Op.lte]: Number(maxYear),
      };
    }
    if (conditionLevel) {
      whereCondition.conditionLevel = conditionLevel;
    }
    if (keyword) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } },
      ];
    }
    if (minPrice) {
      whereCondition.startPrice = { [Op.gte]: Number(minPrice) };
    }
    if (maxPrice) {
      whereCondition.startPrice = {
        ...whereCondition.startPrice,
        [Op.lte]: Number(maxPrice),
      };
    }
    if (location) {
      whereCondition.location = { [Op.like]: `%${location}%` };
    }
    if (sellerId && req.user?.role === UserRole.ADMIN) {
      whereCondition.sellerId = sellerId;
    }
    
    if (req.user && req.user.role === UserRole.SELLER) {
      whereCondition.sellerId = req.user.userId;
    }
    
    const { count, rows } = await Equipment.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [[sortBy as string, sortOrder as string]],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'level'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'realName', 'phone'],
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

export const updateEquipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const equipment = await Equipment.findByPk(id);
    if (!equipment || equipment.isDeleted) {
      throw new NotFoundError('设备不存在');
    }
    
    if (req.user!.role !== UserRole.ADMIN && equipment.sellerId !== req.user!.userId) {
      throw new AppError('无权修改此设备状态', 403);
    }
    
    if (!Object.values(EquipmentStatus).includes(status)) {
      throw new AppError('无效的状态值', 400);
    }
    
    if (status === EquipmentStatus.IN_AUCTION) {
      const categoryChainCheck = await Category.isCategoryChainActive(equipment.categoryId);
      if (!categoryChainCheck.valid) {
        const invalidCategory = categoryChainCheck.invalidCategory;
        if (invalidCategory && invalidCategory.status !== 'active') {
          throw new AppError(`分类 "${invalidCategory.name}" 已下线，无法上架竞拍`, 400);
        }
        throw new AppError('设备分类无效，无法上架竞拍', 400);
      }
    }
    
    await equipment.update({ status });
    
    ApiResponse.success(res, equipment, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const batchUpdateEquipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('设备ID列表不能为空', 400);
    }
    
    if (!Object.values(EquipmentStatus).includes(status)) {
      throw new AppError('无效的状态值', 400);
    }
    
    const equipments = await Equipment.findAll({
      where: { id: ids, isDeleted: false },
    });
    
    if (equipments.length === 0) {
      throw new NotFoundError('未找到有效的设备');
    }
    
    for (const equipment of equipments) {
      if (req.user!.role !== UserRole.ADMIN && equipment.sellerId !== req.user!.userId) {
        throw new AppError(`无权修改设备 "${equipment.name}" 的状态`, 403);
      }
    }
    
    if (status === EquipmentStatus.IN_AUCTION) {
      for (const equipment of equipments) {
        const categoryChainCheck = await Category.isCategoryChainActive(equipment.categoryId);
        if (!categoryChainCheck.valid) {
          const invalidCategory = categoryChainCheck.invalidCategory;
          if (invalidCategory && invalidCategory.status !== 'active') {
            throw new AppError(`设备 "${equipment.name}" 的分类 "${invalidCategory.name}" 已下线，无法上架竞拍`, 400);
          }
          throw new AppError(`设备 "${equipment.name}" 的分类无效，无法上架竞拍`, 400);
        }
      }
    }
    
    await Equipment.update(
      { status },
      { where: { id: ids } }
    );
    
    ApiResponse.success(res, { updatedCount: equipments.length }, '批量状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const getEquipmentDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'commissionRate'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'phone', 'realName', 'avatar'],
        },
      ],
    });
    
    if (!equipment || equipment.isDeleted) {
      throw new NotFoundError('设备不存在');
    }
    
    const categoryChain = await Category.getCategoryChain(equipment.categoryId);
    
    ApiResponse.success(res, {
      ...equipment.toJSON(),
      categoryChain: categoryChain.map(c => ({ id: c.id, name: c.name })),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEquipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, categoryId } = req.query;
    const sellerId = req.user!.userId;
    
    const whereCondition: any = { isDeleted: false, sellerId };
    
    if (status) {
      whereCondition.status = status;
    }
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }
    
    const { count, rows } = await Equipment.findAndCountAll({
      where: whereCondition,
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

export const getEquipmentStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.userId;
    
    const statusCounts = await Equipment.findAll({
      where: { isDeleted: false, sellerId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });
    
    const totalCount = await Equipment.count({
      where: { isDeleted: false, sellerId },
    });
    
    const statistics: Record<string, number> = {};
    Object.values(EquipmentStatus).forEach(status => {
      statistics[status] = 0;
    });
    
    statusCounts.forEach((item: any) => {
      statistics[item.status] = item.getDataValue('count');
    });
    
    ApiResponse.success(res, {
      total: totalCount,
      byStatus: statistics,
    });
  } catch (error) {
    next(error);
  }
};

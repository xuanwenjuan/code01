import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ServiceCategory, Order } from '../models';
import { CategoryStatus, OrderStatus } from '../types';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import { Op } from 'sequelize';

export const createCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': '类目名称长度不能少于2个字符',
      'string.max': '类目名称长度不能超过100个字符',
      'any.required': '类目名称不能为空',
    }),
    parentId: Joi.number().integer().min(0).optional().default(0),
    level: Joi.number().integer().min(1).max(3).optional().default(1),
    icon: Joi.string().max(500).optional(),
    description: Joi.string().max(2000).optional(),
    basePrice: Joi.number().min(0).precision(2).required().messages({
      'number.min': '基准价格不能小于0',
      'any.required': '基准价格不能为空',
    }),
    priceUnit: Joi.string().max(20).required().messages({
      'any.required': '价格单位不能为空',
    }),
    sort: Joi.number().integer().min(0).optional().default(0),
  }),
});

export const updateCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '类目ID不能为空',
    }),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    parentId: Joi.number().integer().min(0).optional(),
    level: Joi.number().integer().min(1).max(3).optional(),
    icon: Joi.string().max(500).optional(),
    description: Joi.string().max(2000).optional(),
    basePrice: Joi.number().min(0).precision(2).optional(),
    priceUnit: Joi.string().max(20).optional(),
    sort: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid(...Object.values(CategoryStatus)).optional(),
  }),
});

export const deleteCategorySchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '类目ID不能为空',
    }),
  }),
});

export const getCategoryByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '类目ID不能为空',
    }),
  }),
});

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, parentId, level, icon, description, basePrice, priceUnit, sort } = req.body;

    const category = await ServiceCategory.create({
      name,
      parentId,
      level,
      icon,
      description,
      basePrice,
      priceUnit,
      sort,
      status: CategoryStatus.ACTIVE,
    });

    res.json(ResponseUtil.created(category, '服务类目创建成功'));
  } catch (error) {
    next(error);
  }
};

const checkCategoryHasPendingOrders = async (categoryId: number): Promise<boolean> => {
  const categoryIds = [categoryId];
  
  const getChildIds = async (parentId: number) => {
    const children = await ServiceCategory.findAll({
      where: { parentId },
      attributes: ['id'],
    });
    for (const child of children) {
      categoryIds.push(child.id);
      await getChildIds(child.id);
    }
  };
  await getChildIds(categoryId);

  const pendingOrderCount = await Order.count({
    where: {
      categoryId: { [Op.in]: categoryIds },
      status: {
        [Op.in]: [
          OrderStatus.PENDING_PAYMENT,
          OrderStatus.PENDING_DISPATCH,
          OrderStatus.DISPATCHED,
          OrderStatus.ACCEPTED,
          OrderStatus.IN_SERVICE,
        ],
      },
    },
  });

  return pendingOrderCount > 0;
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('服务类目不存在');
    }

    if (updateData.parentId && Number(updateData.parentId) === Number(id)) {
      throw new BadRequestException('不能将自己设为父类目');
    }

    if (updateData.status === CategoryStatus.INACTIVE && category.status === CategoryStatus.ACTIVE) {
      const hasPendingOrders = await checkCategoryHasPendingOrders(Number(id));
      if (hasPendingOrders) {
        throw new BadRequestException('该类目或其子类目下存在进行中的订单，无法下架');
      }
    }

    await category.update(updateData);

    res.json(ResponseUtil.success(category, '服务类目更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('服务类目不存在');
    }

    const childCount = await ServiceCategory.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException('该类目下存在子类目，无法删除');
    }

    await category.destroy();

    res.json(ResponseUtil.success(null, '服务类目删除成功'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await ServiceCategory.findByPk(id, {
      include: [
        {
          model: ServiceCategory,
          as: 'children',
          required: false,
          separate: false,
          include: [
            {
              model: ServiceCategory,
              as: 'children',
              required: false,
            },
          ],
        },
      ],
    });

    if (!category) {
      throw new NotFoundException('服务类目不存在');
    }

    res.json(ResponseUtil.success(category, '获取服务类目成功'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const whereCondition: any = { parentId: 0 };
    if (status) {
      whereCondition.status = status;
    }

    const categories = await ServiceCategory.findAll({
      where: whereCondition,
      include: [
        {
          model: ServiceCategory,
          as: 'children',
          required: false,
          where: status ? { status } : undefined,
          include: [
            {
              model: ServiceCategory,
              as: 'children',
              required: false,
              where: status ? { status } : undefined,
            },
          ],
        },
      ],
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json(ResponseUtil.success(categories, '获取类目树成功'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    if (keyword) {
      whereCondition.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await ServiceCategory.findAndCountAll({
      where: whereCondition,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取类目列表成功'));
  } catch (error) {
    next(error);
  }
};

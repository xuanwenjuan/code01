import { Request, Response, NextFunction } from 'express';
import Supplier, { CooperationStatus, SettlementMethod } from '../models/Supplier';
import PriceAdjustment from '../models/PriceAdjustment';
import Product from '../models/Product';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import Joi from 'joi';
import { Op } from 'sequelize';
import { UserRole } from '../types/common';

const phoneRegex = /^1[3-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createSupplierSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': '供应商名称不能为空',
    'string.max': '供应商名称不能超过100个字符'
  }),
  code: Joi.string().required().max(50).messages({
    'any.required': '供应商编码不能为空',
    'string.max': '供应商编码不能超过50个字符'
  }),
  contactPerson: Joi.string().allow('').max(50).messages({
    'string.max': '联系人姓名不能超过50个字符'
  }),
  phone: Joi.string().allow('').pattern(phoneRegex).messages({
    'string.pattern.base': '手机号码格式不正确'
  }),
  address: Joi.string().allow('').max(255).messages({
    'string.max': '地址不能超过255个字符'
  }),
  email: Joi.string().allow('').pattern(emailRegex).messages({
    'string.pattern.base': '邮箱格式不正确'
  }),
  mainCategories: Joi.string().allow('').max(500).messages({
    'string.max': '主营品类不能超过500个字符'
  }),
  deliveryTime: Joi.number().integer().min(0).messages({
    'number.min': '发货时效不能为负数',
    'number.integer': '发货时效必须是整数'
  }),
  settlementMethod: Joi.string()
    .valid(...Object.values(SettlementMethod))
    .messages({
      'any.only': '无效的结算方式'
    }),
  qualification: Joi.string().allow('').max(2000).messages({
    'string.max': '资质信息不能超过2000个字符'
  }),
  remark: Joi.string().allow('').max(1000).messages({
    'string.max': '备注不能超过1000个字符'
  })
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string().max(100).messages({
    'string.max': '供应商名称不能超过100个字符'
  }),
  contactPerson: Joi.string().allow('').max(50).messages({
    'string.max': '联系人姓名不能超过50个字符'
  }),
  phone: Joi.string().allow('').pattern(phoneRegex).messages({
    'string.pattern.base': '手机号码格式不正确'
  }),
  address: Joi.string().allow('').max(255).messages({
    'string.max': '地址不能超过255个字符'
  }),
  email: Joi.string().allow('').pattern(emailRegex).messages({
    'string.pattern.base': '邮箱格式不正确'
  }),
  mainCategories: Joi.string().allow('').max(500).messages({
    'string.max': '主营品类不能超过500个字符'
  }),
  deliveryTime: Joi.number().integer().min(0).messages({
    'number.min': '发货时效不能为负数',
    'number.integer': '发货时效必须是整数'
  }),
  settlementMethod: Joi.string()
    .valid(...Object.values(SettlementMethod))
    .messages({
      'any.only': '无效的结算方式'
    }),
  cooperationStatus: Joi.string()
    .valid(...Object.values(CooperationStatus))
    .messages({
      'any.only': '无效的合作状态'
    }),
  qualification: Joi.string().allow('').max(2000).messages({
    'string.max': '资质信息不能超过2000个字符'
  }),
  remark: Joi.string().allow('').max(1000).messages({
    'string.max': '备注不能超过1000个字符'
  })
});

export const priceAdjustmentSchema = Joi.object({
  supplierId: Joi.number().required().messages({
    'any.required': '供应商不能为空'
  }),
  productId: Joi.number().required().messages({
    'any.required': '商品不能为空'
  }),
  newPrice: Joi.number().positive().precision(2).required().messages({
    'any.required': '新价格不能为空',
    'number.positive': '新价格必须大于0',
    'number.precision': '新价格最多保留2位小数'
  }),
  reason: Joi.string().allow('').max(500).messages({
    'string.max': '调整原因不能超过500个字符'
  })
});

export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (![UserRole.ADMIN, UserRole.PURCHASER].includes(req.user!.role as UserRole)) {
      throw new ForbiddenException('只有管理员和采购员可以创建供应商');
    }

    const { code, name, phone, email } = req.body;

    const existingSupplier = await Supplier.findOne({ where: { code } });
    if (existingSupplier) {
      throw new BadRequestException('供应商编码已存在');
    }

    const supplier = await Supplier.create({
      ...req.body,
      cooperationStatus: req.body.cooperationStatus || CooperationStatus.ACTIVE
    });

    res.status(201).json(ResponseUtil.created(supplier, '供应商创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getSupplierList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword, cooperationStatus, page = 1, pageSize = 10 } = req.query;
    
    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (cooperationStatus) {
      where.cooperationStatus = cooperationStatus;
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']]
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

export const getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const adjustmentCount = await PriceAdjustment.count({ where: { supplierId: id } });

    res.json(ResponseUtil.success({
      ...supplier.toJSON(),
      priceAdjustmentCount: adjustmentCount
    }));
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (![UserRole.ADMIN, UserRole.PURCHASER].includes(req.user!.role as UserRole)) {
      throw new ForbiddenException('只有管理员和采购员可以更新供应商');
    }

    const { id } = req.params;
    const { cooperationStatus } = req.body;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    if (cooperationStatus === CooperationStatus.TERMINATED && 
        supplier.cooperationStatus !== CooperationStatus.TERMINATED) {
      const productCount = await Product.count({
        where: { isActive: true }
      });
      if (productCount > 0) {
        throw new BadRequestException('该供应商仍有合作商品，无法终止合作');
      }
    }

    await supplier.update(req.body);
    res.json(ResponseUtil.success(supplier, '供应商更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除供应商');
    }

    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const adjustmentCount = await PriceAdjustment.count({ where: { supplierId: id } });
    if (adjustmentCount > 0) {
      throw new BadRequestException('该供应商有调价记录，建议改为终止合作状态');
    }

    await supplier.destroy();
    res.json(ResponseUtil.success(null, '供应商删除成功'));
  } catch (error) {
    next(error);
  }
};

export const createPriceAdjustment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (![UserRole.ADMIN, UserRole.PURCHASER].includes(req.user!.role as UserRole)) {
      throw new ForbiddenException('只有管理员和采购员可以创建价格调整');
    }

    const { supplierId, productId, newPrice, reason } = req.body;

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      throw new BadRequestException('供应商不存在');
    }

    if (supplier.cooperationStatus !== CooperationStatus.ACTIVE) {
      throw new BadRequestException('该供应商非合作状态，无法调整价格');
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      throw new BadRequestException('商品不存在');
    }

    const oldPrice = product.costPrice;
    const priceDiff = newPrice - oldPrice;
    const changeRate = oldPrice > 0 ? Math.abs(priceDiff / oldPrice) : 0;

    if (changeRate > 0.3) {
      throw new BadRequestException(`价格变动超过30%（当前变动${(changeRate * 100).toFixed(2)}%），请确认后再提交`);
    }

    const adjustment = await PriceAdjustment.create({
      supplierId,
      productId,
      oldPrice,
      newPrice,
      reason,
      operatorId: req.user!.id,
      operatorName: req.user!.username
    });

    await product.update({ costPrice: newPrice });

    res.status(201).json(ResponseUtil.created(adjustment, '价格调整成功'));
  } catch (error) {
    next(error);
  }
};

export const getPriceAdjustmentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { supplierId, productId, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (productId) where.productId = productId;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await PriceAdjustment.findAndCountAll({
      where,
      include: [
        { model: Supplier, attributes: ['id', 'name', 'code'] },
        { model: Product, attributes: ['id', 'name', 'sku'] }
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']]
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

export const getSupplierSelectList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { cooperationStatus: CooperationStatus.ACTIVE },
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });

    res.json(ResponseUtil.success(suppliers));
  } catch (error) {
    next(error);
  }
};

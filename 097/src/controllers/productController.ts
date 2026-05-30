import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import Joi from 'joi';
import { Op } from 'sequelize';
import { UserRole } from '../types/common';

export const createProductSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': '商品名称不能为空',
    'string.max': '商品名称不能超过100个字符'
  }),
  sku: Joi.string().required().max(50).messages({
    'any.required': 'SKU不能为空',
    'string.max': 'SKU不能超过50个字符'
  }),
  categoryId: Joi.number().required().messages({
    'any.required': '分类不能为空'
  }),
  specification: Joi.string().allow('').max(500).messages({
    'string.max': '规格描述不能超过500个字符'
  }),
  brand: Joi.string().allow('').max(50).messages({
    'string.max': '品牌不能超过50个字符'
  }),
  costPrice: Joi.number().precision(2).min(0).default(0).messages({
    'number.min': '成本价不能为负数',
    'number.precision': '成本价最多保留2位小数'
  }),
  sellingPrice: Joi.number().precision(2).min(0).default(0).messages({
    'number.min': '售价不能为负数',
    'number.precision': '售价最多保留2位小数'
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.min': '库存不能为负数',
    'number.integer': '库存必须是整数'
  }),
  image: Joi.string().allow('').max(500).messages({
    'string.max': '图片地址不能超过500个字符'
  }),
  description: Joi.string().allow('').max(2000).messages({
    'string.max': '描述不能超过2000个字符'
  })
});

export const updateProductSchema = Joi.object({
  name: Joi.string().max(100).messages({
    'string.max': '商品名称不能超过100个字符'
  }),
  specification: Joi.string().allow('').max(500).messages({
    'string.max': '规格描述不能超过500个字符'
  }),
  brand: Joi.string().allow('').max(50).messages({
    'string.max': '品牌不能超过50个字符'
  }),
  categoryId: Joi.number(),
  costPrice: Joi.number().precision(2).min(0).messages({
    'number.min': '成本价不能为负数',
    'number.precision': '成本价最多保留2位小数'
  }),
  sellingPrice: Joi.number().precision(2).min(0).messages({
    'number.min': '售价不能为负数',
    'number.precision': '售价最多保留2位小数'
  }),
  image: Joi.string().allow('').max(500).messages({
    'string.max': '图片地址不能超过500个字符'
  }),
  description: Joi.string().allow('').max(2000).messages({
    'string.max': '描述不能超过2000个字符'
  }),
  isActive: Joi.boolean()
});

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (![UserRole.ADMIN, UserRole.PURCHASER].includes(req.user!.role as UserRole)) {
      throw new ForbiddenException('只有管理员和采购员可以创建商品');
    }

    const { sku, categoryId, name } = req.body;

    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      throw new BadRequestException('SKU已存在');
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new BadRequestException('分类不存在');
    }

    if (!category.isActive) {
      throw new BadRequestException('该类目已淘汰停用，无法绑定商品');
    }

    const product = await Product.create(req.body);
    res.status(201).json(ResponseUtil.created(product, '商品创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getProductList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword, categoryId, isActive, page = 1, pageSize = 10 } = req.query;
    
    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { sku: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
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

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    res.json(ResponseUtil.success(product));
  } catch (error) {
    next(error);
  }
};

export const getProductSelectList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, keyword } = req.query;
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { sku: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
      attributes: ['id', 'name', 'sku', 'sellingPrice', 'stock'],
      order: [['name', 'ASC']]
    });

    res.json(ResponseUtil.success(products));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (![UserRole.ADMIN, UserRole.PURCHASER].includes(req.user!.role as UserRole)) {
      throw new ForbiddenException('只有管理员和采购员可以更新商品');
    }

    const { id } = req.params;
    const { categoryId } = req.body;
    const product = await Product.findByPk(id);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new BadRequestException('分类不存在');
      }
      if (!category.isActive) {
        throw new BadRequestException('该类目已淘汰停用，无法绑定商品');
      }
    }

    await product.update(req.body);
    res.json(ResponseUtil.success(product, '商品更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除商品');
    }

    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    await product.destroy();
    res.json(ResponseUtil.success(null, '商品删除成功'));
  } catch (error) {
    next(error);
  }
};

export const batchUpdateStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (![UserRole.ADMIN, UserRole.WAREHOUSE_KEEPER].includes(req.user!.role as UserRole)) {
      throw new ForbiddenException('只有管理员和仓管员可以调整库存');
    }

    const { items, remark } = req.body;

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new BadRequestException(`商品ID ${item.productId} 不存在`);
      }
      if (item.stock < 0) {
        throw new BadRequestException(`商品 ${product.name} 的库存不能为负数`);
      }
      await product.update({ stock: item.stock });
    }

    res.json(ResponseUtil.success(null, '库存批量更新成功'));
  } catch (error) {
    next(error);
  }
};

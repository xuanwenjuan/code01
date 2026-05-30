import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import Product from '../models/Product';
import Category from '../models/Category';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { CategoryStatus } from '../types';
import { Op } from 'sequelize';
import { hasDiscontinuedAncestor, getCategoryChain } from './categoryController';

export const createProductValidation = [
  body('name').notEmpty().withMessage('产品名称不能为空').trim().isLength({ min: 1, max: 200 }).withMessage('产品名称长度应在1-200字符之间'),
  body('code').notEmpty().withMessage('产品编码不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('产品编码长度应在1-50字符之间'),
  body('categoryId').isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
  body('basePrice').isFloat({ min: 0 }).withMessage('基础价格必须为非负数字'),
  body('customFee').optional().isFloat({ min: 0 }).withMessage('定制费用必须为非负数字'),
  body('description').optional().isLength({ max: 2000 }).withMessage('描述长度不能超过2000字符'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
];

export const updateProductValidation = [
  param('id').isInt({ min: 1 }).withMessage('产品ID必须为正整数'),
  ...createProductValidation,
];

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { name, code, categoryId, description, basePrice, customFee, images, sortOrder } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return next(new AppError('分类不存在', 404));
    }

    if (category.status === CategoryStatus.DISCONTINUED) {
      return next(new AppError(`该类目"${category.name}"已停产，无法在该类目下创建产品`, 400));
    }

    const hasDiscontinued = await hasDiscontinuedAncestor(categoryId);
    if (hasDiscontinued) {
      const chain = await getCategoryChain(categoryId);
      const discontinuedNames = chain
        .filter(c => c.status === CategoryStatus.DISCONTINUED)
        .map(c => c.name)
        .join('、');
      return next(new AppError(`类目链中存在已停产的类目[${discontinuedNames}]，无法创建产品`, 400));
    }

    const existing = await Product.findOne({ where: { code } });
    if (existing) {
      return next(new AppError('产品编码已存在', 400));
    }

    const product = await Product.create({
      name,
      code,
      categoryId,
      description,
      basePrice,
      customFee: customFee || 0,
      images: images || [],
      isActive: true,
      sortOrder: sortOrder || 0,
    });

    res.json(successResponse(product, '产品创建成功'));
  } catch (error) {
    next(error);
  }
};

export const getProductList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, name, code, categoryId, isActive, minPrice, maxPrice } = req.query;

    const where: any = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (code) where.code = { [Op.like]: `%${code}%` };
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice[Op.gte] = Number(minPrice);
      if (maxPrice !== undefined) where.basePrice[Op.lte] = Number(maxPrice);
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'status'] }],
    });

    res.json(paginatedResponse(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'status'] }],
    });

    if (!product) {
      return next(new AppError('产品不存在', 404));
    }

    const chain = await getCategoryChain(product.categoryId);

    res.json(successResponse({
      ...product.toJSON(),
      categoryChain: chain.map(c => ({ id: c.id, name: c.name, status: c.status })),
    }));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { id } = req.params;
    const { name, code, categoryId, description, basePrice, customFee, images, isActive, sortOrder } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return next(new AppError('产品不存在', 404));
    }

    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return next(new AppError('分类不存在', 404));
      }
      if (category.status === CategoryStatus.DISCONTINUED) {
        return next(new AppError(`该类目"${category.name}"已停产，无法将产品转移到该类目`, 400));
      }

      const hasDiscontinued = await hasDiscontinuedAncestor(categoryId);
      if (hasDiscontinued) {
        const chain = await getCategoryChain(categoryId);
        const discontinuedNames = chain
          .filter(c => c.status === CategoryStatus.DISCONTINUED)
          .map(c => c.name)
          .join('、');
        return next(new AppError(`类目链中存在已停产的类目[${discontinuedNames}]，无法转移产品`, 400));
      }
    }

    if (code && code !== product.code) {
      const existing = await Product.findOne({ where: { code } });
      if (existing) {
        return next(new AppError('产品编码已存在', 400));
      }
    }

    await product.update({
      name: name !== undefined ? name : product.name,
      code: code !== undefined ? code : product.code,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      description: description !== undefined ? description : product.description,
      basePrice: basePrice !== undefined ? basePrice : product.basePrice,
      customFee: customFee !== undefined ? customFee : product.customFee,
      images: images !== undefined ? images : product.images,
      isActive: isActive !== undefined ? isActive : product.isActive,
      sortOrder: sortOrder !== undefined ? sortOrder : product.sortOrder,
    });

    res.json(successResponse(product, '产品更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return next(new AppError('产品不存在', 404));
    }

    await product.update({ isActive: false });

    res.json(successResponse(null, '产品已停用'));
  } catch (error) {
    next(error);
  }
};

export const batchUpdateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids, isActive } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError('请选择要操作的产品', 400));
    }

    if (typeof isActive !== 'boolean') {
      return next(new AppError('状态值无效', 400));
    }

    await Product.update(
      { isActive },
      { where: { id: { [Op.in]: ids } } }
    );

    res.json(successResponse(null, `批量更新${ids.length}个产品状态成功`));
  } catch (error) {
    next(error);
  }
};
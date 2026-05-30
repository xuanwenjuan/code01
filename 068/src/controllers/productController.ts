import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Product from '../models/Product';
import Category from '../models/Category';
import { ResponseUtil } from '../utils/response';
import { BadRequestError, NotFoundError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';
import logger from '../utils/logger';

const createSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  flowerLanguage: Joi.string().optional(),
  specs: Joi.string().optional(),
  price: Joi.number().positive().required(),
  originalPrice: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.string().optional(),
  tags: Joi.string().optional(),
  discountStart: Joi.date().optional(),
  discountEnd: Joi.date().optional(),
  sort: Joi.number().integer().default(0),
  status: Joi.number().integer().valid(0, 1).default(1),
});

const updateSchema = Joi.object({
  categoryId: Joi.number().integer().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  flowerLanguage: Joi.string().optional(),
  specs: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  originalPrice: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.string().optional(),
  tags: Joi.string().optional(),
  discountStart: Joi.date().optional(),
  discountEnd: Joi.date().optional(),
  sort: Joi.number().integer().optional(),
  status: Joi.number().integer().valid(0, 1).optional(),
});

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const category = await Category.findByPk(value.categoryId, { transaction });
    if (!category) {
      throw new BadRequestError('分类不存在');
    }
    if (category.status !== 1) {
      throw new BadRequestError('不能将商品挂载到已下架的分类');
    }

    const product = await Product.create(value, { transaction });

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 创建商品 ${product.name} (ID: ${product.id})`);

    return ResponseUtil.success(res, product, '创建商品成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getProductList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryId,
      status,
      tags,
      minPrice,
      maxPrice,
      sortBy = 'id',
      sortOrder = 'DESC',
    } = req.query;

    const whereCondition: any = {};

    if (keyword) {
      whereCondition.name = {
        [Op.like]: `%${keyword}%`,
      };
    }

    if (categoryId) {
      whereCondition.categoryId = Number(categoryId);
    }

    if (status !== undefined) {
      whereCondition.status = Number(status);
    }

    if (minPrice !== undefined) {
      whereCondition.price = {
        ...whereCondition.price,
        [Op.gte]: Number(minPrice),
      };
    }

    if (maxPrice !== undefined) {
      whereCondition.price = {
        ...whereCondition.price,
        [Op.lte]: Number(maxPrice),
      };
    }

    if (tags) {
      const tagList = String(tags).split(',');
      const tagConditions = tagList.map((tag) => ({
        tags: {
          [Op.like]: `%${tag}%`,
        },
      }));
      whereCondition[Op.and] = tagConditions;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [[String(sortBy), String(sortOrder)]],
    });

    return ResponseUtil.paginated(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '获取商品列表成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!product) {
      throw new NotFoundError('商品不存在');
    }

    return ResponseUtil.success(res, product, '获取商品成功');
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { error, value } = updateSchema.validate(req.body);

    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const product = await Product.findByPk(id, { transaction });
    if (!product) {
      throw new NotFoundError('商品不存在');
    }

    if (value.categoryId) {
      const category = await Category.findByPk(value.categoryId, { transaction });
      if (!category) {
        throw new BadRequestError('分类不存在');
      }
      if (category.status !== 1) {
        throw new BadRequestError('不能将商品挂载到已下架的分类');
      }
    }

    await product.update(value, { transaction });

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 更新商品 ${product.name} (ID: ${product.id})`);

    return ResponseUtil.success(res, product, '更新商品成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { transaction });
    if (!product) {
      throw new NotFoundError('商品不存在');
    }

    await product.destroy({ transaction });

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 删除商品 ${product.name} (ID: ${product.id})`);

    return ResponseUtil.success(res, null, '删除商品成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const batchUpdatePrice = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { ids, priceAdjustment, percentage } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError('请选择要调价的商品');
    }

    const products = await Product.findAll({
      where: { id: { [Op.in]: ids } },
      transaction,
    });

    if (products.length === 0) {
      throw new BadRequestError('未找到指定的商品');
    }

    for (const product of products) {
      let newPrice = Number(product.price);
      if (percentage) {
        newPrice = newPrice * (1 + percentage / 100);
      } else if (priceAdjustment) {
        newPrice = newPrice + priceAdjustment;
      }
      await product.update({ price: Math.max(0.01, newPrice) }, { transaction });
    }

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 批量调整 ${products.length} 个商品价格`);

    return ResponseUtil.success(res, { updatedCount: products.length }, '批量调价成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      throw new BadRequestError('库存数量必须大于等于0');
    }

    const product = await Product.findByPk(id, { transaction });
    if (!product) {
      throw new NotFoundError('商品不存在');
    }

    await product.update({ stock }, { transaction });

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 更新商品 ${product.name} (ID: ${product.id}) 库存为 ${stock}`);

    return ResponseUtil.success(res, product, '更新库存成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

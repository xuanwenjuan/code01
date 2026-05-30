import { Request, Response, NextFunction } from 'express';
import { Product, Category, Artist } from '../models';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { PaginatedResult, CategoryStatus, ArtistStatus } from '../types';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../database';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user!.userId;
    const { name, description, categoryId, price, stock, images, coverImage, isCustomizable, sortOrder } = req.body;

    const artist = await Artist.findOne({ where: { userId }, transaction: t });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 400, 400);
    }

    if (artist.status !== ArtistStatus.APPROVED) {
      throw new AppError('艺术家资质未通过审核，无法创建商品', 400, 400);
    }

    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      throw new AppError('分类不存在', 400, 400);
    }

    if (category.status !== CategoryStatus.ACTIVE) {
      throw new AppError('该分类已停售，无法绑定商品', 400, 400);
    }

    const product = await Product.create({
      name,
      description,
      categoryId,
      artistId: artist.id,
      price,
      stock: stock || 0,
      images: images ? JSON.stringify(images) : undefined,
      coverImage,
      isCustomizable: isCustomizable || false,
      isActive: true,
      sortOrder: sortOrder || 0,
      salesCount: 0
    }, { transaction: t });

    await t.commit();
    res.status(201).json(ResponseUtil.success(product, '商品创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, categoryId, artistId, keyword, isActive, sortBy, minPrice, maxPrice } = req.query;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (artistId) {
      where.artistId = artistId;
    }

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, [Op.gte]: Number(minPrice) };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, [Op.lte]: Number(maxPrice) };
    }

    let order: any = [['sortOrder', 'ASC']];
    if (sortBy === 'sales') {
      order = [['salesCount', 'DESC']];
    } else if (sortBy === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sortBy === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sortBy === 'newest') {
      order = [['createdAt', 'DESC']];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Artist, as: 'artist' }
      ],
      order,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Product> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Artist, as: 'artist' }
      ]
    });

    if (!product) {
      throw new AppError('商品不存在', 404, 404);
    }

    res.json(ResponseUtil.success(product));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name, description, categoryId, price, stock, images, coverImage, isCustomizable, sortOrder, isActive } = req.body;

    const artist = await Artist.findOne({ where: { userId }, transaction: t });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 400, 400);
    }

    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      throw new AppError('商品不存在', 404, 404);
    }

    if (product.artistId !== artist.id) {
      throw new AppError('无权修改此商品', 403, 403);
    }

    if (categoryId !== undefined && categoryId !== product.categoryId) {
      const category = await Category.findByPk(categoryId, { transaction: t });
      if (!category) {
        throw new AppError('分类不存在', 400, 400);
      }
      if (category.status !== CategoryStatus.ACTIVE) {
        throw new AppError('该分类已停售，无法绑定商品', 400, 400);
      }
    }

    await product.update({
      name,
      description,
      categoryId,
      price,
      stock,
      images: images ? JSON.stringify(images) : undefined,
      coverImage,
      isCustomizable,
      sortOrder,
      isActive
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(product, '商品更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const artist = await Artist.findOne({ where: { userId }, transaction: t });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 400, 400);
    }

    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      throw new AppError('商品不存在', 404, 404);
    }

    if (product.artistId !== artist.id) {
      throw new AppError('无权删除此商品', 403, 403);
    }

    await product.destroy({ transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(null, '商品删除成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMyProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, pageSize = 10, status } = req.query;

    const artist = await Artist.findOne({ where: { userId } });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 404, 404);
    }

    const where: any = { artistId: artist.id };
    
    if (status !== undefined) {
      where.isActive = status === 'true';
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Product> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const toggleProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const artist = await Artist.findOne({ where: { userId }, transaction: t });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 400, 400);
    }

    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      throw new AppError('商品不存在', 404, 404);
    }

    if (product.artistId !== artist.id) {
      throw new AppError('无权修改此商品', 403, 403);
    }

    const newStatus = !product.isActive;

    if (newStatus) {
      const category = await Category.findByPk(product.categoryId, { transaction: t });
      if (category && category.status !== CategoryStatus.ACTIVE) {
        throw new AppError('该商品所属分类已停售，无法上架', 400, 400);
      }
    }

    await product.update({ isActive: newStatus }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(product, newStatus ? '商品已上架' : '商品已下架'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const batchUpdateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { ids, isActive } = req.body;
    const userId = req.user!.userId;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('请选择要操作的商品', 400, 400);
    }

    const artist = await Artist.findOne({ where: { userId }, transaction: t });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 400, 400);
    }

    const products = await Product.findAll({
      where: { id: { [Op.in]: ids }, artistId: artist.id },
      include: [{ model: Category, as: 'category' }],
      transaction: t
    });

    if (isActive) {
      const inactiveProducts = products.filter(p => p.category && p.category.status !== CategoryStatus.ACTIVE);
      if (inactiveProducts.length > 0) {
        throw new AppError(`商品 ${inactiveProducts.map(p => p.name).join(', ')} 所属分类已停售，无法上架`, 400, 400);
      }
    }

    await Product.update(
      { isActive },
      { where: { id: { [Op.in]: ids }, artistId: artist.id }, transaction: t }
    );

    await t.commit();
    res.json(ResponseUtil.success(null, `批量${isActive ? '上架' : '下架'}成功`));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

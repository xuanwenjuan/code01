import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product, Category } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole, CategoryStatus } from '../types';

export const createProduct = async (req: Request, res: Response) => {
  const { name, categoryId, description, images, basePrice, sizes, flavors, minProductionTime, storeId } = req.body;

  if (!name || !categoryId || !basePrice) {
    throw new BadRequestException('缺少必填参数');
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new BadRequestException('分类不存在');
  }

  const product = await Product.create({
    name,
    categoryId,
    storeId,
    description,
    images,
    basePrice,
    sizes: sizes ? JSON.stringify(sizes) : undefined,
    flavors: flavors ? JSON.stringify(flavors) : undefined,
    minProductionTime,
    status: 'on_shelf',
    sort: 0
  });

  res.status(201).json(ResponseUtil.created(product, '产品创建成功'));
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, categoryId, description, images, basePrice, sizes, flavors, minProductionTime, status, sort, storeId } = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundException('产品不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && product.storeId && product.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此产品');
  }

  if (categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new BadRequestException('分类不存在');
    }
  }

  await product.update({
    name: name || product.name,
    categoryId: categoryId || product.categoryId,
    description: description !== undefined ? description : product.description,
    images: images !== undefined ? images : product.images,
    basePrice: basePrice !== undefined ? basePrice : product.basePrice,
    sizes: sizes ? JSON.stringify(sizes) : product.sizes,
    flavors: flavors ? JSON.stringify(flavors) : product.flavors,
    minProductionTime: minProductionTime !== undefined ? minProductionTime : product.minProductionTime,
    status: status !== undefined ? status : product.status,
    sort: sort !== undefined ? sort : product.sort,
    storeId: storeId !== undefined ? storeId : product.storeId
  });

  res.json(ResponseUtil.success(product, '产品更新成功'));
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundException('产品不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && product.storeId && product.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此产品');
  }

  await product.update({ status: 'off_shelf' });

  res.json(ResponseUtil.success(null, '产品已下架'));
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: 'category' }]
  });

  if (!product) {
    throw new NotFoundException('产品不存在');
  }

  res.json(ResponseUtil.success(product));
};

export const getProductList = async (req: Request, res: Response) => {
  const { categoryId, status, keyword, page = 1, pageSize = 10, storeId } = req.query;

  const where: any = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status) {
    where.status = status;
  }
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }
  if (storeId) {
    where.storeId = storeId;
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [{ model: Category, as: 'category' }],
    order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.pagination(rows, count, Number(page), Number(pageSize)));
};

const getCategoryIdsWithChildren = async (categoryIds: number[]): Promise<number[]> => {
  const allIds: number[] = [...categoryIds];
  
  const children = await Category.findAll({
    where: {
      parentId: { [Op.in]: categoryIds }
    },
    attributes: ['id']
  });

  if (children.length > 0) {
    const childIds = children.map(c => c.id);
    const grandChildrenIds = await getCategoryIdsWithChildren(childIds);
    allIds.push(...grandChildrenIds);
  }

  return allIds;
};

export const getProductsForCustomer = async (req: Request, res: Response) => {
  const { categoryId, storeId } = req.query;

  const where: any = { status: 'on_shelf' };
  
  if (storeId) {
    where.storeId = storeId;
  }

  const inactiveCategories = await Category.findAll({
    where: {
      status: { [Op.ne]: CategoryStatus.ACTIVE }
    },
    attributes: ['id']
  });

  const inactiveCategoryIds = inactiveCategories.map(c => c.id);
  
  if (categoryId) {
    const requestedCategory = await Category.findByPk(Number(categoryId));
    if (!requestedCategory) {
      throw new NotFoundException('分类不存在');
    }
    
    if (requestedCategory.status !== CategoryStatus.ACTIVE) {
      throw new BadRequestException('该分类已下架');
    }
    
    const allCategoryIds = await getCategoryIdsWithChildren([Number(categoryId)]);
    const activeCategoryIds = allCategoryIds.filter(id => !inactiveCategoryIds.includes(id));
    
    if (activeCategoryIds.length === 0) {
      return res.json(ResponseUtil.success([], '该分类下暂无可用商品'));
    }
    
    where.categoryId = { [Op.in]: activeCategoryIds };
  } else {
    if (inactiveCategoryIds.length > 0) {
      where.categoryId = { [Op.notIn]: inactiveCategoryIds };
    }
  }

  const products = await Product.findAll({
    where,
    include: [{ model: Category, as: 'category' }],
    order: [['sort', 'ASC'], ['createdAt', 'DESC']]
  });

  res.json(ResponseUtil.success(products));
};

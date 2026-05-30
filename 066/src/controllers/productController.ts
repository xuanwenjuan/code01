import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import Product from '../models/Product';
import Category from '../models/Category';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const productController = {
  async getList(req: Request, res: Response) {
    const { page = 1, pageSize = 10, keyword, categoryId, status } = req.query;
    const where: any = {};
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { spec: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (status !== undefined) {
      where.status = status === 'true';
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ association: 'category', attributes: ['id', 'name', 'code'] }],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize))
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
    const product = await Product.findByPk(id, {
      include: [{ association: 'category' }]
    });
    
    if (!product) {
      throw new AppError('商品不存在', 404);
    }

    return ResponseUtil.success(res, product);
  },

  async create(req: Request, res: Response) {
    const { name, code, categoryId, spec, unit, purchasePrice, sellingPrice, stockQuantity, minStock, maxStock, description } = req.body;

    const exists = await Product.findOne({ where: { code } });
    if (exists) {
      throw new AppError('商品编码已存在', 400);
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new AppError('类目不存在', 400);
    }

    const product = await Product.create({
      name,
      code,
      categoryId,
      spec,
      unit,
      purchasePrice: purchasePrice || 0,
      sellingPrice: sellingPrice || 0,
      stockQuantity: stockQuantity || 0,
      minStock: minStock || 0,
      maxStock: maxStock || 99999,
      status: true,
      description
    });

    return ResponseUtil.success(res, product, '创建成功');
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('商品不存在', 404);
    }

    if (updateData.code && updateData.code !== product.code) {
      const exists = await Product.findOne({ where: { code: updateData.code, id: { [Op.ne]: id } } });
      if (exists) {
        throw new AppError('商品编码已存在', 400);
      }
    }

    await product.update(updateData);

    return ResponseUtil.success(res, product, '更新成功');
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError('商品不存在', 404);
    }

    await product.destroy();

    return ResponseUtil.success(res, null, '删除成功');
  },

  async getLowStock(req: Request, res: Response) {
    const products = await Product.findAll({
      where: {
        stockQuantity: { [Op.lte]: Sequelize.col('minStock') },
        status: true
      },
      include: [{ association: 'category' }],
      order: [['stockQuantity', 'ASC']]
    });

    return ResponseUtil.success(res, products);
  }
};

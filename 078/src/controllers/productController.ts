import { Response } from 'express';
import { Op } from 'sequelize';
import BenefitProduct from '../models/BenefitProduct';
import BenefitCategory from '../models/BenefitCategory';
import Supplier from '../models/Supplier';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export const getProductList = async (req: AuthRequest, res: Response) => {
  const { name, categoryId, supplierId, status, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (supplierId) {
    where.supplierId = supplierId;
  }
  if (status !== undefined && status !== '') {
    where.status = status;
  }

  const { count, rows } = await BenefitProduct.findAndCountAll({
    where,
    include: [
      { model: BenefitCategory, as: 'category', attributes: ['id', 'name'] },
      { model: Supplier, as: 'supplier', attributes: ['id', 'name'] }
    ],
    order: [['sort', 'ASC'], ['id', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const product = await BenefitProduct.findByPk(id, {
    include: [
      { model: BenefitCategory, as: 'category' },
      { model: Supplier, as: 'supplier' }
    ]
  });

  if (!product) {
    throw new AppError('商品不存在', 404);
  }

  res.json(ResponseUtil.success(product));
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { code, categoryId, supplierId } = req.body;

  const existingProduct = await BenefitProduct.findOne({ where: { code } });
  if (existingProduct) {
    throw new AppError('商品编码已存在', 400);
  }

  const category = await BenefitCategory.findByPk(categoryId);
  if (!category) {
    throw new AppError('分类不存在', 400);
  }

  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) {
    throw new AppError('供应商不存在', 400);
  }

  const product = await BenefitProduct.create(req.body);

  res.json(ResponseUtil.success(product, '创建成功'));
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { code, categoryId, supplierId } = req.body;

  const product = await BenefitProduct.findByPk(id);
  if (!product) {
    throw new AppError('商品不存在', 404);
  }

  if (code) {
    const existingProduct = await BenefitProduct.findOne({
      where: { code, id: { [Op.ne]: id } }
    });
    if (existingProduct) {
      throw new AppError('商品编码已存在', 400);
    }
  }

  if (categoryId) {
    const category = await BenefitCategory.findByPk(categoryId);
    if (!category) {
      throw new AppError('分类不存在', 400);
    }
  }

  if (supplierId) {
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      throw new AppError('供应商不存在', 400);
    }
  }

  await product.update(req.body);

  res.json(ResponseUtil.success(product, '更新成功'));
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const product = await BenefitProduct.findByPk(id);
  if (!product) {
    throw new AppError('商品不存在', 404);
  }

  await product.destroy();

  res.json(ResponseUtil.success(null, '删除成功'));
};

export const toggleStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const product = await BenefitProduct.findByPk(id);
  if (!product) {
    throw new AppError('商品不存在', 404);
  }

  await product.update({ status });

  res.json(ResponseUtil.success(null, status === 1 ? '已上架' : '已下架'));
};

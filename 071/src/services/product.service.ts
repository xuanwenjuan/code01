import Product, { ProductAttributes, ProductStatus } from '../models/Product.model';
import Category from '../models/Category.model';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import { Op } from 'sequelize';

class ProductService {
  async createProduct(data: Omit<ProductAttributes, 'id'>): Promise<Product> {
    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw new BadRequestException('类目不存在');
    }
    if (category.status === 0) {
      throw new BadRequestException('该类目已下架，无法添加商品');
    }
    return await Product.create(data);
  }

  async updateProduct(id: number, data: Partial<ProductAttributes>): Promise<Product> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await Category.findByPk(data.categoryId);
      if (!category) {
        throw new BadRequestException('类目不存在');
      }
      if (category.status === 0) {
        throw new BadRequestException('该类目已下架，无法移动商品');
      }
    }
    await product.update(data);
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    await product.destroy();
  }

  async getProductById(id: number): Promise<Product> {
    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'level'] }]
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }

  async getProductList(params: {
    page?: number;
    pageSize?: number;
    status?: number;
    categoryId?: number;
    keyword?: string;
  }): Promise<{ list: Product[]; total: number; page: number; pageSize: number }> {
    const { page = 1, pageSize = 10, status, categoryId, keyword } = params;
    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['sort', 'ASC'], ['id', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateProductStatus(id: number, status: ProductStatus): Promise<Product> {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    await product.update({ status });
    return product;
  }

  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return await Product.findAll({
      where: { categoryId, status: ProductStatus.ON_SHELF },
      order: [['sort', 'ASC']]
    });
  }

  async hasActiveProducts(categoryId: number): Promise<boolean> {
    const count = await Product.count({
      where: { categoryId, status: ProductStatus.ON_SHELF }
    });
    return count > 0;
  }
}

export default new ProductService();

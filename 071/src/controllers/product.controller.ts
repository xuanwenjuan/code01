import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProductStatus } from '../models/Product.model';

class ProductController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body);
      return ResponseUtil.success(res, product, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(Number(id), req.body);
      return ResponseUtil.success(res, product, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(Number(id));
      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(Number(id));
      return ResponseUtil.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, status, categoryId, keyword } = req.query;
      const result = await productService.getProductList({
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status !== undefined ? Number(status) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        keyword: keyword as string | undefined
      });
      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const product = await productService.updateProductStatus(Number(id), status);
      return ResponseUtil.success(res, product, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  async getByCategoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategoryId(Number(categoryId));
      return ResponseUtil.success(res, products);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();

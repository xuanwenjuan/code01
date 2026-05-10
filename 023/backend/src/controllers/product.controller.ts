import { Request, Response } from 'express';
import productService from '../services/product.service';
import { Product, ApiResponse, ProductFilter } from '../types';

export const getProducts = async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const filter: ProductFilter = {};
    const query = req.query;
    
    if (query.keyword) filter.keyword = query.keyword as string;
    if (query.category_id) filter.category_id = parseInt(query.category_id as string);
    if (query.quality_level) filter.quality_level = query.quality_level as string;
    if (query.min_price) filter.min_price = parseFloat(query.min_price as string);
    if (query.max_price) filter.max_price = parseFloat(query.max_price as string);
    if (query.min_stock) filter.min_stock = parseInt(query.min_stock as string);
    if (query.max_stock) filter.max_stock = parseInt(query.max_stock as string);
    if (query.supplier) filter.supplier = query.supplier as string;
    if (query.is_low_stock) filter.is_low_stock = query.is_low_stock === 'true';
    if (query.is_aging) filter.is_aging = query.is_aging === 'true';

    const products = await productService.getAllProducts(filter);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取产品列表失败' });
  }
};

export const getProduct = async (req: Request, res: Response<ApiResponse<Product | null>>) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取产品失败' });
  }
};

export const createProduct = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const product = await productService.createProduct(req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建产品失败' });
  }
};

export const updateProduct = async (req: Request, res: Response<ApiResponse<Product>>) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.updateProduct(id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新产品失败' });
  }
};

export const deleteProduct = async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const id = parseInt(req.params.id);
    await productService.deleteProduct(id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除产品失败' });
  }
};

export const getLowStockProducts = async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const products = await productService.getLowStockProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取低库存产品失败' });
  }
};

export const getAgingProducts = async (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const products = await productService.getAgingProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取临期产品失败' });
  }
};

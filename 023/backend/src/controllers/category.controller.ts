import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { Category, ApiResponse } from '../types';

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export const getCategories = async (req: Request, res: Response<ApiResponse<Category[]>>) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类列表失败', error);
    res.status(500).json({ success: false, message: '获取分类列表失败' });
  }
};

export const getCategoriesTree = async (req: Request, res: Response<ApiResponse<CategoryTreeNode[]>>) => {
  try {
    const tree = await categoryService.getCategoriesWithTree();
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('获取分类树失败', error);
    res.status(500).json({ success: false, message: '获取分类树失败' });
  }
};

export const getCategory = async (req: Request, res: Response<ApiResponse<Category | null>>) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.getCategoryById(id);
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取分类失败' });
  }
};

export const createCategory = async (req: Request, res: Response<ApiResponse<Category>>) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建分类失败' });
  }
};

export const updateCategory = async (req: Request, res: Response<ApiResponse<Category>>) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.updateCategory(id, req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新分类失败' });
  }
};

export const deleteCategory = async (req: Request, res: Response<ApiResponse<void>>) => {
  try {
    const id = parseInt(req.params.id);
    await categoryService.deleteCategory(id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除分类失败' });
  }
};

import { Response } from 'express';
import { categoryService } from '../services/category.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { CategoryStatus } from '../constants/business';

export class CategoryController {
  async create(req: AuthRequest, res: Response) {
    const { name, description, parentId, sort } = req.body;
    const category = await categoryService.createCategory({
      name,
      description,
      parentId,
      sort,
    });
    return ResponseUtil.success(res, category);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, description, parentId, sort, status } = req.body;
    const category = await categoryService.updateCategory(Number(id), {
      name,
      description,
      parentId,
      sort,
      status,
    });
    return ResponseUtil.success(res, category);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await categoryService.deleteCategory(Number(id));
    return ResponseUtil.success(res, null, '删除成功');
  }

  async get(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const category = await categoryService.getCategory(Number(id));
    return ResponseUtil.success(res, category);
  }

  async getTree(req: AuthRequest, res: Response) {
    const { status } = req.query;
    const tree = await categoryService.getCategoryTree(status as CategoryStatus);
    return ResponseUtil.success(res, tree);
  }

  async getList(req: AuthRequest, res: Response) {
    const { page, pageSize, name, status } = req.query;
    const result = await categoryService.getCategoryList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      name: name as string,
      status: status as CategoryStatus,
    });
    return ResponseUtil.success(res, result);
  }
}

export const categoryController = new CategoryController();

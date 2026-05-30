import { Request, Response } from 'express';
import CategoryService from '../services/CategoryService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

class CategoryController {
  async createCategory(req: AuthRequest, res: Response) {
    const category = await CategoryService.createCategory(req.body);
    return ResponseUtil.created(res, category, '类目创建成功');
  }

  async updateCategory(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const category = await CategoryService.updateCategory(Number(id), req.body);
    return ResponseUtil.success(res, category, '类目更新成功');
  }

  async deleteCategory(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await CategoryService.deleteCategory(Number(id));
    return ResponseUtil.success(res, null, '类目删除成功');
  }

  async getCategoryById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(Number(id));
    return ResponseUtil.success(res, category);
  }

  async getCategoryTree(req: Request, res: Response) {
    const { includeOffline } = req.query;
    const tree = await CategoryService.getCategoryTree(includeOffline === 'true');
    return ResponseUtil.success(res, tree);
  }

  async getCategoryPath(req: Request, res: Response) {
    const { id } = req.params;
    const path = await CategoryService.getCategoryPath(Number(id));
    return ResponseUtil.success(res, path);
  }

  async getCategoryList(req: Request, res: Response) {
    const { page, pageSize, name, status, parentId } = req.query;
    const result = await CategoryService.getCategoryList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      name: name as string,
      status: status !== undefined ? Number(status) : undefined,
      parentId: parentId !== undefined ? Number(parentId) : undefined
    });
    return ResponseUtil.paginated(res, result);
  }

  async updateCategoryStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const category = await CategoryService.updateCategoryStatus(Number(id), status);
    return ResponseUtil.success(res, category, '状态更新成功');
  }
}

export default new CategoryController();
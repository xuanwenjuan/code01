import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import categoryService from '../services/category.service';

class CategoryController {
  async create(req: Request, res: Response) {
    const result = await categoryService.create(req.body);
    return ResponseUtil.success(res, result, '创建成功');
  }

  async update(req: Request, res: Response) {
    const result = await categoryService.update({
      id: parseInt(req.params.id),
      ...req.body
    });
    return ResponseUtil.success(res, result, '更新成功');
  }

  async archive(req: Request, res: Response) {
    const result = await categoryService.archive(parseInt(req.params.id));
    return ResponseUtil.success(res, result, '归档成功');
  }

  async unarchive(req: Request, res: Response) {
    const result = await categoryService.unarchive(parseInt(req.params.id));
    return ResponseUtil.success(res, result, '取消归档成功');
  }

  async delete(req: Request, res: Response) {
    await categoryService.delete(parseInt(req.params.id));
    return ResponseUtil.success(res, null, '删除成功');
  }

  async getById(req: Request, res: Response) {
    const result = await categoryService.getById(parseInt(req.params.id));
    return ResponseUtil.success(res, result);
  }

  async getTree(req: Request, res: Response) {
    const result = await categoryService.getTree();
    return ResponseUtil.success(res, result);
  }

  async getList(req: Request, res: Response) {
    const result = await categoryService.getList(req.query);
    return ResponseUtil.success(res, result);
  }
}

export default new CategoryController();
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import materialService from '../services/material.service';
import { AuthRequest } from '../middlewares/auth';

class MaterialController {
  async create(req: Request, res: Response) {
    const result = await materialService.create(req.body);
    return ResponseUtil.success(res, result, '创建成功');
  }

  async update(req: Request, res: Response) {
    const result = await materialService.update({
      id: parseInt(req.params.id),
      ...req.body
    });
    return ResponseUtil.success(res, result, '更新成功');
  }

  async delete(req: Request, res: Response) {
    await materialService.delete(parseInt(req.params.id));
    return ResponseUtil.success(res, null, '删除成功');
  }

  async getById(req: Request, res: Response) {
    const result = await materialService.getById(parseInt(req.params.id));
    return ResponseUtil.success(res, result);
  }

  async getList(req: Request, res: Response) {
    const result = await materialService.getList(req.query);
    return ResponseUtil.success(res, result);
  }

  async stockIn(req: AuthRequest, res: Response) {
    const result = await materialService.stockIn({
      ...req.body,
      operatorId: req.user!.id
    });
    return ResponseUtil.success(res, result, '入库成功');
  }

  async stockOut(req: AuthRequest, res: Response) {
    const result = await materialService.stockOut({
      ...req.body,
      operatorId: req.user!.id
    });
    return ResponseUtil.success(res, result, '出库成功');
  }

  async getStockLogs(req: Request, res: Response) {
    const result = await materialService.getStockLogs(req.query);
    return ResponseUtil.success(res, result);
  }
}

export default new MaterialController();
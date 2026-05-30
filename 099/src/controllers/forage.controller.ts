import { Response } from 'express';
import { forageService } from '../services/forage.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { operationLogService } from '../services/operationLog.service';

export const forageController = {
  async createCategory(req: AuthRequest, res: Response) {
    const result = await forageService.createCategory(req.body);
    await operationLogService.logCategoryOperation(
      req.user!.id,
      req.user!.username,
      'create',
      result.id,
      result.name
    );
    res.json(ResponseUtil.success(result, '创建成功'));
  },

  async getCategoryTree(req: AuthRequest, res: Response) {
    const type = req.query.type as any;
    const result = await forageService.getCategoryTree(type);
    res.json(ResponseUtil.success(result));
  },

  async getCategories(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const type = req.query.type as any;
    const status = req.query.status as any;
    
    const result = await forageService.getCategories(page, pageSize, type, status);
    res.json(ResponseUtil.success(result));
  },

  async getCategory(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageService.getCategoryById(id);
    res.json(ResponseUtil.success(result));
  },

  async updateCategory(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageService.updateCategory(id, req.body);
    await operationLogService.logCategoryOperation(
      req.user!.id,
      req.user!.username,
      'update',
      result.id,
      result.name
    );
    res.json(ResponseUtil.success(result, '更新成功'));
  },

  async deleteCategory(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const category = await forageService.getCategoryById(id);
    await forageService.deleteCategory(id);
    await operationLogService.logCategoryOperation(
      req.user!.id,
      req.user!.username,
      'delete',
      id,
      category.name
    );
    res.json(ResponseUtil.success(null, '删除成功'));
  },

  async updateInventory(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const { quantity, unitPrice } = req.body;
    const result = await forageService.updateInventory(id, quantity, unitPrice);
    const category = await forageService.getCategoryById(id);
    await operationLogService.logInventoryOperation(
      req.user!.id,
      req.user!.username,
      quantity > 0 ? 'inbound' : 'outbound',
      id,
      category.name,
      Math.abs(quantity)
    );
    res.json(ResponseUtil.success(result, '库存更新成功'));
  }
};

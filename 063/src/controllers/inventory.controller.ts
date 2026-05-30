import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import inventoryService from '../services/inventory.service';
import { AuthRequest } from '../middlewares/auth';

class InventoryController {
  async create(req: AuthRequest, res: Response) {
    const result = await inventoryService.create({
      ...req.body,
      operatorId: req.user!.id
    });
    return ResponseUtil.success(res, result, '创建成功');
  }

  async updateItems(req: Request, res: Response) {
    const result = await inventoryService.updateItems({
      id: parseInt(req.params.id),
      items: req.body.items
    });
    return ResponseUtil.success(res, result, '更新成功');
  }

  async confirm(req: Request, res: Response) {
    const result = await inventoryService.confirm(parseInt(req.params.id));
    return ResponseUtil.success(res, result, '确认成功');
  }

  async complete(req: AuthRequest, res: Response) {
    const result = await inventoryService.complete(
      parseInt(req.params.id),
      req.user!.id
    );
    return ResponseUtil.success(res, result, '完成成功');
  }

  async getById(req: Request, res: Response) {
    const result = await inventoryService.getById(parseInt(req.params.id));
    return ResponseUtil.success(res, result);
  }

  async getList(req: Request, res: Response) {
    const result = await inventoryService.getList(req.query);
    return ResponseUtil.success(res, result);
  }

  async recordLoss(req: AuthRequest, res: Response) {
    const result = await inventoryService.recordLoss(
      req.body.materialId,
      req.body.quantity,
      req.user!.id,
      req.body.remark
    );
    return ResponseUtil.success(res, result, '损耗登记成功');
  }
}

export default new InventoryController();
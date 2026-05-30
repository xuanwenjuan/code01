import { Response } from 'express';
import { purchaseService } from '../services/purchase.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { PurchaseOrderStatus } from '../constants/business';

export class PurchaseController {
  async create(req: AuthRequest, res: Response) {
    const data = req.body;
    data.purchaserId = req.user?.id;
    const order = await purchaseService.createPurchaseOrder(data);
    return ResponseUtil.success(res, order);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const order = await purchaseService.updatePurchaseOrder(Number(id), req.body);
    return ResponseUtil.success(res, order);
  }

  async accept(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const order = await purchaseService.acceptOrder(Number(id));
    return ResponseUtil.success(res, order);
  }

  async confirmArrival(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const order = await purchaseService.confirmArrival(Number(id));
    return ResponseUtil.success(res, order);
  }

  async inspect(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = req.body;
    data.inspectorId = req.user?.id;
    const order = await purchaseService.inspectOrder(Number(id), data);
    return ResponseUtil.success(res, order);
  }

  async inbound(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = req.body;
    data.operatorId = req.user?.id;
    const order = await purchaseService.inboundOrder(Number(id), data);
    return ResponseUtil.success(res, order);
  }

  async reject(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { remark } = req.body;
    const order = await purchaseService.rejectOrder(Number(id), remark);
    return ResponseUtil.success(res, order);
  }

  async get(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const order = await purchaseService.getPurchaseOrder(Number(id));
    return ResponseUtil.success(res, order);
  }

  async getList(req: AuthRequest, res: Response) {
    const { page, pageSize, orderNo, supplierId, status } = req.query;
    const result = await purchaseService.getPurchaseOrderList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      orderNo: orderNo as string,
      supplierId: supplierId ? Number(supplierId) : undefined,
      status: status as PurchaseOrderStatus,
    });
    return ResponseUtil.success(res, result);
  }
}

export const purchaseController = new PurchaseController();

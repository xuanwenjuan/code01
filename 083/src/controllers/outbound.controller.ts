import { Response } from 'express';
import { outboundService } from '../services/outbound.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { OutboundOrderStatus } from '../constants/business';

export class OutboundController {
  async create(req: AuthRequest, res: Response) {
    const data = req.body;
    data.technicianId = req.user?.id;
    const order = await outboundService.createOutboundOrder(data);
    return ResponseUtil.success(res, order);
  }

  async approve(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const approverId = req.user?.id!;
    const order = await outboundService.approveOrder(Number(id), approverId);
    return ResponseUtil.success(res, order);
  }

  async confirmOutbound(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const operatorId = req.user?.id!;
    const order = await outboundService.confirmOutbound(Number(id), operatorId);
    return ResponseUtil.success(res, order);
  }

  async scrap(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = req.body;
    data.operatorId = req.user?.id;
    const order = await outboundService.scrapParts(Number(id), data);
    return ResponseUtil.success(res, order);
  }

  async return(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = req.body;
    data.operatorId = req.user?.id;
    const order = await outboundService.returnParts(Number(id), data);
    return ResponseUtil.success(res, order);
  }

  async get(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const order = await outboundService.getOutboundOrder(Number(id));
    return ResponseUtil.success(res, order);
  }

  async getList(req: AuthRequest, res: Response) {
    const {
      page,
      pageSize,
      orderNo,
      technicianId,
      status,
      vehiclePlate,
      startDate,
      endDate,
    } = req.query;
    const result = await outboundService.getOutboundOrderList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      orderNo: orderNo as string,
      technicianId: technicianId ? Number(technicianId) : undefined,
      status: status as OutboundOrderStatus,
      vehiclePlate: vehiclePlate as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    return ResponseUtil.success(res, result);
  }

  async getStatistics(req: AuthRequest, res: Response) {
    const { startDate, endDate, categoryId } = req.query;
    const result = await outboundService.getOutboundStatistics({
      startDate: startDate as string,
      endDate: endDate as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
    });
    return ResponseUtil.success(res, result);
  }
}

export const outboundController = new OutboundController();

import { Request, Response } from 'express';
import WorkOrderService from '../services/WorkOrderService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { WorkOrderStatus, WorkOrderType } from '../models/WorkOrder';

class WorkOrderController {
  async createWorkOrder(req: AuthRequest, res: Response) {
    const workOrder = await WorkOrderService.createWorkOrder({
      ...req.body,
      createdBy: req.user!.id
    });
    return ResponseUtil.created(res, workOrder, '工单创建成功');
  }

  async updateWorkOrder(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.updateWorkOrder(Number(id), req.body);
    return ResponseUtil.success(res, workOrder, '工单更新成功');
  }

  async getWorkOrderById(req: Request, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.getWorkOrderById(Number(id));
    return ResponseUtil.success(res, workOrder);
  }

  async getWorkOrderList(req: Request, res: Response) {
    const { page, pageSize, orderNo, type, status, customerName, repairerId } = req.query;
    const result = await WorkOrderService.getWorkOrderList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      orderNo: orderNo as string,
      type: type as WorkOrderType,
      status: status as WorkOrderStatus,
      customerName: customerName as string,
      repairerId: repairerId ? Number(repairerId) : undefined
    });
    return ResponseUtil.paginated(res, result);
  }

  async getMyWorkOrders(req: AuthRequest, res: Response) {
    const { page, pageSize, status } = req.query;
    const result = await WorkOrderService.getMyWorkOrders(req.user!.id, {
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      status: status as WorkOrderStatus
    });
    return ResponseUtil.paginated(res, result);
  }

  async submitInspection(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { inspectionReport } = req.body;
    const workOrder = await WorkOrderService.submitInspection(Number(id), inspectionReport, req.user!.id);
    return ResponseUtil.success(res, workOrder, '提交检测成功');
  }

  async submitQuotation(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { estimatedCost, quotationExpireTime } = req.body;
    const workOrder = await WorkOrderService.submitQuotation(
      Number(id),
      estimatedCost,
      quotationExpireTime ? new Date(quotationExpireTime) : undefined,
      req.user!.id
    );
    return ResponseUtil.success(res, workOrder, '提交报价成功');
  }

  async confirmQuotation(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.confirmQuotation(Number(id), req.user!.id);
    return ResponseUtil.success(res, workOrder, '报价确认成功');
  }

  async rejectQuotation(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.rejectQuotation(Number(id), req.user!.id);
    return ResponseUtil.success(res, workOrder, '报价已拒绝');
  }

  async startRepair(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.startRepair(Number(id), req.user!.id);
    return ResponseUtil.success(res, workOrder, '开始维修');
  }

  async completeRepair(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { repairDescription, actualCost, laborFee, partsFee } = req.body;
    const workOrder = await WorkOrderService.completeRepair(
      Number(id),
      repairDescription,
      actualCost,
      laborFee,
      partsFee,
      req.user!.id
    );
    return ResponseUtil.success(res, workOrder, '维修完成');
  }

  async deliverToCustomer(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.deliverToCustomer(Number(id), req.user!.id);
    return ResponseUtil.success(res, workOrder, '已交付客户');
  }

  async putOnConsign(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { commissionRate } = req.body;
    const workOrder = await WorkOrderService.putOnConsign(Number(id), commissionRate, req.user!.id);
    return ResponseUtil.success(res, workOrder, '已上架寄卖');
  }

  async markAsSold(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { salePrice, commissionAmount } = req.body;
    const workOrder = await WorkOrderService.markAsSold(Number(id), salePrice, commissionAmount, req.user!.id);
    return ResponseUtil.success(res, workOrder, '已标记售出');
  }

  async cancelWorkOrder(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const workOrder = await WorkOrderService.cancelWorkOrder(Number(id), req.user!.id);
    return ResponseUtil.success(res, workOrder, '工单已取消');
  }

  async assignRepairer(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { repairerId } = req.body;
    const workOrder = await WorkOrderService.assignRepairer(Number(id), repairerId);
    return ResponseUtil.success(res, workOrder, '维修师分配成功');
  }
}

export default new WorkOrderController();
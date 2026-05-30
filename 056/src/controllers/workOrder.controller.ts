import { Request, Response } from 'express';
import workOrderService from '../services/workOrder.service';
import ResponseUtil from '../utils/response';
import { WorkOrderStatus } from '../types';
import asyncHandler from '../middleware/asyncHandler.middleware';

export class WorkOrderController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = {
      ...req.body,
      reportedBy: req.user!.userId,
    };
    const order = await workOrderService.create(data);
    ResponseUtil.success(res, order, '创建成功');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await workOrderService.update(Number(id), req.body);
    ResponseUtil.success(res, order, '更新成功');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await workOrderService.delete(Number(id));
    ResponseUtil.success(res, null, '删除成功');
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await workOrderService.findById(Number(id));
    ResponseUtil.success(res, order, '查询成功');
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const { title, orderNo, equipmentId, assignedTo, reportedBy, status, type, priority, startDate, endDate, page, pageSize } = req.query;
    const result = await workOrderService.findAll({
      title: title as string,
      orderNo: orderNo as string,
      equipmentId: equipmentId ? Number(equipmentId) : undefined,
      assignedTo: assignedTo ? Number(assignedTo) : undefined,
      reportedBy: reportedBy ? Number(reportedBy) : undefined,
      status: status as WorkOrderStatus,
      type: type as string,
      priority: priority as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  });

  assign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const assignerRole = req.user!.role;
    const order = await workOrderService.assign(Number(id), req.body, assignerRole);
    ResponseUtil.success(res, order, '指派成功');
  });

  start = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const order = await workOrderService.start(Number(id), userId, userRole);
    ResponseUtil.success(res, order, '开始维修成功');
  });

  complete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const order = await workOrderService.complete(Number(id), req.body, userId, userRole);
    ResponseUtil.success(res, order, '完成维修成功');
  });

  accept = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user!.role;
    const data = {
      ...req.body,
      acceptedBy: req.user!.userId,
    };
    const order = await workOrderService.accept(Number(id), data, userRole);
    ResponseUtil.success(res, order, '验收成功');
  });

  close = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userRole = req.user!.role;
    const data = {
      ...req.body,
      closedBy: req.user!.userId,
    };
    const order = await workOrderService.close(Number(id), data, userRole);
    ResponseUtil.success(res, order, '关闭成功');
  });

  getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { status, page, pageSize } = req.query;
    const result = await workOrderService.getMyOrders(userId, {
      status: status as WorkOrderStatus,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  });

  getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const statistics = await workOrderService.getStatistics();
    ResponseUtil.success(res, statistics, '查询成功');
  });

  getStatisticsByType = asyncHandler(async (req: Request, res: Response) => {
    const statistics = await workOrderService.getStatisticsByType();
    ResponseUtil.success(res, statistics, '查询成功');
  });
}

export default new WorkOrderController();

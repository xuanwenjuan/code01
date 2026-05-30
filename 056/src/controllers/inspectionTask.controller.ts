import { Request, Response } from 'express';
import inspectionTaskService from '../services/inspectionTask.service';
import ResponseUtil from '../utils/response';
import { InspectionStatus } from '../types';
import asyncHandler from '../middleware/asyncHandler.middleware';

export class InspectionTaskController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const task = await inspectionTaskService.create(req.body);
    ResponseUtil.success(res, task, '创建成功');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await inspectionTaskService.update(Number(id), req.body);
    ResponseUtil.success(res, task, '更新成功');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await inspectionTaskService.delete(Number(id));
    ResponseUtil.success(res, null, '删除成功');
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await inspectionTaskService.findById(Number(id));
    ResponseUtil.success(res, task, '查询成功');
  });

  findAll = asyncHandler(async (req: Request, res: Response) => {
    const { title, taskNo, equipmentId, inspectorId, status, startDate, endDate, page, pageSize } = req.query;
    const result = await inspectionTaskService.findAll({
      title: title as string,
      taskNo: taskNo as string,
      equipmentId: equipmentId ? Number(equipmentId) : undefined,
      inspectorId: inspectorId ? Number(inspectorId) : undefined,
      status: status as InspectionStatus,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  });

  startTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const task = await inspectionTaskService.startTask(Number(id), userId, userRole);
    ResponseUtil.success(res, task, '开始巡检成功');
  });

  submitResult = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const data = {
      ...req.body,
      completedBy: userId,
    };
    const task = await inspectionTaskService.submitResult(Number(id), data, userRole);
    ResponseUtil.success(res, task, '提交结果成功');
  });

  getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const statistics = await inspectionTaskService.getStatistics();
    ResponseUtil.success(res, statistics, '查询成功');
  });

  getMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { status, page, pageSize } = req.query;
    const result = await inspectionTaskService.getMyTasks(userId, {
      status: status as InspectionStatus,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    ResponseUtil.paginated(res, result.list, result.total, result.page, result.pageSize);
  });
}

export default new InspectionTaskController();

import { Response } from 'express';
import { forageApplicationService } from '../services/application.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { operationLogService } from '../services/operationLog.service';

export const applicationController = {
  async createApplication(req: AuthRequest, res: Response) {
    const result = await forageApplicationService.createApplication(req.body);
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'create',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '申领单创建成功'));
  },

  async getApplications(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as any;
    const stableId = req.query.stableId ? parseInt(req.query.stableId as string) : undefined;
    const trainerId = req.query.trainerId ? parseInt(req.query.trainerId as string) : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const result = await forageApplicationService.getApplications(page, pageSize, status, stableId, trainerId, startDate, endDate);
    res.json(ResponseUtil.success(result));
  },

  async getApplication(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.getApplicationById(id);
    res.json(ResponseUtil.success(result));
  },

  async approveApplication(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.approveApplication(id, {
      approvedBy: req.user!.id,
      items: req.body.items
    });
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'approve',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '审批成功'));
  },

  async deliverApplication(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.deliverApplication(id, {
      deliveredBy: req.user!.id,
      items: req.body.items
    });
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'deliver',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '出库成功'));
  },

  async returnItems(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.returnItems(id, req.body.items);
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'return',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '退料成功'));
  },

  async reportDamage(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.reportDamage(id, req.body.items);
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'damage',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '报损成功'));
  },

  async completeApplication(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.completeApplication(id);
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'complete',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '完成成功'));
  },

  async rejectApplication(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const result = await forageApplicationService.rejectApplication(id, req.user!.id, reason);
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'reject',
      result.id,
      result.applicationNo,
      reason
    );
    res.json(ResponseUtil.success(result, '驳回成功'));
  },

  async cancelApplication(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const result = await forageApplicationService.cancelApplication(id);
    await operationLogService.logApplicationOperation(
      req.user!.id,
      req.user!.username,
      'cancel',
      result.id,
      result.applicationNo
    );
    res.json(ResponseUtil.success(result, '取消成功'));
  },

  async getStatistics(req: AuthRequest, res: Response) {
    const params: any = {};
    if (req.query.startDate) params.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) params.endDate = new Date(req.query.endDate as string);
    if (req.query.stableId) params.stableId = parseInt(req.query.stableId as string);
    
    const result = await forageApplicationService.getApplicationStatistics(params);
    res.json(ResponseUtil.success(result));
  }
};

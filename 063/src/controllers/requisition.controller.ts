import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import requisitionService from '../services/requisition.service';
import { AuthRequest } from '../middlewares/auth';

class RequisitionController {
  async create(req: AuthRequest, res: Response) {
    const result = await requisitionService.create({
      ...req.body,
      applicantId: req.user!.id,
      departmentId: req.user!.departmentId
    });
    return ResponseUtil.success(res, result, '创建成功');
  }

  async submit(req: AuthRequest, res: Response) {
    const result = await requisitionService.submit(
      parseInt(req.params.id),
      req.user!.id
    );
    return ResponseUtil.success(res, result, '提交成功');
  }

  async approve(req: AuthRequest, res: Response) {
    const result = await requisitionService.approve(
      {
        id: parseInt(req.params.id),
        approverId: req.user!.id,
        rejectReason: req.body.rejectReason
      },
      req.user!.roleId
    );
    return ResponseUtil.success(res, result, req.body.rejectReason ? '驳回成功' : '审批成功');
  }

  async deliver(req: AuthRequest, res: Response) {
    const result = await requisitionService.deliver({
      id: parseInt(req.params.id),
      delivererId: req.user!.id
    });
    return ResponseUtil.success(res, result, '发放成功');
  }

  async cancel(req: AuthRequest, res: Response) {
    const result = await requisitionService.cancel(
      parseInt(req.params.id),
      req.user!.id
    );
    return ResponseUtil.success(res, result, '取消成功');
  }

  async getById(req: Request, res: Response) {
    const result = await requisitionService.getById(parseInt(req.params.id));
    return ResponseUtil.success(res, result);
  }

  async getList(req: AuthRequest, res: Response) {
    const result = await requisitionService.getList({
      ...req.query,
      applicantId: req.user!.id
    });
    return ResponseUtil.success(res, result);
  }
}

export default new RequisitionController();
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import alertService from '../services/alert.service';
import { AuthRequest } from '../middlewares/auth';
import { RoleCode } from '../types';

class AlertController {
  async getList(req: Request, res: Response) {
    const result = await alertService.getLowStockAlerts(req.query);
    return ResponseUtil.success(res, result);
  }

  async getById(req: Request, res: Response) {
    const result = await alertService.getById(parseInt(req.params.id));
    return ResponseUtil.success(res, result);
  }

  async processAlert(req: AuthRequest, res: Response) {
    const result = await alertService.processAlert(
      parseInt(req.params.id),
      req.user!.id,
      req.body.remark
    );
    return ResponseUtil.success(res, result, '处理成功');
  }

  async ignoreAlert(req: AuthRequest, res: Response) {
    const result = await alertService.ignoreAlert(
      parseInt(req.params.id),
      req.user!.id,
      req.body.remark
    );
    return ResponseUtil.success(res, result, '忽略成功');
  }

  async getPendingCount(req: Request, res: Response) {
    const result = await alertService.getPendingCount();
    return ResponseUtil.success(res, { count: result });
  }

  async batchProcess(req: AuthRequest, res: Response) {
    const result = await alertService.batchProcess(
      req.body.ids,
      req.user!.id,
      req.body.remark
    );
    return ResponseUtil.success(res, { affected: result[0] }, '批量处理成功');
  }
}

export default new AlertController();

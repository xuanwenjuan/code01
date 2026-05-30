import { Request, Response, NextFunction } from 'express';
import operationLogService from '../services/operationLog.service';
import { ResponseUtil } from '../utils/response';

class OperationLogController {
  async getLogList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
      };
      const result = await operationLogService.getLogs(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export default new OperationLogController();

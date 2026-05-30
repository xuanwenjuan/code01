import { Request, Response, NextFunction } from 'express';
import consumableRecordService from '../services/consumableRecord.service';
import { ResponseUtil } from '../utils/response';

class ConsumableRecordController {
  async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId
      };
      const record = await consumableRecordService.createRecord(data, req);
      res.json(ResponseUtil.success(record, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  async batchOutbound(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user?.userId
      };
      const records = await consumableRecordService.batchOutbound(data, req);
      res.json(ResponseUtil.success(records, '批量出库成功'));
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await consumableRecordService.updateRecord(Number(id), req.body, req);
      res.json(ResponseUtil.success(record, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await consumableRecordService.deleteRecord(Number(id), req);
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  async getRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await consumableRecordService.getRecordById(Number(id));
      res.json(ResponseUtil.success(record));
    } catch (error) {
      next(error);
    }
  }

  async getRecordList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
      };
      const result = await consumableRecordService.getRecordList(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getInventoryList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        lowStock: req.query.lowStock === 'true'
      };
      const result = await consumableRecordService.getInventoryList(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getInventoryStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const statistics = await consumableRecordService.getInventoryStatistics();
      res.json(ResponseUtil.success(statistics));
    } catch (error) {
      next(error);
    }
  }

  async getConsumptionBySite(req: Request, res: Response, next: NextFunction) {
    try {
      const siteId = req.query.siteId ? Number(req.query.siteId) : undefined;
      const statistics = await consumableRecordService.getConsumptionBySite(siteId);
      res.json(ResponseUtil.success(statistics));
    } catch (error) {
      next(error);
    }
  }

  async getConsumptionByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const statistics = await consumableRecordService.getConsumptionByCategory(categoryId);
      res.json(ResponseUtil.success(statistics));
    } catch (error) {
      next(error);
    }
  }

  async getConsumptionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new Error('开始日期和结束日期不能为空');
      }
      const report = await consumableRecordService.getConsumptionReport(
        startDate as string,
        endDate as string
      );
      res.json(ResponseUtil.success(report));
    } catch (error) {
      next(error);
    }
  }
}

export default new ConsumableRecordController();

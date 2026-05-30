import { Response } from 'express';
import { stockService } from '../services/stock.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { StockLogType } from '../models/stockLog.model';

export class StockController {
  async getStockList(req: AuthRequest, res: Response) {
    const { page, pageSize, partId, supplierId, batchNo } = req.query;
    const result = await stockService.getStockList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      partId: partId ? Number(partId) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
      batchNo: batchNo as string,
    });
    return ResponseUtil.success(res, result);
  }

  async getStockLogList(req: AuthRequest, res: Response) {
    const { page, pageSize, partId, type, startDate, endDate } = req.query;
    const result = await stockService.getStockLogList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      partId: partId ? Number(partId) : undefined,
      type: type as StockLogType,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    return ResponseUtil.success(res, result);
  }

  async adjustStock(req: AuthRequest, res: Response) {
    const data = req.body;
    data.operatorId = req.user?.id;
    await stockService.adjustStock(data);
    return ResponseUtil.success(res, null, '调整成功');
  }
}

export const stockController = new StockController();

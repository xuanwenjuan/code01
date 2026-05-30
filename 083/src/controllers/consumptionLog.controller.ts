import { Response } from 'express';
import { consumptionLogService } from '../services/consumptionLog.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';
import { RoleCode } from '../constants/role';

export class ConsumptionLogController {
  async getLogList(req: AuthRequest, res: Response) {
    const { page, pageSize, partId, categoryId, technicianId, vehiclePlate, repairOrderNo, startDate, endDate } = req.query;
    const result = await consumptionLogService.getConsumptionLogList({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      partId: partId ? Number(partId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      technicianId: technicianId ? Number(technicianId) : undefined,
      vehiclePlate: vehiclePlate as string,
      repairOrderNo: repairOrderNo as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    return ResponseUtil.success(res, result);
  }

  async getStatistics(req: AuthRequest, res: Response) {
    const { startDate, endDate, categoryId, technicianId, groupBy } = req.query;
    const result = await consumptionLogService.getConsumptionStatistics({
      startDate: startDate as string,
      endDate: endDate as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
      technicianId: technicianId ? Number(technicianId) : undefined,
      groupBy: groupBy as 'category' | 'technician' | 'vehicle',
    });
    return ResponseUtil.success(res, result);
  }
}

export const consumptionLogController = new ConsumptionLogController();

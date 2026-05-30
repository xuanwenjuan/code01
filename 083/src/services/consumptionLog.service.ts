import { ConsumptionLog } from '../models/consumptionLog.model';
import { Op } from 'sequelize';
import { Part } from '../models/part.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';

export class ConsumptionLogService {
  async createConsumptionLog(data: {
    partId: number;
    categoryId: number;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    vehicleModel?: string;
    vehiclePlate?: string;
    repairOrderNo?: string;
    technicianId: number;
    remark?: string;
  }) {
    return await ConsumptionLog.create({
      ...data,
      consumptionDate: new Date(),
    });
  }

  async getConsumptionLogList(params: {
    page?: number;
    pageSize?: number;
    partId?: number;
    categoryId?: number;
    technicianId?: number;
    vehiclePlate?: string;
    repairOrderNo?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, partId, categoryId, technicianId, vehiclePlate, repairOrderNo, startDate, endDate } = params;
    const where: any = {};

    if (partId) {
      where.partId = partId;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (technicianId) {
      where.technicianId = technicianId;
    }
    if (vehiclePlate) {
      where.vehiclePlate = { [Op.like]: `%${vehiclePlate}%` };
    }
    if (repairOrderNo) {
      where.repairOrderNo = { [Op.like]: `%${repairOrderNo}%` };
    }
    if (startDate || endDate) {
      where.consumptionDate = {};
      if (startDate) {
        where.consumptionDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.consumptionDate[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await ConsumptionLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [Part, Category, { model: User, as: 'technician' }],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getConsumptionStatistics(params: {
    startDate: string;
    endDate: string;
    categoryId?: number;
    technicianId?: number;
    groupBy?: 'category' | 'technician' | 'vehicle';
  }) {
    const { startDate, endDate, categoryId, technicianId, groupBy } = params;
    const where: any = {
      consumptionDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (technicianId) {
      where.technicianId = technicianId;
    }

    const logs = await ConsumptionLog.findAll({
      where,
      include: [Part, Category, { model: User, as: 'technician' }],
    });

    const totalQuantity = logs.reduce((sum, log) => sum + log.quantity, 0);
    const totalAmount = logs.reduce((sum, log) => sum + parseFloat(log.totalAmount as any), 0);

    let groupedData: any[] = [];
    if (groupBy === 'category') {
      const categoryMap = new Map<number, { categoryId: number; categoryName: string; quantity: number; amount: number }>();
      for (const log of logs) {
        const catId = log.categoryId;
        const catName = (log as any).category?.name || '未分类';
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, { categoryId: catId, categoryName: catName, quantity: 0, amount: 0 });
        }
        const stat = categoryMap.get(catId)!;
        stat.quantity += log.quantity;
        stat.amount += parseFloat(log.totalAmount as any);
      }
      groupedData = Array.from(categoryMap.values());
    } else if (groupBy === 'technician') {
      const techMap = new Map<number, { technicianId: number; technicianName: string; quantity: number; amount: number }>();
      for (const log of logs) {
        const techId = log.technicianId;
        const techName = (log as any).technician?.realName || '未知';
        if (!techMap.has(techId)) {
          techMap.set(techId, { technicianId: techId, technicianName: techName, quantity: 0, amount: 0 });
        }
        const stat = techMap.get(techId)!;
        stat.quantity += log.quantity;
        stat.amount += parseFloat(log.totalAmount as any);
      }
      groupedData = Array.from(techMap.values());
    } else if (groupBy === 'vehicle') {
      const vehicleMap = new Map<string, { vehiclePlate: string; quantity: number; amount: number }>();
      for (const log of logs) {
        const plate = log.vehiclePlate || '未记录';
        if (!vehicleMap.has(plate)) {
          vehicleMap.set(plate, { vehiclePlate: plate, quantity: 0, amount: 0 });
        }
        const stat = vehicleMap.get(plate)!;
        stat.quantity += log.quantity;
        stat.amount += parseFloat(log.totalAmount as any);
      }
      groupedData = Array.from(vehicleMap.values());
    }

    return {
      totalQuantity,
      totalAmount,
      totalRecords: logs.length,
      groupedData,
    };
  }
}

export const consumptionLogService = new ConsumptionLogService();

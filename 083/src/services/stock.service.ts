import { Stock } from '../models/stock.model';
import { StockLog, StockLogType } from '../models/stockLog.model';
import { Part } from '../models/part.model';
import { Supplier } from '../models/supplier.model';
import { BusinessError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

export class StockService {
  async getStockList(params: {
    page?: number;
    pageSize?: number;
    partId?: number;
    supplierId?: number;
    batchNo?: string;
  }) {
    const { page = 1, pageSize = 10, partId, supplierId, batchNo } = params;
    const where: any = {};

    if (partId) {
      where.partId = partId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (batchNo) {
      where.batchNo = { [Op.like]: `%${batchNo}%` };
    }

    const { count, rows } = await Stock.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [Part, Supplier],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getStockLogList(params: {
    page?: number;
    pageSize?: number;
    partId?: number;
    type?: StockLogType;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, partId, type, startDate, endDate } = params;
    const where: any = {};

    if (partId) {
      where.partId = partId;
    }
    if (type) {
      where.type = type;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await StockLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [Part],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async adjustStock(params: {
    partId: number;
    quantity: number;
    operatorId: number;
    remark?: string;
  }) {
    const { partId, quantity, operatorId, remark } = params;

    const part = await Part.findByPk(partId);
    if (!part) {
      throw new BusinessError('配件不存在');
    }

    const totalStock = await Stock.sum('quantity', { where: { partId } });
    const beforeQuantity = totalStock || 0;

    if (quantity < 0 && beforeQuantity + quantity < 0) {
      throw new BusinessError('库存不足');
    }

    await StockLog.create({
      partId,
      type: StockLogType.ADJUST,
      changeQuantity: quantity,
      beforeQuantity,
      afterQuantity: beforeQuantity + quantity,
      operatorId,
      remark,
    });

    if (quantity > 0) {
      await Stock.create({
        partId,
        batchNo: `ADJ${Date.now()}`,
        quantity,
        unitPrice: part.unitPrice,
        inboundDate: new Date(),
        remark: '库存调整',
      });
    } else {
      let needReduce = Math.abs(quantity);
      const stocks = await Stock.findAll({
        where: { partId },
        order: [['inboundDate', 'ASC']],
      });

      for (const stock of stocks) {
        if (needReduce <= 0) break;
        if (stock.quantity <= needReduce) {
          needReduce -= stock.quantity;
          await stock.destroy();
        } else {
          await stock.update({ quantity: stock.quantity - needReduce });
          needReduce = 0;
        }
      }
    }

    return true;
  }
}

export const stockService = new StockService();

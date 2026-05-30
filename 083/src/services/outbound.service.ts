import { OutboundOrder } from '../models/outboundOrder.model';
import { OutboundOrderItem } from '../models/outboundOrderItem.model';
import { OutboundOrderStatus } from '../constants/business';
import { BusinessError } from '../middlewares/errorHandler';
import { sequelize } from '../database';
import { Part } from '../models/part.model';
import { Stock } from '../models/stock.model';
import { StockLog, StockLogType } from '../models/stockLog.model';
import { ConsumptionLog } from '../models/consumptionLog.model';
import { Op, Transaction } from 'sequelize';
import dayjs from 'dayjs';
import { Category } from '../models/category.model';

const OUTBOUND_STATUS_TRANSITIONS = {
  [OutboundOrderStatus.PENDING]: [OutboundOrderStatus.APPROVED],
  [OutboundOrderStatus.APPROVED]: [OutboundOrderStatus.OUTBOUND],
  [OutboundOrderStatus.OUTBOUND]: [OutboundOrderStatus.SCRAPPED, OutboundOrderStatus.RETURNED],
  [OutboundOrderStatus.SCRAPPED]: [],
  [OutboundOrderStatus.RETURNED]: [],
};

export class OutboundService {
  generateOrderNo() {
    return `WO${dayjs().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`;
  }

  private canTransitionStatus(
    currentStatus: OutboundOrderStatus,
    targetStatus: OutboundOrderStatus
  ): boolean {
    const allowedTransitions = OUTBOUND_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(targetStatus);
  }

  private validateStatusTransition(
    orderId: number,
    currentStatus: OutboundOrderStatus,
    targetStatus: OutboundOrderStatus
  ): void {
    if (!this.canTransitionStatus(currentStatus, targetStatus)) {
      throw new BusinessError(
        `出库单 ${orderId} 当前状态为 ${currentStatus}，无法转换为 ${targetStatus}`
      );
    }
  }

  async createOutboundOrder(data: {
    technicianId: number;
    repairOrderNo?: string;
    vehiclePlate?: string;
    vehicleModel?: string;
    remark?: string;
    items: Array<{
      partId: number;
      quantity: number;
      unitPrice: number;
      remark?: string;
    }>;
  }) {
    return await sequelize.transaction(async (t) => {
      const orderNo = this.generateOrderNo();
      let totalAmount = 0;

      for (const item of data.items) {
        const part = await Part.findByPk(item.partId);
        if (!part) {
          throw new BusinessError(`配件ID ${item.partId} 不存在`);
        }

        const totalStock = await Stock.sum('quantity', {
          where: { partId: item.partId },
          transaction: t,
        });
        if ((totalStock || 0) < item.quantity) {
          throw new BusinessError(`配件 ${part.name} 库存不足`);
        }

        totalAmount += item.quantity * item.unitPrice;
      }

      const order = await OutboundOrder.create(
        {
          orderNo,
          technicianId: data.technicianId,
          repairOrderNo: data.repairOrderNo,
          vehiclePlate: data.vehiclePlate,
          vehicleModel: data.vehicleModel,
          remark: data.remark,
          status: OutboundOrderStatus.PENDING,
        },
        { transaction: t }
      );

      for (const item of data.items) {
        await OutboundOrderItem.create(
          {
            outboundOrderId: order.id,
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            remark: item.remark,
          },
          { transaction: t }
        );
      }

      return order;
    });
  }

  async approveOrder(id: number, approverId: number) {
    const order = await OutboundOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('出库单不存在');
    }

    this.validateStatusTransition(order.id, order.status, OutboundOrderStatus.APPROVED);

    const items = await OutboundOrderItem.findAll({
      where: { outboundOrderId: id },
    });

    for (const item of items) {
      const totalStock = await Stock.sum('quantity', {
        where: { partId: item.partId },
      });
      if ((totalStock || 0) < item.quantity) {
        const part = await Part.findByPk(item.partId);
        throw new BusinessError(`配件 ${part?.name || item.partId} 库存不足`);
      }
    }

    await order.update({
      status: OutboundOrderStatus.APPROVED,
      approverId,
      approvalDate: new Date(),
    });

    return order;
  }

  async confirmOutbound(id: number, operatorId: number) {
    const order = await OutboundOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('出库单不存在');
    }

    this.validateStatusTransition(order.id, order.status, OutboundOrderStatus.OUTBOUND);

    return await sequelize.transaction(async (t) => {
      const orderItems = await OutboundOrderItem.findAll({
        where: { outboundOrderId: id },
        include: [Part],
      });

      for (const orderItem of orderItems) {
        const stocks = await Stock.findAll({
          where: { partId: orderItem.partId },
          order: [['inboundDate', 'ASC']],
          transaction: t,
        });

        let needOutbound = orderItem.quantity;
        for (const stock of stocks) {
          if (needOutbound <= 0) break;
          if (stock.quantity <= needOutbound) {
            needOutbound -= stock.quantity;
            await stock.destroy({ transaction: t });
          } else {
            await stock.update(
              { quantity: stock.quantity - needOutbound },
              { transaction: t }
            );
            needOutbound = 0;
          }
        }

        if (needOutbound > 0) {
          throw new BusinessError(
            `配件 ${orderItem.part?.name || orderItem.partId} 出库失败，库存不足`
          );
        }

        const totalStock = await Stock.sum('quantity', {
          where: { partId: orderItem.partId },
          transaction: t,
        });
        const beforeQuantity = (totalStock || 0) + orderItem.quantity;

        await StockLog.create(
          {
            partId: orderItem.partId,
            type: StockLogType.OUTBOUND,
            changeQuantity: -orderItem.quantity,
            beforeQuantity,
            afterQuantity: beforeQuantity - orderItem.quantity,
            orderNo: order.orderNo,
            operatorId,
            remark: '维修领用出库',
          },
          { transaction: t }
        );

        await ConsumptionLog.create(
          {
            partId: orderItem.partId,
            categoryId: orderItem.part?.categoryId || 0,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
            totalAmount: orderItem.amount,
            vehicleModel: order.vehicleModel,
            vehiclePlate: order.vehiclePlate,
            repairOrderNo: order.repairOrderNo,
            technicianId: order.technicianId,
            consumptionDate: new Date(),
            remark: '维修领用出库',
          },
          { transaction: t }
        );
      }

      await order.update(
        {
          status: OutboundOrderStatus.OUTBOUND,
          outboundDate: new Date(),
        },
        { transaction: t }
      );

      return order;
    });
  }

  async scrapParts(
    orderId: number,
    data: {
      operatorId: number;
      items: Array<{
        id: number;
        quantity: number;
        reason?: string;
      }>;
    }
  ) {
    const order = await OutboundOrder.findByPk(orderId);
    if (!order) {
      throw new BusinessError('出库单不存在');
    }

    if (order.status !== OutboundOrderStatus.OUTBOUND) {
      throw new BusinessError('只有已出库的订单可以报废配件');
    }

    return await sequelize.transaction(async (t) => {
      for (const item of data.items) {
        const orderItem = await OutboundOrderItem.findByPk(item.id);
        if (!orderItem) {
          throw new BusinessError(`明细ID ${item.id} 不存在`);
        }

        const maxScrap = orderItem.quantity - (orderItem.scrappedQuantity || 0);
        if (item.quantity > maxScrap) {
          throw new BusinessError(`报废数量不能超过可报废数量 ${maxScrap}`);
        }

        await orderItem.update(
          {
            scrappedQuantity: (orderItem.scrappedQuantity || 0) + item.quantity,
            remark: item.reason,
          },
          { transaction: t }
        );

        await StockLog.create(
          {
            partId: orderItem.partId,
            type: StockLogType.SCRAP,
            changeQuantity: -item.quantity,
            beforeQuantity: 0,
            afterQuantity: 0,
            orderNo: order.orderNo,
            operatorId: data.operatorId,
            remark: `配件报废: ${item.reason || ''}`,
          },
          { transaction: t }
        );
      }

      return order;
    });
  }

  async returnParts(
    orderId: number,
    data: {
      operatorId: number;
      items: Array<{
        id: number;
        quantity: number;
        batchNo: string;
        reason?: string;
      }>;
    }
  ) {
    const order = await OutboundOrder.findByPk(orderId);
    if (!order) {
      throw new BusinessError('出库单不存在');
    }

    if (order.status !== OutboundOrderStatus.OUTBOUND) {
      throw new BusinessError('只有已出库的订单可以退回配件');
    }

    return await sequelize.transaction(async (t) => {
      for (const item of data.items) {
        const orderItem = await OutboundOrderItem.findByPk(item.id, {
          include: [Part],
        });
        if (!orderItem) {
          throw new BusinessError(`明细ID ${item.id} 不存在`);
        }

        const maxReturn =
          orderItem.quantity -
          (orderItem.returnedQuantity || 0) -
          (orderItem.scrappedQuantity || 0);
        if (item.quantity > maxReturn) {
          throw new BusinessError(`退回数量不能超过可退回数量 ${maxReturn}`);
        }

        await orderItem.update(
          {
            returnedQuantity: (orderItem.returnedQuantity || 0) + item.quantity,
            remark: item.reason,
          },
          { transaction: t }
        );

        const totalStock = await Stock.sum('quantity', {
          where: { partId: orderItem.partId },
          transaction: t,
        });
        const beforeQuantity = totalStock || 0;

        await Stock.create(
          {
            partId: orderItem.partId,
            batchNo: item.batchNo,
            quantity: item.quantity,
            unitPrice: orderItem.unitPrice,
            inboundDate: new Date(),
          },
          { transaction: t }
        );

        await StockLog.create(
          {
            partId: orderItem.partId,
            type: StockLogType.RETURN,
            changeQuantity: item.quantity,
            beforeQuantity,
            afterQuantity: beforeQuantity + item.quantity,
            orderNo: order.orderNo,
            batchNo: item.batchNo,
            operatorId: data.operatorId,
            remark: `配件退回: ${item.reason || ''}`,
          },
          { transaction: t }
        );
      }

      return order;
    });
  }

  async getOutboundOrder(id: number) {
    return await OutboundOrder.findByPk(id, {
      include: [
        {
          model: OutboundOrderItem,
          include: [Part],
        },
      ],
    });
  }

  async getOutboundOrderList(params: {
    page?: number;
    pageSize?: number;
    orderNo?: string;
    technicianId?: number;
    status?: OutboundOrderStatus;
    vehiclePlate?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      orderNo,
      technicianId,
      status,
      vehiclePlate,
      startDate,
      endDate,
    } = params;
    const where: any = {};

    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }
    if (technicianId) {
      where.technicianId = technicianId;
    }
    if (status) {
      where.status = status;
    }
    if (vehiclePlate) {
      where.vehiclePlate = { [Op.like]: `%${vehiclePlate}%` };
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

    const { count, rows } = await OutboundOrder.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getOutboundStatistics(params: {
    startDate: string;
    endDate: string;
    categoryId?: number;
  }) {
    const { startDate, endDate, categoryId } = params;
    const where: any = {
      status: OutboundOrderStatus.OUTBOUND,
      outboundDate: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };

    const orders = await OutboundOrder.findAll({
      where,
      include: [
        {
          model: OutboundOrderItem,
          include: [
            {
              model: Part,
              include: [Category],
            },
          ],
        },
      ],
    });

    const statistics: any = {
      totalOrders: orders.length,
      totalAmount: 0,
      totalParts: 0,
      categoryStats: [],
    };

    const categoryMap = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        count: number;
        amount: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items || []) {
        statistics.totalAmount += item.amount;
        statistics.totalParts += item.quantity;

        const part = item.part;
        if (part) {
          const catId = part.categoryId;
          const catName = part.category?.name || '未分类';
          if (!categoryMap.has(catId)) {
            categoryMap.set(catId, {
              categoryId: catId,
              categoryName: catName,
              count: 0,
              amount: 0,
            });
          }
          const catStat = categoryMap.get(catId)!;
          catStat.count += item.quantity;
          catStat.amount += item.amount;
        }
      }
    }

    statistics.categoryStats = Array.from(categoryMap.values());

    if (categoryId) {
      statistics.categoryStats = statistics.categoryStats.filter(
        (s: any) => s.categoryId === categoryId
      );
    }

    return statistics;
  }
}

export const outboundService = new OutboundService();

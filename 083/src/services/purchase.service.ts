import { PurchaseOrder } from '../models/purchaseOrder.model';
import { PurchaseOrderItem } from '../models/purchaseOrderItem.model';
import { PurchaseOrderStatus } from '../constants/business';
import { BusinessError } from '../middlewares/errorHandler';
import { sequelize } from '../database';
import { Supplier } from '../models/supplier.model';
import { Part } from '../models/part.model';
import { Stock } from '../models/stock.model';
import { StockLog, StockLogType } from '../models/stockLog.model';
import { Op, Transaction } from 'sequelize';
import dayjs from 'dayjs';

const PURCHASE_STATUS_TRANSITIONS = {
  [PurchaseOrderStatus.PENDING]: [PurchaseOrderStatus.ACCEPTED, PurchaseOrderStatus.REJECTED],
  [PurchaseOrderStatus.ACCEPTED]: [PurchaseOrderStatus.ARRIVED, PurchaseOrderStatus.REJECTED],
  [PurchaseOrderStatus.ARRIVED]: [PurchaseOrderStatus.INSPECTED],
  [PurchaseOrderStatus.INSPECTED]: [PurchaseOrderStatus.STORED],
  [PurchaseOrderStatus.STORED]: [],
  [PurchaseOrderStatus.REJECTED]: [],
};

export class PurchaseService {
  generateOrderNo() {
    return `PO${dayjs().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`;
  }

  private canTransitionStatus(
    currentStatus: PurchaseOrderStatus,
    targetStatus: PurchaseOrderStatus
  ): boolean {
    const allowedTransitions = PURCHASE_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(targetStatus);
  }

  private validateStatusTransition(
    orderId: number,
    currentStatus: PurchaseOrderStatus,
    targetStatus: PurchaseOrderStatus
  ): void {
    if (!this.canTransitionStatus(currentStatus, targetStatus)) {
      throw new BusinessError(
        `采购单 ${orderId} 当前状态为 ${currentStatus}，无法转换为 ${targetStatus}`
      );
    }
  }

  async createPurchaseOrder(data: {
    supplierId: number;
    purchaserId: number;
    expectedDate?: Date;
    remark?: string;
    items: Array<{
      partId: number;
      quantity: number;
      unitPrice: number;
      remark?: string;
    }>;
  }) {
    const supplier = await Supplier.findByPk(data.supplierId);
    if (!supplier) {
      throw new BusinessError('供应商不存在');
    }

    return await sequelize.transaction(async (t) => {
      const orderNo = this.generateOrderNo();
      let totalAmount = 0;

      for (const item of data.items) {
        const part = await Part.findByPk(item.partId);
        if (!part) {
          throw new BusinessError(`配件ID ${item.partId} 不存在`);
        }
        totalAmount += item.quantity * item.unitPrice;
      }

      const order = await PurchaseOrder.create(
        {
          orderNo,
          supplierId: data.supplierId,
          purchaserId: data.purchaserId,
          expectedDate: data.expectedDate,
          totalAmount,
          remark: data.remark,
          status: PurchaseOrderStatus.PENDING,
        },
        { transaction: t }
      );

      for (const item of data.items) {
        await PurchaseOrderItem.create(
          {
            purchaseOrderId: order.id,
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

  async updatePurchaseOrder(
    id: number,
    data: {
      supplierId?: number;
      expectedDate?: Date;
      remark?: string;
      items?: Array<{
        partId: number;
        quantity: number;
        unitPrice: number;
        remark?: string;
      }>;
    }
  ) {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('采购单不存在');
    }

    if (order.status !== PurchaseOrderStatus.PENDING) {
      throw new BusinessError('只能修改待接单的采购单');
    }

    return await sequelize.transaction(async (t) => {
      if (data.supplierId) {
        const supplier = await Supplier.findByPk(data.supplierId);
        if (!supplier) {
          throw new BusinessError('供应商不存在');
        }
      }

      const updateData: any = {
        supplierId: data.supplierId,
        expectedDate: data.expectedDate,
        remark: data.remark,
      };

      if (data.items) {
        let totalAmount = 0;
        for (const item of data.items) {
          const part = await Part.findByPk(item.partId);
          if (!part) {
            throw new BusinessError(`配件ID ${item.partId} 不存在`);
          }
          totalAmount += item.quantity * item.unitPrice;
        }
        updateData.totalAmount = totalAmount;

        await PurchaseOrderItem.destroy({
          where: { purchaseOrderId: id },
          transaction: t,
        });

        for (const item of data.items) {
          await PurchaseOrderItem.create(
            {
              purchaseOrderId: id,
              partId: item.partId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
              remark: item.remark,
            },
            { transaction: t }
          );
        }
      }

      await order.update(updateData, { transaction: t });
      return order;
    });
  }

  async acceptOrder(id: number) {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('采购单不存在');
    }

    this.validateStatusTransition(order.id, order.status, PurchaseOrderStatus.ACCEPTED);

    await order.update({ status: PurchaseOrderStatus.ACCEPTED });
    return order;
  }

  async confirmArrival(id: number) {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('采购单不存在');
    }

    this.validateStatusTransition(order.id, order.status, PurchaseOrderStatus.ARRIVED);

    await order.update({ status: PurchaseOrderStatus.ARRIVED });
    return order;
  }

  async inspectOrder(
    id: number,
    data: {
      inspectorId: number;
      items: Array<{
        id: number;
        qualifiedQuantity: number;
      }>;
      remark?: string;
    }
  ) {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('采购单不存在');
    }

    this.validateStatusTransition(order.id, order.status, PurchaseOrderStatus.INSPECTED);

    return await sequelize.transaction(async (t) => {
      for (const item of data.items) {
        const orderItem = await PurchaseOrderItem.findByPk(item.id);
        if (!orderItem) {
          throw new BusinessError(`明细ID ${item.id} 不存在`);
        }
        if (item.qualifiedQuantity > orderItem.quantity) {
          throw new BusinessError('合格数量不能大于采购数量');
        }
        await orderItem.update(
          {
            receivedQuantity: orderItem.quantity,
            qualifiedQuantity: item.qualifiedQuantity,
          },
          { transaction: t }
        );
      }

      await order.update(
        {
          status: PurchaseOrderStatus.INSPECTED,
          inspectorId: data.inspectorId,
          inspectionDate: new Date(),
          inspectionRemark: data.remark,
        },
        { transaction: t }
      );

      return order;
    });
  }

  async inboundOrder(
    id: number,
    data: {
      operatorId: number;
      items: Array<{
        id: number;
        batchNo: string;
        warehouseLocation?: string;
      }>;
    }
  ) {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('采购单不存在');
    }

    this.validateStatusTransition(order.id, order.status, PurchaseOrderStatus.STORED);

    return await sequelize.transaction(async (t) => {
      const orderItems = await PurchaseOrderItem.findAll({
        where: { purchaseOrderId: id },
        include: [Part],
      });

      for (const item of data.items) {
        const orderItem = orderItems.find((i) => i.id === item.id);
        if (!orderItem) {
          throw new BusinessError(`明细ID ${item.id} 不存在`);
        }

        const totalStock = await Stock.sum('quantity', {
          where: { partId: orderItem.partId },
          transaction: t,
        });
        const beforeQuantity = totalStock || 0;
        const inboundQuantity = orderItem.qualifiedQuantity || orderItem.quantity;

        await Stock.create(
          {
            partId: orderItem.partId,
            supplierId: order.supplierId,
            batchNo: item.batchNo,
            quantity: inboundQuantity,
            unitPrice: orderItem.unitPrice,
            inboundDate: new Date(),
            warehouseLocation: item.warehouseLocation,
          },
          { transaction: t }
        );

        await StockLog.create(
          {
            partId: orderItem.partId,
            type: StockLogType.INBOUND,
            changeQuantity: inboundQuantity,
            beforeQuantity,
            afterQuantity: beforeQuantity + inboundQuantity,
            orderNo: order.orderNo,
            batchNo: item.batchNo,
            operatorId: data.operatorId,
            remark: '采购入库',
          },
          { transaction: t }
        );
      }

      await order.update({ status: PurchaseOrderStatus.STORED }, { transaction: t });
      return order;
    });
  }

  async rejectOrder(id: number, remark: string) {
    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new BusinessError('采购单不存在');
    }

    this.validateStatusTransition(order.id, order.status, PurchaseOrderStatus.REJECTED);

    await order.update({ status: PurchaseOrderStatus.REJECTED, remark });
    return order;
  }

  async getPurchaseOrder(id: number) {
    return await PurchaseOrder.findByPk(id, {
      include: [
        { model: Supplier },
        {
          model: PurchaseOrderItem,
          include: [Part],
        },
      ],
    });
  }

  async getPurchaseOrderList(params: {
    page?: number;
    pageSize?: number;
    orderNo?: string;
    supplierId?: number;
    status?: PurchaseOrderStatus;
  }) {
    const { page = 1, pageSize = 10, orderNo, supplierId, status } = params;
    const where: any = {};

    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [Supplier],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }
}

export const purchaseService = new PurchaseService();

import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import PurchaseOrder from '../models/PurchaseOrder';
import PurchaseItem from '../models/PurchaseItem';
import Product from '../models/Product';
import InventoryLog from '../models/InventoryLog';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { PurchaseOrderStatus, InventoryOperationType } from '../types';
import sequelize from '../database';
import moment from 'moment';

export const purchaseController = {
  async getList(req: Request, res: Response) {
    const { page = 1, pageSize = 10, status, supplierId, startDate, endDate } = req.query;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (supplierId) {
      where.supplierId = supplierId;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        { association: 'supplier', attributes: ['id', 'name', 'code'] },
        { association: 'operator', attributes: ['id', 'username', 'realName'] },
        { association: 'items', include: [{ association: 'product', attributes: ['id', 'name', 'code', 'spec'] }] }
      ],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize))
    });

    return ResponseUtil.success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const order = await PurchaseOrder.findByPk(id, {
      include: [
        { association: 'supplier' },
        { association: 'operator' },
        { association: 'items', include: [{ association: 'product' }] }
      ]
    });
    
    if (!order) {
      throw new AppError('采购单不存在', 404);
    }

    return ResponseUtil.success(res, order);
  },

  async create(req: Request, res: Response) {
    const { supplierId, expectDate, items, remark } = req.body;
    const operatorId = req.user!.userId;

    const orderNo = `PO${moment().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`;

    await sequelize.transaction(async (t: Transaction) => {
      let totalAmount = 0;
      
      for (const item of items) {
        totalAmount += item.quantity * item.price;
      }

      const order = await PurchaseOrder.create({
        orderNo,
        supplierId,
        totalAmount,
        status: PurchaseOrderStatus.PENDING,
        expectDate: expectDate ? new Date(expectDate) : null,
        operatorId,
        remark
      }, { transaction: t });

      for (const item of items) {
        await PurchaseItem.create({
          purchaseOrderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          receivedQuantity: 0,
          acceptedQuantity: 0,
          returnedQuantity: 0
        }, { transaction: t });
      }

      return order;
    });

    return ResponseUtil.success(res, null, '采购单创建成功');
  },

  async receive(req: Request, res: Response) {
    const { id } = req.params;
    const { items } = req.body;
    const operatorId = req.user!.userId;

    await sequelize.transaction(async (t: Transaction) => {
      const order = await PurchaseOrder.findByPk(id, {
        include: [{ association: 'items' }],
        transaction: t
      });

      if (!order) {
        throw new AppError('采购单不存在', 404);
      }

      if (order.status !== PurchaseOrderStatus.CONFIRMED && order.status !== PurchaseOrderStatus.PENDING) {
        throw new AppError('当前状态不允许收货', 400);
      }

      for (const receiveItem of items) {
        const item = order.items.find((i: PurchaseItem) => i.id === receiveItem.id);
        if (!item) {
          throw new AppError(`采购明细不存在: ${receiveItem.id}`, 404);
        }

        const remainingQuantity = item.quantity - item.receivedQuantity;
        if (receiveItem.quantity > remainingQuantity) {
          throw new AppError(`商品 ${item.productId} 收货数量超出剩余可收数量`, 400);
        }

        await PurchaseItem.update(
          { receivedQuantity: item.receivedQuantity + receiveItem.quantity },
          { where: { id: item.id }, transaction: t }
        );
      }

      order.status = PurchaseOrderStatus.RECEIVED;
      await order.save({ transaction: t });
    });

    return ResponseUtil.success(res, null, '收货完成');
  },

  async accept(req: Request, res: Response) {
    const { id } = req.params;
    const { items } = req.body;
    const operatorId = req.user!.userId;

    await sequelize.transaction(async (t: Transaction) => {
      const order = await PurchaseOrder.findByPk(id, {
        include: [{ association: 'items' }],
        transaction: t
      });

      if (!order) {
        throw new AppError('采购单不存在', 404);
      }

      if (order.status !== PurchaseOrderStatus.RECEIVED) {
        throw new AppError('当前状态不允许验收', 400);
      }

      for (const acceptItem of items) {
        const item = order.items.find((i: PurchaseItem) => i.id === acceptItem.id);
        if (!item) {
          throw new AppError(`采购明细不存在: ${acceptItem.id}`, 404);
        }

        const remainingQuantity = item.receivedQuantity - item.acceptedQuantity;
        if (acceptItem.quantity > remainingQuantity) {
          throw new AppError(`商品 ${item.productId} 验收数量超出已收货数量`, 400);
        }

        await PurchaseItem.update(
          { acceptedQuantity: item.acceptedQuantity + acceptItem.quantity },
          { where: { id: item.id }, transaction: t }
        );

        const product = await Product.findByPk(item.productId, { transaction: t });
        if (product) {
          const beforeQuantity = product.stockQuantity;
          const afterQuantity = beforeQuantity + acceptItem.quantity;

          await Product.update(
            { stockQuantity: afterQuantity },
            { where: { id: item.productId }, transaction: t }
          );

          await InventoryLog.create({
            productId: item.productId,
            operationType: InventoryOperationType.PURCHASE_IN,
            quantity: acceptItem.quantity,
            beforeQuantity,
            afterQuantity,
            relatedOrderId: order.id,
            relatedOrderType: 'purchase',
            operatorId,
            remark: `采购单 ${order.orderNo} 验收入库`
          }, { transaction: t });
        }
      }

      order.status = PurchaseOrderStatus.INSPECTED;
      await order.save({ transaction: t });
    });

    return ResponseUtil.success(res, null, '验收完成，库存已更新');
  },

  async complete(req: Request, res: Response) {
    const { id } = req.params;

    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new AppError('采购单不存在', 404);
    }

    if (order.status !== PurchaseOrderStatus.INSPECTED) {
      throw new AppError('当前状态不允许完成', 400);
    }

    order.status = PurchaseOrderStatus.COMPLETED;
    await order.save();

    return ResponseUtil.success(res, order, '采购单已完成');
  },

  async cancel(req: Request, res: Response) {
    const { id } = req.params;

    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new AppError('采购单不存在', 404);
    }

    if (order.status === PurchaseOrderStatus.COMPLETED) {
      throw new AppError('已完成的采购单不能取消', 400);
    }

    order.status = PurchaseOrderStatus.CANCELLED;
    await order.save();

    return ResponseUtil.success(res, order, '采购单已取消');
  }
};

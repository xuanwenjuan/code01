import { Request, Response } from 'express';
import { Op, Transaction, fn, col } from 'sequelize';
import SalesOrder from '../models/SalesOrder';
import SalesItem from '../models/SalesItem';
import Product from '../models/Product';
import InventoryLog from '../models/InventoryLog';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { SalesOrderStatus, InventoryOperationType } from '../types';
import sequelize from '../database';
import moment from 'moment';

export const salesController = {
  async getList(req: Request, res: Response) {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      customerName, 
      startDate, 
      endDate,
      hasDebt
    } = req.query;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (customerName) {
      where.customerName = { [Op.like]: `%${customerName}%` };
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    
    if (hasDebt === 'true') {
      where.debtAmount = { [Op.gt]: 0 };
    }

    const { count, rows } = await SalesOrder.findAndCountAll({
      where,
      include: [
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
    const order = await SalesOrder.findByPk(id, {
      include: [
        { association: 'operator' },
        { association: 'items', include: [{ association: 'product' }] }
      ]
    });
    
    if (!order) {
      throw new AppError('销售单不存在', 404);
    }

    return ResponseUtil.success(res, order);
  },

  async create(req: Request, res: Response) {
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      paidAmount, 
      items, 
      remark 
    } = req.body;
    const operatorId = req.user!.userId;

    await sequelize.transaction(async (t: Transaction) => {
      let totalAmount = 0;
      
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) {
          throw new AppError(`商品 ${item.productId} 不存在`, 404);
        }
        
        if (product.stockQuantity < item.quantity) {
          throw new AppError(`商品 ${product.name} 库存不足`, 400);
        }
        
        totalAmount += item.quantity * item.price;
      }

      const orderNo = `SO${moment().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000)}`;
      const debtAmount = Math.max(0, totalAmount - (paidAmount || 0));

      const order = await SalesOrder.create({
        orderNo,
        customerName,
        customerPhone,
        customerAddress,
        totalAmount,
        paidAmount: paidAmount || 0,
        debtAmount,
        status: SalesOrderStatus.DRAFT,
        operatorId,
        remark
      }, { transaction: t });

      for (const item of items) {
        await SalesItem.create({
          salesOrderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          shippedQuantity: 0,
          returnedQuantity: 0
        }, { transaction: t });
      }

      return order;
    });

    return ResponseUtil.success(res, null, '销售单创建成功');
  },

  async confirm(req: Request, res: Response) {
    const { id } = req.params;

    const order = await SalesOrder.findByPk(id);
    if (!order) {
      throw new AppError('销售单不存在', 404);
    }

    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new AppError('当前状态不允许确认', 400);
    }

    order.status = SalesOrderStatus.CONFIRMED;
    await order.save();

    return ResponseUtil.success(res, order, '销售单已确认');
  },

  async ship(req: Request, res: Response) {
    const { id } = req.params;
    const { items } = req.body;
    const operatorId = req.user!.userId;

    await sequelize.transaction(async (t: Transaction) => {
      const order = await SalesOrder.findByPk(id, {
        include: [{ association: 'items' }],
        transaction: t
      });

      if (!order) {
        throw new AppError('销售单不存在', 404);
      }

      if (order.status !== SalesOrderStatus.CONFIRMED) {
        throw new AppError('当前状态不允许发货', 400);
      }

      for (const shipItem of items) {
        const item = order.items.find((i: SalesItem) => i.id === shipItem.id);
        if (!item) {
          throw new AppError(`销售明细不存在: ${shipItem.id}`, 404);
        }

        const remainingQuantity = item.quantity - item.shippedQuantity;
        if (shipItem.quantity > remainingQuantity) {
          throw new AppError(`商品 ${item.productId} 发货数量超出剩余可发数量`, 400);
        }

        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) {
          throw new AppError(`商品不存在: ${item.productId}`, 404);
        }

        if (product.stockQuantity < shipItem.quantity) {
          throw new AppError(`商品 ${product.name} 库存不足`, 400);
        }

        await SalesItem.update(
          { shippedQuantity: item.shippedQuantity + shipItem.quantity },
          { where: { id: item.id }, transaction: t }
        );

        const beforeQuantity = product.stockQuantity;
        const afterQuantity = beforeQuantity - shipItem.quantity;

        await Product.update(
          { stockQuantity: afterQuantity },
          { where: { id: item.productId }, transaction: t }
        );

        await InventoryLog.create({
          productId: item.productId,
          operationType: InventoryOperationType.SALES_OUT,
          quantity: -shipItem.quantity,
          beforeQuantity,
          afterQuantity,
          relatedOrderId: order.id,
          relatedOrderType: 'sales',
          operatorId,
          remark: `销售单 ${order.orderNo} 发货出库`
        }, { transaction: t });
      }

      order.status = SalesOrderStatus.SHIPPED;
      order.shipDate = new Date();
      await order.save({ transaction: t });
    });

    return ResponseUtil.success(res, null, '发货完成，库存已扣减');
  },

  async deliver(req: Request, res: Response) {
    const { id } = req.params;

    const order = await SalesOrder.findByPk(id);
    if (!order) {
      throw new AppError('销售单不存在', 404);
    }

    if (order.status !== SalesOrderStatus.SHIPPED) {
      throw new AppError('当前状态不允许确认送达', 400);
    }

    order.status = SalesOrderStatus.DELIVERED;
    order.deliveryDate = new Date();
    await order.save();

    return ResponseUtil.success(res, order, '已确认送达');
  },

  async receivePayment(req: Request, res: Response) {
    const { id } = req.params;
    const { amount } = req.body;
    const operatorId = req.user!.userId;

    await sequelize.transaction(async (t: Transaction) => {
      const order = await SalesOrder.findByPk(id, { transaction: t });
      if (!order) {
        throw new AppError('销售单不存在', 404);
      }

      if (order.debtAmount < amount) {
        throw new AppError('收款金额不能大于欠款金额', 400);
      }

      order.paidAmount += amount;
      order.debtAmount -= amount;

      if (order.debtAmount <= 0 && order.status === SalesOrderStatus.DELIVERED) {
        order.status = SalesOrderStatus.PAID;
      }

      await order.save({ transaction: t });
    });

    return ResponseUtil.success(res, null, '收款成功');
  },

  async cancel(req: Request, res: Response) {
    const { id } = req.params;

    const order = await SalesOrder.findByPk(id);
    if (!order) {
      throw new AppError('销售单不存在', 404);
    }

    if (order.status === SalesOrderStatus.PAID) {
      throw new AppError('已完成的销售单不能取消', 400);
    }

    order.status = SalesOrderStatus.CANCELLED;
    await order.save();

    return ResponseUtil.success(res, order, '销售单已取消');
  },

  async getStatistics(req: Request, res: Response) {
    const { startDate, endDate, categoryId } = req.query;
    const where: any = {
      status: { [Op.in]: [SalesOrderStatus.DELIVERED, SalesOrderStatus.PAID] }
    };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const orders = await SalesOrder.findAll({
      where,
      include: [{
        association: 'items',
        include: [{
          association: 'product',
          where: categoryId ? { categoryId } : undefined,
          required: true
        }]
      }]
    });

    let totalAmount = 0;
    let totalOrders = orders.length;
    const productSales: any[] = [];

    orders.forEach(order => {
      totalAmount += order.totalAmount;
      
      order.items.forEach((item: SalesItem) => {
        const existing = productSales.find(p => p.productId === item.productId);
        if (existing) {
          existing.quantity += item.shippedQuantity;
          existing.amount += item.shippedQuantity * item.price;
        } else {
          productSales.push({
            productId: item.productId,
            productName: item.product?.name,
            quantity: item.shippedQuantity,
            amount: item.shippedQuantity * item.price
          });
        }
      });
    });

    return ResponseUtil.success(res, {
      totalAmount,
      totalOrders,
      productSales: productSales.sort((a, b) => b.amount - a.amount).slice(0, 10)
    });
  },

  async getDebtList(req: Request, res: Response) {
    const orders = await SalesOrder.findAll({
      where: {
        debtAmount: { [Op.gt]: 0 },
        status: { [Op.ne]: SalesOrderStatus.CANCELLED }
      },
      order: [['createdAt', 'DESC']]
    });

    return ResponseUtil.success(res, orders);
  }
};

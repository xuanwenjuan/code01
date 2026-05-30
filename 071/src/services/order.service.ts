import Order, { OrderAttributes, OrderStatus } from '../models/Order.model';
import Leader from '../models/Leader.model';
import GroupBuy from '../models/GroupBuy.model';
import Product from '../models/Product.model';
import Commission from '../models/Commission.model';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import { Op, fn, col, Transaction } from 'sequelize';
import { OrderListQuery } from '../types';
import commissionService from './commission.service';

class OrderService {
  generateOrderNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}${random}${uuidv4().slice(0, 4).toUpperCase()}`;
  }

  async createOrder(data: Omit<OrderAttributes, 'id' | 'orderNo' | 'status' | 'commissionRate' | 'commissionAmount' | 'platformFee'>): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const leader = await Leader.findByPk(data.leaderId, { transaction: t });
      if (!leader) {
        throw new BadRequestException('团长不存在');
      }

      const groupBuy = await GroupBuy.findByPk(data.groupBuyId, { transaction: t });
      if (!groupBuy) {
        throw new BadRequestException('拼团活动不存在');
      }
      if (groupBuy.status !== 'active') {
        throw new BadRequestException('拼团活动未开始或已结束');
      }

      const product = await Product.findByPk(data.productId, { transaction: t });
      if (!product) {
        throw new BadRequestException('商品不存在');
      }

      const totalAmount = data.quantity * data.unitPrice;
      const commissionRate = leader.commissionRate;
      const commissionAmount = (totalAmount * commissionRate) / 100;
      const platformFee = totalAmount * 0.02;

      const order = await Order.create({
        ...data,
        orderNo: this.generateOrderNo(),
        totalAmount,
        commissionRate,
        commissionAmount,
        platformFee,
        status: OrderStatus.PENDING_PAYMENT
      }, { transaction: t });

      await GroupBuy.increment('currentQuantity', { 
        by: data.quantity, 
        where: { id: data.groupBuyId },
        transaction: t
      });

      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await Order.findByPk(id, {
      include: [
        { model: Leader, as: 'leader', attributes: ['id', 'communityName', 'phone'] },
        { model: GroupBuy, as: 'groupBuy', attributes: ['id', 'title'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'image'] }
      ]
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  async getOrderList(params: OrderListQuery): Promise<{ 
    list: Order[]; 
    total: number; 
    page: number; 
    pageSize: number;
    summary?: {
      totalOrders: number;
      totalAmount: number;
      totalCommission: number;
    }
  }> {
    const { page = 1, pageSize = 10, status, userId, leaderId, groupBuyId, startDate, endDate, orderNo } = params;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (leaderId) {
      where.leaderId = leaderId;
    }
    if (groupBuyId) {
      where.groupBuyId = groupBuyId;
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
    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Leader, as: 'leader', attributes: ['id', 'communityName'] },
        { model: GroupBuy, as: 'groupBuy', attributes: ['id', 'title'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'image'] }
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    const summary = await Order.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalOrders'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('commissionAmount')), 'totalCommission']
      ],
      raw: true
    }) as any;

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      summary: {
        totalOrders: Number(summary?.totalOrders || 0),
        totalAmount: Number(summary?.totalAmount || 0),
        totalCommission: Number(summary?.totalCommission || 0)
      }
    };
  }

  async updateOrder(id: number, data: Partial<OrderAttributes>): Promise<Order> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    await order.update(data);
    return order;
  }

  async updateOrderStatus(id: number, status: OrderStatus, cancelReason?: string): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PENDING_CONFIRM, OrderStatus.CANCELLED, OrderStatus.PAID],
        [OrderStatus.PENDING_CONFIRM]: [OrderStatus.PAID, OrderStatus.CANCELLED],
        [OrderStatus.PAID]: [OrderStatus.DELIVERED, OrderStatus.REFUNDING, OrderStatus.CANCELLED],
        [OrderStatus.DELIVERED]: [OrderStatus.PICKED_UP, OrderStatus.REFUNDING],
        [OrderStatus.PICKED_UP]: [OrderStatus.COMPLETED, OrderStatus.REFUNDING],
        [OrderStatus.COMPLETED]: [OrderStatus.REFUNDING],
        [OrderStatus.REFUNDING]: [OrderStatus.REFUNDED, OrderStatus.PAID],
        [OrderStatus.REFUNDED]: [],
        [OrderStatus.CANCELLED]: []
      };

      if (!validTransitions[order.status].includes(status)) {
        throw new BadRequestException(`无法从 ${order.status} 状态变更为 ${status}`);
      }

      const updateData: any = { status };
      
      switch (status) {
        case OrderStatus.PAID:
          updateData.payTime = new Date();
          break;
        case OrderStatus.DELIVERED:
          updateData.deliveryTime = new Date();
          break;
        case OrderStatus.PICKED_UP:
          updateData.pickupTime = new Date();
          break;
        case OrderStatus.COMPLETED:
          updateData.completeTime = new Date();
          await commissionService.createCommission(id, t);
          break;
        case OrderStatus.CANCELLED:
          updateData.cancelTime = new Date();
          updateData.cancelReason = cancelReason || '用户取消';
          break;
        case OrderStatus.REFUNDED:
          updateData.cancelTime = new Date();
          updateData.cancelReason = '已退款';
          break;
      }

      await order.update(updateData, { transaction: t });
      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancelOrder(id: number, cancelReason: string): Promise<Order> {
    return await this.updateOrderStatus(id, OrderStatus.CANCELLED, cancelReason);
  }

  async getOrderStatistics(leaderId?: number): Promise<any> {
    const where: any = {};
    if (leaderId) {
      where.leaderId = leaderId;
    }

    const statusCounts = await Promise.all([
      Order.count({ where: { ...where, status: OrderStatus.PENDING_PAYMENT } }),
      Order.count({ where: { ...where, status: OrderStatus.PENDING_CONFIRM } }),
      Order.count({ where: { ...where, status: OrderStatus.PAID } }),
      Order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
      Order.count({ where: { ...where, status: OrderStatus.PICKED_UP } }),
      Order.count({ where: { ...where, status: OrderStatus.COMPLETED } }),
      Order.count({ where: { ...where, status: OrderStatus.REFUNDING } }),
      Order.count({ where: { ...where, status: OrderStatus.REFUNDED } }),
      Order.count({ where: { ...where, status: OrderStatus.CANCELLED } })
    ]);

    const amountSummary = await Order.findOne({
      where: { ...where, status: OrderStatus.COMPLETED },
      attributes: [
        [fn('COUNT', col('id')), 'totalCount'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('commissionAmount')), 'totalCommission'],
        [fn('SUM', col('platformFee')), 'totalPlatformFee']
      ],
      raw: true
    }) as any;

    return {
      pendingPayment: statusCounts[0],
      pendingConfirm: statusCounts[1],
      paid: statusCounts[2],
      delivered: statusCounts[3],
      pickedUp: statusCounts[4],
      completed: statusCounts[5],
      refunding: statusCounts[6],
      refunded: statusCounts[7],
      cancelled: statusCounts[8],
      total: statusCounts.reduce((a, b) => a + b, 0),
      completedCount: Number(amountSummary?.totalCount || 0),
      completedAmount: Number(amountSummary?.totalAmount || 0),
      totalCommission: Number(amountSummary?.totalCommission || 0),
      totalPlatformFee: Number(amountSummary?.totalPlatformFee || 0)
    };
  }
}

export default new OrderService();

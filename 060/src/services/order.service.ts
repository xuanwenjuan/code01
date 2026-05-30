import { Order, OrderStatus } from '../database/models/order.model';
import { Ticket, TicketStatus } from '../database/models/ticket.model';
import { Distributor, DistributorStatus } from '../database/models/distributor.model';
import { AppError } from '../utils/error';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { commissionTierService } from './commissionTier.service';

export class OrderService {
  generateOrderNo(): string {
    return 'ORD' + moment().format('YYYYMMDDHHmmss') + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  generateTicketCode(): string {
    return 'TCK' + moment().format('YYYYMMDD') + uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
  }

  async create(data: Partial<Order> & { productName?: string }) {
    const t = await sequelize.transaction();

    try {
      let distributor = null;
      let commissionRate = 0;

      if (data.distributorId) {
        distributor = await Distributor.findByPk(data.distributorId);
        if (!distributor) {
          throw new AppError('分销商不存在', 400);
        }
        if (distributor.status !== DistributorStatus.ACTIVE) {
          throw new AppError('分销商状态异常，无法创建订单', 400);
        }
        commissionRate = distributor.commissionRate;
      }

      const orderNo = this.generateOrderNo();
      const unitPrice = Number(data.unitPrice) || 0;
      const quantity = Number(data.quantity) || 1;
      const totalAmount = unitPrice * quantity;
      const commissionAmount = Number((totalAmount * commissionRate / 100).toFixed(2));

      const order = await Order.create(
        {
          ...data,
          orderNo,
          unitPrice,
          quantity,
          totalAmount,
          commissionAmount,
          status: OrderStatus.PENDING,
        },
        { transaction: t }
      );

      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketCode = this.generateTicketCode();
        const ticket = await Ticket.create(
          {
            orderId: order.id,
            ticketCode,
            productName: data.productName || '景区门票',
            price: unitPrice,
            status: TicketStatus.UNUSED,
            expireAt: data.expireAt,
          },
          { transaction: t }
        );
        tickets.push(ticket);
      }

      await t.commit();

      return { order, tickets };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async pay(id: number) {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new AppError('订单不存在', 404);
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new AppError('订单状态不正确，无法支付', 400);
      }

      await order.update(
        {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
        { transaction: t }
      );

      if (order.distributorId && order.totalAmount) {
        await commissionTierService.updateDistributorStats(
          order.distributorId,
          order.totalAmount,
          t
        );
      }

      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const order = await Order.findByPk(id, {
      include: [
        { model: Distributor, as: 'distributor', attributes: ['id', 'name', 'type'] },
        { model: Ticket, as: 'tickets' },
      ],
    });
    if (!order) {
      throw new AppError('订单不存在', 404);
    }
    return order;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    distributorId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 10, distributorId, status, startDate, endDate, keyword } = params;
    const where: any = {};

    if (distributorId) where.distributorId = distributorId;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')],
      };
    }
    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { visitorName: { [Op.like]: `%${keyword}%` } },
        { visitorPhone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
      include: [
        { model: Distributor, as: 'distributor', attributes: ['id', 'name'] },
      ],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async cancel(id: number) {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new AppError('订单不存在', 404);
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAID) {
        throw new AppError('订单状态不正确，无法取消', 400);
      }

      if (order.status === OrderStatus.PAID) {
        const usedTickets = await Ticket.count({
          where: { orderId: id, status: TicketStatus.USED },
          transaction: t,
        });
        if (usedTickets > 0) {
          throw new AppError('订单已有票券核销，无法取消', 400);
        }
      }

      await order.update({ status: OrderStatus.CANCELLED }, { transaction: t });
      await Ticket.update(
        { status: TicketStatus.CANCELLED },
        { where: { orderId: id }, transaction: t }
      );

      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async processExpiredOrders() {
    const t = await sequelize.transaction();

    try {
      const now = new Date();
      const expiredOrders = await Order.findAll({
        where: {
          status: [OrderStatus.PENDING, OrderStatus.PAID],
          expireAt: { [Op.lt]: now },
        },
        transaction: t,
      });

      for (const order of expiredOrders) {
        if (order.status === OrderStatus.PAID) {
          const usedTickets = await Ticket.count({
            where: { orderId: order.id, status: TicketStatus.USED },
            transaction: t,
          });
          if (usedTickets > 0) continue;
        }

        await order.update({ status: OrderStatus.EXPIRED }, { transaction: t });
        await Ticket.update(
          { status: TicketStatus.EXPIRED },
          { where: { orderId: order.id, status: TicketStatus.UNUSED }, transaction: t }
        );
      }

      await t.commit();
      return { processed: expiredOrders.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getStatistics(distributorId?: number, startDate?: string, endDate?: string) {
    const where: any = {};

    if (distributorId) where.distributorId = distributorId;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')],
      };
    }

    const [pending, paid, verified, cancelled, expired] = await Promise.all([
      Order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      Order.count({ where: { ...where, status: OrderStatus.PAID } }),
      Order.count({ where: { ...where, status: OrderStatus.VERIFIED } }),
      Order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      Order.count({ where: { ...where, status: OrderStatus.EXPIRED } }),
    ]);

    const totalAmount = await Order.sum('totalAmount', { where });
    const commissionAmount = await Order.sum('commissionAmount', { where });

    return {
      counts: { pending, paid, verified, cancelled, expired },
      totalAmount: totalAmount || 0,
      commissionAmount: commissionAmount || 0,
    };
  }
}

export const orderService = new OrderService();

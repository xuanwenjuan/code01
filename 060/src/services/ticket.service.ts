import { Ticket, TicketStatus } from '../database/models/ticket.model';
import { Order, OrderStatus } from '../database/models/order.model';
import { Distributor } from '../database/models/distributor.model';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import sequelize from '../database/sequelize';

export class TicketService {
  async verify(ticketCode: string, operatorId: number, operatorName: string) {
    const t = await sequelize.transaction();

    try {
      const ticket = await Ticket.findOne({
        where: { ticketCode },
        include: [{ model: Order, as: 'order' }],
        transaction: t,
        lock: true,
      });

      if (!ticket) {
        throw new AppError('票券不存在', 404);
      }

      if (ticket.status !== TicketStatus.UNUSED) {
        const statusMap: Record<string, string> = {
          [TicketStatus.USED]: '已核销',
          [TicketStatus.EXPIRED]: '已过期',
          [TicketStatus.CANCELLED]: '已取消',
        };
        throw new AppError(`票券${statusMap[ticket.status]}，无法核销`, 400);
      }

      if (ticket.expireAt && new Date() > ticket.expireAt) {
        await ticket.update({ status: TicketStatus.EXPIRED }, { transaction: t });
        await t.commit();
        throw new AppError('票券已过期', 400);
      }

      const order = await Order.findByPk(ticket.orderId, {
        include: [{ model: Distributor, as: 'distributor' }],
        transaction: t,
      });

      if (!order) {
        throw new AppError('订单不存在', 404);
      }

      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.EXPIRED) {
        throw new AppError('订单状态异常，无法核销', 400);
      }

      await ticket.update(
        {
          status: TicketStatus.USED,
          verifiedAt: new Date(),
          verifiedBy: operatorId,
          verifierName: operatorName,
        },
        { transaction: t }
      );

      const unusedTickets = await Ticket.count({
        where: { orderId: ticket.orderId, status: TicketStatus.UNUSED },
        transaction: t,
      });

      if (unusedTickets === 0 && order.status !== OrderStatus.VERIFIED) {
        await order.update(
          { status: OrderStatus.VERIFIED },
          { transaction: t }
        );
      }

      await t.commit();
      return ticket;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async batchVerify(ticketCodes: string[], operatorId: number, operatorName: string) {
    const t = await sequelize.transaction();

    try {
      const results = [];
      for (const code of ticketCodes) {
        const ticket = await Ticket.findOne({
          where: { ticketCode: code },
          include: [{ model: Order, as: 'order' }],
          transaction: t,
          lock: true,
        });

        if (!ticket) {
          throw new AppError(`票券 ${code} 不存在`, 404);
        }

        if (ticket.status !== TicketStatus.UNUSED) {
          throw new AppError(`票券 ${code} 状态异常，无法核销`, 400);
        }

        if (ticket.expireAt && new Date() > ticket.expireAt) {
          throw new AppError(`票券 ${code} 已过期`, 400);
        }

        await ticket.update(
          {
            status: TicketStatus.USED,
            verifiedAt: new Date(),
            verifiedBy: operatorId,
            verifierName: operatorName,
          },
          { transaction: t }
        );

        results.push(ticket);
      }

      const orderIds = [...new Set(results.map((t) => t.orderId))];
      for (const orderId of orderIds) {
        const unusedCount = await Ticket.count({
          where: { orderId, status: TicketStatus.UNUSED },
          transaction: t,
        });
        if (unusedCount === 0) {
          await Order.update(
            { status: OrderStatus.VERIFIED },
            { where: { id: orderId }, transaction: t }
          );
        }
      }

      await t.commit();
      return { success: results.length, tickets: results };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const ticket = await Ticket.findByPk(id, {
      include: [{ model: Order, as: 'order', attributes: ['id', 'orderNo', 'visitorName', 'visitorPhone'] }],
    });
    if (!ticket) {
      throw new AppError('票券不存在', 404);
    }
    return ticket;
  }

  async getByCode(code: string) {
    const ticket = await Ticket.findOne({
      where: { ticketCode: code },
      include: [{ model: Order, as: 'order', attributes: ['id', 'orderNo', 'visitorName', 'visitorPhone'] }],
    });
    if (!ticket) {
      throw new AppError('票券不存在', 404);
    }
    return ticket;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    orderId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 10, orderId, status, startDate, endDate, keyword } = params;
    const where: any = {};

    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')],
      };
    }
    if (keyword) {
      where.ticketCode = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNo', 'visitorName'] },
      ],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getVerifyRecords(params: {
    page?: number;
    pageSize?: number;
    operatorId?: number;
    distributorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, operatorId, distributorId, startDate, endDate } = params;

    const where: any = {
      status: TicketStatus.USED,
    };

    if (operatorId) where.verifiedBy = operatorId;
    if (startDate && endDate) {
      where.verifiedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')],
      };
    }

    const include: any[] = [
      {
        model: Order,
        as: 'order',
        attributes: ['id', 'orderNo', 'visitorName', 'visitorPhone'],
        where: distributorId ? { distributorId } : undefined,
        required: !!distributorId,
      },
    ];

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['verifiedAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getStatistics(params: {
    distributorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { distributorId, startDate, endDate } = params;
    const orderWhere: any = {};

    if (distributorId) orderWhere.distributorId = distributorId;
    if (startDate && endDate) {
      orderWhere.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')],
      };
    }

    const [total, used, unused, expired, cancelled] = await Promise.all([
      Ticket.count({
        include: [{ model: Order, as: 'order', where: orderWhere, required: true }],
      }),
      Ticket.count({
        where: { status: TicketStatus.USED },
        include: [{ model: Order, as: 'order', where: orderWhere, required: true }],
      }),
      Ticket.count({
        where: { status: TicketStatus.UNUSED },
        include: [{ model: Order, as: 'order', where: orderWhere, required: true }],
      }),
      Ticket.count({
        where: { status: TicketStatus.EXPIRED },
        include: [{ model: Order, as: 'order', where: orderWhere, required: true }],
      }),
      Ticket.count({
        where: { status: TicketStatus.CANCELLED },
        include: [{ model: Order, as: 'order', where: orderWhere, required: true }],
      }),
    ]);

    return {
      counts: { total, used, unused, expired, cancelled },
      verifyRate: total > 0 ? ((used / total) * 100).toFixed(2) : 0,
    };
  }
}

export const ticketService = new TicketService();

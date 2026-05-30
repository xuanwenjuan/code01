import { Settlement, SettlementStatus } from '../database/models/settlement.model';
import { Order, OrderStatus } from '../database/models/order.model';
import { Distributor } from '../database/models/distributor.model';
import { AppError } from '../middleware/errorHandler';
import { Op, fn, col } from 'sequelize';
import sequelize from '../database/sequelize';
import moment from 'moment';

export class SettlementService {
  generateSettlementNo(): string {
    return 'SET' + moment().format('YYYYMMDDHHmmss') + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  async generateMonthlySettlement(distributorId: number, period: string) {
    const t = await sequelize.transaction();

    try {
      const distributor = await Distributor.findByPk(distributorId, { transaction: t });
      if (!distributor) {
        throw new AppError('分销商不存在', 404);
      }

      const existing = await Settlement.findOne({
        where: { distributorId, period },
        transaction: t,
      });
      if (existing) {
        throw new AppError('该周期的结算单已存在', 400);
      }

      const startDate = moment(period + '-01').startOf('month').toDate();
      const endDate = moment(period + '-01').endOf('month').toDate();

      const orderStats = await Order.findOne({
        where: {
          distributorId,
          status: [OrderStatus.PAID, OrderStatus.VERIFIED],
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
          [fn('COUNT', col('id')), 'orderCount'],
          [fn('SUM', col('total_amount')), 'totalOrderAmount'],
          [fn('SUM', col('commission_amount')), 'commissionAmount'],
        ],
        raw: true,
        transaction: t,
      });

      const settlementNo = this.generateSettlementNo();
      const settlement = await Settlement.create(
        {
          settlementNo,
          distributorId,
          period,
          orderCount: Number(orderStats?.orderCount || 0),
          totalOrderAmount: Number(orderStats?.totalOrderAmount || 0),
          commissionAmount: Number(orderStats?.commissionAmount || 0),
          paidAmount: 0,
          status: SettlementStatus.PENDING,
        },
        { transaction: t }
      );

      await t.commit();
      return settlement;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async confirm(id: number, operatorId: number, operatorName: string) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) {
      throw new AppError('结算单不存在', 404);
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new AppError('结算单状态不正确，只能确认待确认的结算单', 400);
    }

    await settlement.update({
      status: SettlementStatus.CONFIRMED,
      operatorId,
      operatorName,
    });

    return settlement;
  }

  async pay(id: number, paidAmount: number, operatorId: number, operatorName: string) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) {
      throw new AppError('结算单不存在', 404);
    }

    if (settlement.status !== SettlementStatus.CONFIRMED) {
      throw new AppError('结算单未确认，无法支付', 400);
    }

    if (paidAmount <= 0) {
      throw new AppError('支付金额必须大于0', 400);
    }

    await settlement.update({
      status: SettlementStatus.PAID,
      paidAmount,
      paidAt: new Date(),
      operatorId,
      operatorName,
    });

    return settlement;
  }

  async cancel(id: number, operatorId: number, operatorName: string) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) {
      throw new AppError('结算单不存在', 404);
    }

    if (settlement.status === SettlementStatus.PAID) {
      throw new AppError('已支付的结算单无法取消', 400);
    }

    await settlement.destroy();
    return true;
  }

  async getById(id: number) {
    const settlement = await Settlement.findByPk(id, {
      include: [{ model: Distributor, as: 'distributor', attributes: ['id', 'name', 'type', 'commissionRate'] }],
    });
    if (!settlement) {
      throw new AppError('结算单不存在', 404);
    }
    return settlement;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    distributorId?: number;
    status?: string;
    period?: string;
  }) {
    const { page = 1, pageSize = 10, distributorId, status, period } = params;
    const where: any = {};

    if (distributorId) where.distributorId = distributorId;
    if (status) where.status = status;
    if (period) where.period = period;

    const { count, rows } = await Settlement.findAndCountAll({
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

  async getSettlementOrders(settlementId: number) {
    const settlement = await Settlement.findByPk(settlementId);
    if (!settlement) {
      throw new AppError('结算单不存在', 404);
    }

    const startDate = moment(settlement.period + '-01').startOf('month').toDate();
    const endDate = moment(settlement.period + '-01').endOf('month').toDate();

    const orders = await Order.findAll({
      where: {
        distributorId: settlement.distributorId,
        status: [OrderStatus.PAID, OrderStatus.VERIFIED],
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      order: [['createdAt', 'DESC']],
    });

    return orders;
  }

  async getStatistics(distributorId?: number, startDate?: string, endDate?: string) {
    const where: any = {};

    if (distributorId) where.distributorId = distributorId;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')],
      };
    }

    const [pending, confirmed, paid] = await Promise.all([
      this.calculateSettlementStats({ ...where, status: SettlementStatus.PENDING }),
      this.calculateSettlementStats({ ...where, status: SettlementStatus.CONFIRMED }),
      this.calculateSettlementStats({ ...where, status: SettlementStatus.PAID }),
    ]);

    return {
      counts: { pending: pending.count, confirmed: confirmed.count, paid: paid.count },
      amounts: {
        pending: pending.amount,
        confirmed: confirmed.amount,
        paid: paid.amount,
      },
    };
  }

  private async calculateSettlementStats(where: any) {
    const result = await Settlement.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('commission_amount')), 'amount'],
      ],
      raw: true,
    });

    return {
      count: Number(result?.count || 0),
      amount: Number(result?.amount || 0),
    };
  }
}

export const settlementService = new SettlementService();

import Commission, { CommissionAttributes, CommissionStatus } from '../models/Commission.model';
import Order from '../models/Order.model';
import Leader from '../models/Leader.model';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import sequelize from '../config/database';
import { Op, fn, col, Transaction } from 'sequelize';
import { CommissionListQuery, CommissionSettleParams, CommissionWithdrawParams } from '../types';

class CommissionService {
  async createCommission(orderId: number, transaction?: Transaction): Promise<Commission> {
    const t = transaction || await sequelize.transaction();
    
    try {
      const order = await Order.findByPk(orderId, { transaction: t });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      const existingCommission = await Commission.findOne({ 
        where: { orderId },
        transaction: t
      });
      if (existingCommission) {
        throw new BadRequestException('该订单佣金已生成');
      }

      const now = new Date();
      const settlementPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const commission = await Commission.create({
        orderId,
        orderNo: order.orderNo,
        leaderId: order.leaderId,
        orderAmount: order.totalAmount,
        commissionRate: order.commissionRate,
        commissionAmount: order.commissionAmount,
        platformFee: order.platformFee,
        settlementPeriod,
        status: CommissionStatus.PENDING
      }, { transaction: t });

      if (!transaction) {
        await t.commit();
      }

      return commission;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  async getCommissionById(id: number): Promise<Commission> {
    const commission = await Commission.findByPk(id, {
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNo', 'totalAmount', 'status', 'createdAt'] },
        { model: Leader, as: 'leader', attributes: ['id', 'communityName', 'phone', 'realName'] }
      ]
    });
    if (!commission) {
      throw new NotFoundException('佣金记录不存在');
    }
    return commission;
  }

  async getCommissionList(params: CommissionListQuery): Promise<{ 
    list: Commission[]; 
    total: number; 
    page: number; 
    pageSize: number;
    summary?: {
      totalCommissionAmount: number;
      totalPlatformFee: number;
      totalOrderAmount: number;
    }
  }> {
    const { page = 1, pageSize = 10, status, leaderId, settlementPeriod, startDate, endDate } = params;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (leaderId) {
      where.leaderId = leaderId;
    }
    if (settlementPeriod) {
      where.settlementPeriod = settlementPeriod;
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

    const { count, rows } = await Commission.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNo', 'totalAmount'] },
        { model: Leader, as: 'leader', attributes: ['id', 'communityName'] }
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    const summary = await Commission.findOne({
      where,
      attributes: [
        [fn('SUM', col('commissionAmount')), 'totalCommissionAmount'],
        [fn('SUM', col('platformFee')), 'totalPlatformFee'],
        [fn('SUM', col('orderAmount')), 'totalOrderAmount']
      ],
      raw: true
    }) as any;

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      summary: {
        totalCommissionAmount: Number(summary?.totalCommissionAmount || 0),
        totalPlatformFee: Number(summary?.totalPlatformFee || 0),
        totalOrderAmount: Number(summary?.totalOrderAmount || 0)
      }
    };
  }

  async settleCommissions(params: CommissionSettleParams): Promise<void> {
    const { commissionIds, settlementPeriod } = params;
    const t = await sequelize.transaction();

    try {
      const commissions = await Commission.findAll({
        where: {
          id: { [Op.in]: commissionIds },
          status: CommissionStatus.PENDING
        },
        transaction: t
      });

      if (commissions.length === 0) {
        throw new BadRequestException('没有可结算的佣金');
      }

      if (commissions.length !== commissionIds.length) {
        throw new BadRequestException('部分佣金不可结算或不存在');
      }

      await Commission.update(
        {
          status: CommissionStatus.SETTLED,
          settledAt: new Date()
        },
        {
          where: { id: { [Op.in]: commissionIds } },
          transaction: t
        }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async withdrawCommissions(params: CommissionWithdrawParams): Promise<void> {
    const { commissionIds, leaderId } = params;
    const t = await sequelize.transaction();

    try {
      const commissions = await Commission.findAll({
        where: {
          id: { [Op.in]: commissionIds },
          leaderId,
          status: CommissionStatus.SETTLED
        },
        transaction: t
      });

      if (commissions.length === 0) {
        throw new BadRequestException('没有可提现的佣金');
      }

      if (commissions.length !== commissionIds.length) {
        throw new BadRequestException('部分佣金不可提现或不存在');
      }

      await Commission.update(
        {
          status: CommissionStatus.WITHDRAWN,
          withdrawnAt: new Date()
        },
        {
          where: { id: { [Op.in]: commissionIds } },
          transaction: t
        }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getCommissionStatistics(leaderId?: number): Promise<any> {
    const where: any = {};
    if (leaderId) {
      where.leaderId = leaderId;
    }

    const [pending, settled, withdrawn] = await Promise.all([
      Commission.sum('commissionAmount', { where: { ...where, status: CommissionStatus.PENDING } }),
      Commission.sum('commissionAmount', { where: { ...where, status: CommissionStatus.SETTLED } }),
      Commission.sum('commissionAmount', { where: { ...where, status: CommissionStatus.WITHDRAWN } })
    ]);

    const counts = await Promise.all([
      Commission.count({ where: { ...where, status: CommissionStatus.PENDING } }),
      Commission.count({ where: { ...where, status: CommissionStatus.SETTLED } }),
      Commission.count({ where: { ...where, status: CommissionStatus.WITHDRAWN } })
    ]);

    return {
      pendingAmount: Number(pending || 0),
      pendingCount: counts[0],
      settledAmount: Number(settled || 0),
      settledCount: counts[1],
      withdrawnAmount: Number(withdrawn || 0),
      withdrawnCount: counts[2],
      totalAmount: Number(pending || 0) + Number(settled || 0) + Number(withdrawn || 0),
      totalCount: counts[0] + counts[1] + counts[2]
    };
  }

  async getSettlementPeriods(leaderId?: number): Promise<string[]> {
    const where: any = {};
    if (leaderId) {
      where.leaderId = leaderId;
    }

    const result = await Commission.findAll({
      where,
      attributes: [[fn('DISTINCT', col('settlementPeriod')), 'period']],
      order: [[col('settlementPeriod'), 'DESC']],
      raw: true
    });
    return result.map((item: any) => item.period);
  }

  async getReconciliationReport(settlementPeriod: string, leaderId?: number): Promise<any> {
    const where: any = { settlementPeriod };
    if (leaderId) {
      where.leaderId = leaderId;
    }

    const commissions = await Commission.findAll({
      where,
      include: [
        { model: Leader, as: 'leader', attributes: ['id', 'communityName', 'realName', 'phone'] },
        { model: Order, as: 'order', attributes: ['id', 'orderNo', 'totalAmount', 'createdAt'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const summary = await Commission.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalCount'],
        [fn('SUM', col('orderAmount')), 'totalOrderAmount'],
        [fn('SUM', col('commissionAmount')), 'totalCommissionAmount'],
        [fn('SUM', col('platformFee')), 'totalPlatformFee']
      ],
      raw: true
    }) as any;

    const statusSummary = await Commission.findAll({
      where,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('commissionAmount')), 'amount']
      ],
      group: ['status'],
      raw: true
    });

    return {
      settlementPeriod,
      commissions,
      summary: {
        totalCount: Number(summary?.totalCount || 0),
        totalOrderAmount: Number(summary?.totalOrderAmount || 0),
        totalCommissionAmount: Number(summary?.totalCommissionAmount || 0),
        totalPlatformFee: Number(summary?.totalPlatformFee || 0)
      },
      statusSummary
    };
  }
}

export default new CommissionService();

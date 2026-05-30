import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { Settlement, Rider, Order } from '../models';
import { BusinessError, ErrorCode } from '../utils/businessError';
import { SettlementStatus, OrderStatus, CommissionBreakdown, SettlementStatistics } from '../types';
import moment from 'moment';
import logger from '../config/logger';

const PLATFORM_FEE_RATE = 0.2;

export class SettlementService {
  static generateSettlementNo() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ST${timestamp}${random}`;
  }

  static calculateOrderCommission(order: Order): CommissionBreakdown {
    const orderAmount = parseFloat(order.totalAmount.toString());
    const platformFee = parseFloat(order.platformFee.toString());
    const riderCommission = parseFloat(order.riderCommission.toString());

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      orderAmount,
      platformRate: PLATFORM_FEE_RATE,
      platformFee,
      riderCommission,
      completedAt: order.completedAt!
    };
  }

  static async calculateSettlement(riderId: number, startDate: Date, endDate: Date) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    const orders = await Order.findAll({
      where: {
        riderId,
        status: OrderStatus.COMPLETED,
        completedAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    if (orders.length === 0) {
      return {
        orderCount: 0,
        totalAmount: 0,
        totalPlatformFee: 0,
        totalRiderCommission: 0,
        commissionBreakdown: []
      };
    }

    const commissionBreakdown = orders.map(order => this.calculateOrderCommission(order));

    const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
    const totalPlatformFee = orders.reduce((sum, order) => sum + parseFloat(order.platformFee.toString()), 0);
    const totalRiderCommission = orders.reduce((sum, order) => sum + parseFloat(order.riderCommission.toString()), 0);

    return {
      orderCount: orders.length,
      totalAmount,
      totalPlatformFee,
      totalRiderCommission,
      commissionBreakdown
    };
  }

  static async createSettlement(riderId: number, startDate: Date, endDate: Date, operatorId?: number) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    const existingSettlement = await Settlement.findOne({
      where: {
        riderId,
        startDate,
        endDate
      }
    });
    if (existingSettlement) {
      throw new BusinessError('该时间段的结算单已存在', ErrorCode.SETTLEMENT_ALREADY_EXISTS);
    }

    const settlementCalc = await this.calculateSettlement(riderId, startDate, endDate);
    if (settlementCalc.orderCount === 0) {
      throw new BusinessError('该时间段内没有完成的订单');
    }

    const settlementNo = this.generateSettlementNo();

    const settlement = await sequelize.transaction(async (t) => {
      const newSettlement = await Settlement.create(
        {
          settlementNo,
          riderId,
          orderCount: settlementCalc.orderCount,
          totalAmount: settlementCalc.totalAmount,
          riderCommission: settlementCalc.totalRiderCommission,
          platformFee: settlementCalc.totalPlatformFee,
          status: SettlementStatus.PENDING,
          startDate,
          endDate
        },
        { transaction: t }
      );

      logger.info(`结算单创建: ${settlementNo}, 骑手: ${rider.realName}, 金额: ${settlementCalc.totalRiderCommission}`);

      return newSettlement;
    });

    return settlement;
  }

  static async batchCreateSettlements(startDate: Date, endDate: Date, operatorId?: number) {
    const riders = await Rider.findAll();
    const settlements = [];
    const errors = [];

    for (const rider of riders) {
      try {
        const settlement = await this.createSettlement(rider.id, startDate, endDate, operatorId);
        settlements.push(settlement);
      } catch (error) {
        errors.push({
          riderId: rider.id,
          riderName: rider.realName,
          error: (error as Error).message
        });
      }
    }

    logger.info(`批量创建结算单完成: 成功${settlements.length}条, 失败${errors.length}条`);

    return { settlements, errors };
  }

  static async confirmSettlement(settlementId: number, operatorId?: number, remark?: string) {
    const settlement = await Settlement.findByPk(settlementId);
    if (!settlement) {
      throw BusinessError.notFound('结算单不存在');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new BusinessError('结算单状态不允许确认', ErrorCode.SETTLEMENT_STATUS_ERROR);
    }

    const rider = await Rider.findByPk(settlement.riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    const riderBalance = parseFloat(rider.balance.toString());
    const commissionAmount = parseFloat(settlement.riderCommission.toString());

    if (riderBalance < commissionAmount) {
      throw new BusinessError('骑手余额不足', ErrorCode.INSUFFICIENT_BALANCE);
    }

    await sequelize.transaction(async (t) => {
      await settlement.update(
        { 
          status: SettlementStatus.SETTLED, 
          settledAt: new Date(),
          remark
        },
        { transaction: t }
      );

      await Rider.decrement(
        { balance: commissionAmount },
        { where: { id: settlement.riderId }, transaction: t }
      );

      logger.info(`结算单确认: ${settlement.settlementNo}, 扣款金额: ${commissionAmount}, 操作员: ${operatorId}`);
    });

    return settlement;
  }

  static async getSettlementList(
    riderId?: number,
    status?: SettlementStatus,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 10
  ) {
    const offset = (page - 1) * pageSize;
    const where: any = {};

    if (riderId) {
      where.riderId = riderId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [{ model: Rider, as: 'rider', attributes: ['realName', 'phone'] }]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getSettlementDetail(settlementId: number) {
    const settlement = await Settlement.findByPk(settlementId, {
      include: [
        { model: Rider, as: 'rider', attributes: ['realName', 'phone'] }
      ]
    });

    if (!settlement) {
      throw BusinessError.notFound('结算单不存在');
    }

    return settlement;
  }

  static async getSettlementOrders(settlementId: number) {
    const settlement = await Settlement.findByPk(settlementId);
    if (!settlement) {
      throw BusinessError.notFound('结算单不存在');
    }

    const orders = await Order.findAll({
      where: {
        riderId: settlement.riderId,
        status: OrderStatus.COMPLETED,
        completedAt: {
          [Op.between]: [settlement.startDate, settlement.endDate]
        }
      },
      order: [['completedAt', 'DESC']]
    });

    const breakdown = orders.map(order => this.calculateOrderCommission(order));

    return {
      orders,
      commissionBreakdown: breakdown
    };
  }

  static async getRiderSettlementSummary(riderId: number, startDate?: Date, endDate?: Date) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    const where: any = { riderId };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const pendingSettlements = await Settlement.findAll({
      where: { ...where, status: SettlementStatus.PENDING }
    });

    const settledSettlements = await Settlement.findAll({
      where: { ...where, status: SettlementStatus.SETTLED }
    });

    const pendingAmount = pendingSettlements.reduce(
      (sum, s) => sum + parseFloat(s.riderCommission.toString()),
      0
    );

    const settledAmount = settledSettlements.reduce(
      (sum, s) => sum + parseFloat(s.riderCommission.toString()),
      0
    );

    const unsettledOrders = await Order.findAll({
      where: {
        riderId,
        status: OrderStatus.COMPLETED
      }
    });

    const allSettledOrderIds = [...pendingSettlements, ...settledSettlements].flatMap(s => {
      return [];
    });

    const unsettledAmount = unsettledOrders
      .filter(o => !allSettledOrderIds.includes(o.id))
      .reduce((sum, o) => sum + parseFloat(o.riderCommission.toString()), 0);

    return {
      rider: {
        id: rider.id,
        realName: rider.realName,
        phone: rider.phone,
        currentBalance: rider.balance
      },
      pendingCount: pendingSettlements.length,
      pendingAmount,
      settledCount: settledSettlements.length,
      settledAmount,
      unsettledAmount,
      totalCommission: pendingAmount + settledAmount + unsettledAmount
    };
  }

  static async cancelSettlement(settlementId: number, operatorId?: number, remark?: string) {
    const settlement = await Settlement.findByPk(settlementId);
    if (!settlement) {
      throw BusinessError.notFound('结算单不存在');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new BusinessError('结算单状态不允许取消', ErrorCode.SETTLEMENT_STATUS_ERROR);
    }

    await settlement.destroy();
    
    logger.info(`结算单取消: ${settlement.settlementNo}, 操作员: ${operatorId}, 备注: ${remark}`);
    
    return true;
  }

  static async getSettlementStatistics(startDate?: Date, endDate?: Date): Promise<SettlementStatistics> {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const settlements = await Settlement.findAll({ where });

    const pendingSettlements = settlements.filter(s => s.status === SettlementStatus.PENDING);
    const settledSettlements = settlements.filter(s => s.status === SettlementStatus.SETTLED);

    return {
      totalCount: settlements.length,
      pendingCount: pendingSettlements.length,
      settledCount: settledSettlements.length,
      totalAmount: settlements.reduce((sum, s) => sum + parseFloat(s.totalAmount.toString()), 0),
      totalCommission: settlements.reduce((sum, s) => sum + parseFloat(s.riderCommission.toString()), 0),
      totalPlatformFee: settlements.reduce((sum, s) => sum + parseFloat(s.platformFee.toString()), 0),
      pendingAmount: pendingSettlements.reduce((sum, s) => sum + parseFloat(s.riderCommission.toString()), 0),
      settledAmount: settledSettlements.reduce((sum, s) => sum + parseFloat(s.riderCommission.toString()), 0)
    };
  }

  static async autoSettle() {
    const today = moment();
    const startDate = today.clone().subtract(7, 'days').startOf('day').toDate();
    const endDate = today.clone().subtract(1, 'days').endOf('day').toDate();

    logger.info(`开始自动结算: ${moment(startDate).format('YYYY-MM-DD')} 至 ${moment(endDate).format('YYYY-MM-DD')}`);

    const result = await this.batchCreateSettlements(startDate, endDate);

    logger.info(`自动结算完成: 成功${result.settlements.length}条, 失败${result.errors.length}条`);

    return result;
  }
}

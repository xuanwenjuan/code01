import { Settlement, ChargingOrder, ChargingSite, OperationLog } from '../models';
import { SettlementStatus, PaginationParams } from '../types';
import { AppError, NotFoundException, BadRequestException } from '../middleware/error.middleware';
import { Transaction, Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';
import logger from '../config/logger';
import { OperationType } from './operationLog.service';

interface SettlementFilterParams extends PaginationParams {
  siteId?: number;
  status?: SettlementStatus;
  startDate?: string;
  endDate?: string;
  settlementDate?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SettlementService {
  generateSettlementNo(): string {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `JS${timestamp}${random}`;
  }

  async createDailySettlement(date?: string, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const settlementDate = date ? moment(date) : moment().subtract(1, 'days');
      const startOfDay = settlementDate.startOf('day').toDate();
      const endOfDay = settlementDate.endOf('day').toDate();

      const existingSettlement = await Settlement.findOne({
        where: {
          settlementDate: settlementDate.toDate(),
        },
        transaction: t,
      });

      if (existingSettlement) {
        throw new BadRequestException('该日期的结算已存在');
      }

      const completedOrders = await ChargingOrder.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        transaction: t,
      });

      if (completedOrders.length === 0) {
        await t.commit();
        return {
          success: true,
          message: '当日无完成订单，无需结算',
          settlementCount: 0,
        };
      }

      const siteGroups: Map<number, ChargingOrder[]> = new Map();

      for (const order of completedOrders) {
        const siteId = order.siteId;
        if (!siteGroups.has(siteId)) {
          siteGroups.set(siteId, []);
        }
        siteGroups.get(siteId)!.push(order);
      }

      const settlements: Settlement[] = [];

      for (const [siteId, orders] of siteGroups) {
        const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const platformShare = orders.reduce((sum, order) => sum + Number(order.platformShareAmount), 0);
        const maintenanceShare = orders.reduce((sum, order) => sum + Number(order.maintenanceShareAmount), 0);
        const siteShare = totalAmount - platformShare - maintenanceShare;

        const settlementNo = this.generateSettlementNo();

        const settlement = await Settlement.create(
          {
            settlementNo,
            siteId,
            settlementDate: settlementDate.toDate(),
            orderCount: orders.length,
            totalAmount,
            platformShare,
            maintenanceShare,
            siteShare,
            platformShareRate: 15,
            maintenanceShareRate: 5,
            siteShareRate: 80,
            status: SettlementStatus.PENDING,
          },
          { transaction: t }
        );

        for (const order of orders) {
          await order.update(
            {
              settlementId: settlement.id,
              status: 'settled',
            },
            { transaction: t }
          );
        }

        settlements.push(settlement);

        logger.info(`站点 ${siteId} 结算完成: 订单数 ${orders.length}, 总金额 ${totalAmount}`);
      }

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: '/api/settlements/daily',
          body: JSON.stringify({ date }),
          statusCode: 200,
          operationType: OperationType.CREATE,
          description: `生成日结算: 日期 ${settlementDate.format('YYYY-MM-DD')}, 结算数 ${settlements.length}`,
        },
        { transaction: t }
      );

      await t.commit();

      return {
        success: true,
        settlementDate: settlementDate.format('YYYY-MM-DD'),
        settlementCount: settlements.length,
        totalAmount: settlements.reduce((sum, s) => sum + Number(s.totalAmount), 0),
        settlements,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async createMonthlySettlement(year?: number, month?: number, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const targetYear = year || moment().year();
      const targetMonth = month || moment().month() + 1;

      const startOfMonth = moment(`${targetYear}-${targetMonth}-01', 'YYYY-MM-DD').startOf('month');
      const endOfMonth = startOfMonth.clone().endOf('month');

      const settlements = await Settlement.findAll({
        where: {
          settlementDate: {
            [Op.between]: [startOfMonth.toDate(), endOfMonth.toDate()],
          },
        },
        transaction: t,
      });

      logger.info(`月结算查询到 ${settlements.length} 条日结算记录`);

      await t.commit();

      return {
        success: true,
        month: `${targetYear}-${String(targetMonth).padStart(2, '0')},
        dailySettlementCount: settlements.length,
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async confirmSettlement(id: number, operatorId?: number, remark?: string) {
    const t: Transaction = await sequelize.transaction();

    try {
      const settlement = await Settlement.findByPk(id, {
        include: [{ model: ChargingSite, as: 'site' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!settlement) {
        throw new NotFoundException('结算记录不存在');
      }

      if (settlement.status !== SettlementStatus.PENDING) {
        throw new BadRequestException('只有待确认的结算可以确认');
      }

      await settlement.update(
        {
          status: SettlementStatus.CONFIRMED,
          confirmedAt: new Date(),
          confirmedBy: operatorId,
          remark,
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/settlements/${id}/confirm`,
          params: JSON.stringify({ id }),
          body: JSON.stringify({ remark }),
          statusCode: 200,
          operationType: OperationType.CONFIRM_SETTLEMENT,
          description: `确认结算: ${settlement.settlementNo}, 站点: ${settlement.site?.name}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`结算 ${settlement.settlementNo} 已确认`);

      return settlement;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async batchConfirmSettlement(ids: number[], operatorId?: number, remark?: string) {
    const t: Transaction = await sequelize.transaction();

    try {
      const settlements = await Settlement.findAll({
        where: { id: { [Op.in]: ids } },
        transaction: t,
      });

      if (settlements.length !== ids.length) {
        throw new NotFoundException('部分结算记录不存在');
      }

      for (const settlement of settlements) {
        if (settlement.status !== SettlementStatus.PENDING) {
          throw new BadRequestException(`结算 ${settlement.settlementNo} 不是待确认状态');
        }
      }

      await Settlement.update(
        {
          status: SettlementStatus.CONFIRMED,
          confirmedAt: new Date(),
          confirmedBy: operatorId,
          remark,
        },
        {
          where: { id: { [Op.in]: ids } },
          transaction: t,
        }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: '/api/settlements/batch-confirm',
          body: JSON.stringify({ ids, remark }),
          statusCode: 200,
          operationType: OperationType.BATCH_CONFIRM_SETTLEMENT,
          description: `批量确认结算: ${settlements.map((s) => s.settlementNo).join(', ')}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`批量确认 ${settlements.length} 条结算记录`);

      return { success: true, confirmedCount: settlements.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const settlement = await Settlement.findByPk(id, {
      include: [
        {
          model: ChargingSite,
          as: 'site',
          attributes: ['id', 'siteCode', 'name', 'address'],
        },
      ],
    });

    if (!settlement) {
      throw new NotFoundException('结算记录不存在');
    }

    return settlement;
  }

  async getList(params: SettlementFilterParams) {
    const {
      page = 1,
      pageSize = 10,
      siteId,
      status,
      startDate,
      endDate,
      settlementDate,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (siteId) {
      where.siteId = siteId;
    }

    if (status) {
      where.status = status;
    }

    if (settlementDate) {
      where.settlementDate = new Date(settlementDate);
    }

    if (startDate) {
      where.settlementDate = { ...where.settlementDate, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      where.settlementDate = {
        ...where.settlementDate,
        [Op.lte]: new Date(endDate + ' 23:59:59'),
      };
    }

    if (keyword) {
      where.settlementNo = { [Op.like]: `%${keyword}%` };
    }

    const order: [string, string][] = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        {
          model: ChargingSite,
          as: 'site',
          attributes: ['id', 'siteCode', 'name', 'address'],
        },
      ],
      order,
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getStatistics(params: {
    siteId?: number;
    startDate?: string;
    endDate?: string;
    status?: SettlementStatus;
  }) {
    const { siteId, startDate, endDate, status } = params;

    const where: any = {};

    if (siteId) {
      where.siteId = siteId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.settlementDate = { ...where.settlementDate, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      where.settlementDate = {
        ...where.settlementDate,
        [Op.lte]: new Date(endDate + ' 23:59:59'),
      };
    }

    const stats = await Settlement.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalSettlements'],
        [fn('SUM', col('orderCount')), 'totalOrders'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('platformShare')), 'totalPlatformShare'],
        [fn('SUM', col('maintenanceShare')), 'totalMaintenanceShare'],
        [fn('SUM', col('siteShare')), 'totalSiteShare'],
      ],
      raw: true,
    });

    const statusStats = await Settlement.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    return {
      totalSettlements: Number((stats as any).totalSettlements) || 0,
      totalOrders: Number((stats as any).totalOrders) || 0,
      totalAmount: Number((stats as any).totalAmount) || 0,
      totalPlatformShare: Number((stats as any).totalPlatformShare) || 0,
      totalMaintenanceShare: Number((stats as any).totalMaintenanceShare) || 0,
      totalSiteShare: Number((stats as any).totalSiteShare) || 0,
      statusStats,
    };
  }

  async getSettlementTrend(params: {
    days?: number;
    siteId?: number;
  }) {
    const { days = 30, siteId } = params;
    const results: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');

      const where: any = {
        settlementDate: new Date(date),
      };

      if (siteId) {
        where.siteId = siteId;
      }

      const stats = await Settlement.findOne({
        where,
        attributes: [
          [fn('COUNT', col('id')), 'settlementCount'],
          [fn('SUM', col('orderCount')), 'orderCount'],
          [fn('SUM', col('totalAmount')), 'totalAmount'],
        ],
        raw: true,
      });

      results.push({
        date,
        settlementCount: Number((stats as any).settlementCount) || 0,
        orderCount: Number((stats as any).orderCount) || 0,
        totalAmount: Number((stats as any).totalAmount) || 0,
      });
    }

    return results;
  }

  async getSiteSummary(siteId: number) {
    const today = moment().startOf('day');

    const todayStats = await Settlement.findOne({
      where: {
      siteId,
      settlementDate: today.toDate(),
    },
    attributes: [
      [fn('COUNT', col('id')), 'settlementCount'],
      [fn('SUM', col('orderCount')), 'orderCount'],
      [fn('SUM', col('totalAmount')), 'totalAmount'],
      [fn('SUM', col('siteShare')), 'siteShare'],
    ],
    raw: true,
  });

    const thisMonth = moment().startOf('month');

    const monthStats = await Settlement.findOne({
      where: {
        siteId,
        settlementDate: {
          [Op.gte]: thisMonth.toDate(),
        },
      },
      attributes: [
        [fn('COUNT', col('id')), 'settlementCount'],
        [fn('SUM', col('orderCount')), 'orderCount'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('siteShare')), 'siteShare'],
      ],
      raw: true,
    });

    const allTimeStats = await Settlement.findOne({
      where: { siteId },
      attributes: [
        [fn('COUNT', col('id')), 'settlementCount'],
        [fn('SUM', col('orderCount')), 'orderCount'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('siteShare')), 'siteShare'],
      ],
      raw: true,
    });

    return {
      today: {
        settlementCount: Number((todayStats as any).settlementCount) || 0,
        orderCount: Number((todayStats as any).orderCount) || 0,
        totalAmount: Number((todayStats as any).totalAmount) || 0,
        siteShare: Number((todayStats as any).siteShare) || 0,
      },
      thisMonth: {
        settlementCount: Number((monthStats as any).settlementCount) || 0,
        orderCount: Number((monthStats as any).orderCount) || 0,
        totalAmount: Number((monthStats as any).totalAmount) || 0,
        siteShare: Number((monthStats as any).siteShare) || 0,
      },
      allTime: {
        settlementCount: Number((allTimeStats as any).settlementCount) || 0,
        orderCount: Number((allTimeStats as any).orderCount) || 0,
        totalAmount: Number((allTimeStats as any).totalAmount) || 0,
        siteShare: Number((allTimeStats as any).siteShare) || 0,
      },
    };
  }

  async reconcile(date: string, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const targetDate = moment(date);
      const startOfDay = targetDate.startOf('day').toDate();
      const endOfDay = targetDate.endOf('day').toDate();

      const orders = await ChargingOrder.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        include: [{ model: Settlement, as: 'settlement' }],
        transaction: t,
      });

      const unsettledOrders = orders.filter((order) => !order.settlementId);
      const settledOrders = orders.filter((order) => order.settlementId);

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: '/api/settlements/reconcile',
          body: JSON.stringify({ date }),
          statusCode: 200,
          operationType: OperationType.UPDATE,
          description: `对账检查: 日期 ${date}, 总订单 ${orders.length}, 已结算 ${settledOrders.length}, 未结算 ${unsettledOrders.length}`,
        },
        { transaction: t }
      );

      await t.commit();

      return {
        date,
        totalOrders: orders.length,
        settledOrders: settledOrders.length,
        unsettledOrders: unsettledOrders.length,
        unsettledOrderIds: unsettledOrders.map((o) => o.id),
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new SettlementService();

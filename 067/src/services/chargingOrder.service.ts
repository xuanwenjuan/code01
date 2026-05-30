import { ChargingOrder, User, ChargingPile, ChargingSite, FeeTemplate, OperationLog } from '../models';
import { OrderStatus, ChargeType, ChargingPileStatus, UserRole } from '../types';
import { AppError, NotFoundException, BadRequestException, ForbiddenException } from '../middleware/error.middleware';
import { Transaction, Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';
import logger from '../config/logger';
import { OperationType } from './operationLog.service';

export class ChargingOrderService {
  generateOrderNo(): string {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CD${timestamp}${random}`;
  }

  getChargeType(time: Date): ChargeType {
    const hour = time.getHours();

    if (hour >= 8 && hour < 12) {
      return ChargeType.PEAK;
    } else if (hour >= 12 && hour < 18) {
      return ChargeType.NORMAL;
    } else if (hour >= 18 && hour < 22) {
      return ChargeType.PEAK;
    } else {
      return ChargeType.VALLEY;
    }
  }

  getPriceMultiplier(chargeType: ChargeType, feeTemplate: FeeTemplate): number {
    switch (chargeType) {
      case ChargeType.PEAK:
        return feeTemplate.peakMultiplier || 1.5;
      case ChargeType.VALLEY:
        return feeTemplate.valleyMultiplier || 0.7;
      default:
        return feeTemplate.normalMultiplier || 1;
    }
  }

  calculateChargingPrice(
    startTime: Date,
    endTime: Date,
    energy: number,
    feeTemplate: FeeTemplate,
    customElectricityPrice?: number,
    customServiceFee?: number
  ) {
    const baseElectricityPrice = customElectricityPrice || Number(feeTemplate.electricityPrice);
    const baseServiceFee = customServiceFee || Number(feeTemplate.serviceFee);

    const startMoment = moment(startTime);
    const endMoment = moment(endTime);
    const totalMinutes = endMoment.diff(startMoment, 'minutes');

    const chargeType = this.getChargeType(startTime);
    const multiplier = this.getPriceMultiplier(chargeType, feeTemplate);

    const electricityPrice = Number((baseElectricityPrice * multiplier).toFixed(4));
    const serviceFee = Number((baseServiceFee * multiplier).toFixed(4));

    const electricityAmount = Number((energy * electricityPrice).toFixed(2));
    const serviceAmount = Number((energy * serviceFee).toFixed(2));
    const totalAmount = Number((electricityAmount + serviceAmount).toFixed(2));

    const platformShareRate = Number(feeTemplate.platformShare) || 15;
    const maintenanceShareRate = Number(feeTemplate.maintenanceShare) || 5;
    const siteShareRate = 100 - platformShareRate - maintenanceShareRate;

    const platformShareAmount = Number((totalAmount * (platformShareRate / 100)).toFixed(2));
    const maintenanceShareAmount = Number((totalAmount * (maintenanceShareRate / 100)).toFixed(2));
    const siteShareAmount = Number((totalAmount - platformShareAmount - maintenanceShareAmount).toFixed(2));

    return {
      chargeType,
      electricityPrice,
      serviceFee,
      electricityAmount,
      serviceAmount,
      totalAmount,
      platformShareAmount,
      platformShareRate,
      maintenanceShareAmount,
      maintenanceShareRate,
      siteShareAmount,
      siteShareRate,
      duration: totalMinutes,
    };
  }

  private canTransitionStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CHARGING, OrderStatus.CANCELLED, OrderStatus.ABNORMAL],
      [OrderStatus.CHARGING]: [OrderStatus.COMPLETED, OrderStatus.PAUSED, OrderStatus.ABNORMAL, OrderStatus.CANCELLED],
      [OrderStatus.PAUSED]: [OrderStatus.CHARGING, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [OrderStatus.SETTLED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.ABNORMAL]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.SETTLED],
      [OrderStatus.SETTLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  async startCharging(data: {
    userId: number;
    pileId: number;
    startSoc?: number;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(data.userId, { transaction: t });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      if (!user.isActive) {
        throw new BadRequestException('用户账户已被禁用');
      }

      if (Number(user.balance) <= 0) {
        throw new BadRequestException('账户余额不足，请先充值');
      }

      const pile = await ChargingPile.findByPk(data.pileId, {
        include: [
          {
            model: ChargingSite,
            as: 'site',
            include: [
              {
                model: FeeTemplate,
                as: 'feeTemplate',
              },
            ],
          },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (pile.status !== ChargingPileStatus.ONLINE) {
        throw new BadRequestException('充电桩未在线，无法充电');
      }

      if (!pile.site?.isOperating) {
        throw new BadRequestException('该站点已停运，无法充电');
      }

      const userActiveOrder = await ChargingOrder.count({
        where: {
          userId: data.userId,
          status: { [Op.in]: [OrderStatus.PENDING, OrderStatus.CHARGING, OrderStatus.PAUSED] },
        },
        transaction: t,
      });

      if (userActiveOrder > 0) {
        throw new BadRequestException('您有正在进行的充电订单');
      }

      const pileActiveOrder = await ChargingOrder.count({
        where: {
          pileId: data.pileId,
          status: { [Op.in]: [OrderStatus.PENDING, OrderStatus.CHARGING, OrderStatus.PAUSED] },
        },
        transaction: t,
      });

      if (pileActiveOrder > 0) {
        throw new BadRequestException('该充电桩正在使用中');
      }

      const orderNo = this.generateOrderNo();
      const startTime = new Date();

      const order = await ChargingOrder.create(
        {
          orderNo,
          userId: data.userId,
          pileId: data.pileId,
          siteId: pile.siteId,
          status: OrderStatus.CHARGING,
          startTime,
          startSoc: data.startSoc || 0,
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: data.userId,
          username: user.username,
          role: user.role,
          method: 'POST',
          path: `/api/charging-orders/start`,
          params: JSON.stringify({ pileId: data.pileId }),
          body: JSON.stringify(data),
          statusCode: 200,
          operationType: OperationType.START_CHARGING,
          description: `开始充电: 订单号 ${orderNo}, 充电桩 ${pile.pileCode}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`订单 ${orderNo} 开始充电成功`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async endCharging(orderId: number, data: { endSoc?: number; energy: number; operatorId?: number }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await ChargingOrder.findByPk(orderId, {
        include: [
          {
            model: ChargingPile,
            as: 'pile',
            include: [
              {
                model: ChargingSite,
                as: 'site',
                include: [
                  {
                    model: FeeTemplate,
                    as: 'feeTemplate',
                  },
                ],
              },
            ],
          },
          {
            model: User,
            as: 'user',
          },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (!this.canTransitionStatus(order.status, OrderStatus.COMPLETED)) {
        throw new BadRequestException('当前订单状态不支持结束充电');
      }

      const feeTemplate = order.pile?.site?.feeTemplate;

      if (!feeTemplate) {
        throw new BadRequestException('站点未配置收费模板');
      }

      const startTime = order.startTime || order.createdAt;
      const endTime = new Date();

      const priceInfo = this.calculateChargingPrice(
        startTime,
        endTime,
        data.energy,
        feeTemplate,
        order.pile?.customElectricityPrice,
        order.pile?.customServiceFee
      );

      if (Number(order.user?.balance) < priceInfo.totalAmount) {
        throw new BadRequestException('账户余额不足');
      }

      await order.user?.decrement('balance', {
        by: priceInfo.totalAmount,
        transaction: t,
      });

      await order.pile?.increment('totalEnergy', {
        by: data.energy,
        transaction: t,
      });

      await order.pile?.increment('totalDuration', {
        by: priceInfo.duration,
        transaction: t,
      });

      await order.update(
        {
          status: OrderStatus.COMPLETED,
          endTime,
          duration: priceInfo.duration,
          endSoc: data.endSoc || 0,
          energy: data.energy,
          electricityPrice: priceInfo.electricityPrice,
          serviceFee: priceInfo.serviceFee,
          electricityAmount: priceInfo.electricityAmount,
          serviceAmount: priceInfo.serviceAmount,
          totalAmount: priceInfo.totalAmount,
          platformShareAmount: priceInfo.platformShareAmount,
          maintenanceShareAmount: priceInfo.maintenanceShareAmount,
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: data.operatorId || order.userId,
          username: order.user?.username,
          role: order.user?.role,
          method: 'POST',
          path: `/api/charging-orders/${orderId}/end`,
          params: JSON.stringify({ id: orderId }),
          body: JSON.stringify(data),
          statusCode: 200,
          operationType: OperationType.END_CHARGING,
          description: `结束充电: 订单号 ${order.orderNo}, 充电量 ${data.energy}kWh, 金额 ${priceInfo.totalAmount}元`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`订单 ${order.orderNo} 结束充电成功, 金额: ${priceInfo.totalAmount}元`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async pauseCharging(orderId: number, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await ChargingOrder.findByPk(orderId, {
        include: [
          { model: User, as: 'user' },
          { model: ChargingPile, as: 'pile' },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (!this.canTransitionStatus(order.status, OrderStatus.PAUSED)) {
        throw new BadRequestException('当前订单状态不支持暂停');
      }

      await order.update({ status: OrderStatus.PAUSED }, { transaction: t });

      await OperationLog.create(
        {
          userId: operatorId || order.userId,
          username: order.user?.username,
          role: order.user?.role,
          method: 'POST',
          path: `/api/charging-orders/${orderId}/pause`,
          params: JSON.stringify({ id: orderId }),
          body: JSON.stringify({}),
          statusCode: 200,
          operationType: OperationType.PAUSE_CHARGING,
          description: `暂停充电: 订单号 ${order.orderNo}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`订单 ${order.orderNo} 暂停充电`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async resumeCharging(orderId: number, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await ChargingOrder.findByPk(orderId, {
        include: [
          { model: User, as: 'user' },
          { model: ChargingPile, as: 'pile' },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (!this.canTransitionStatus(order.status, OrderStatus.CHARGING)) {
        throw new BadRequestException('当前订单状态不支持继续充电');
      }

      await order.update({ status: OrderStatus.CHARGING }, { transaction: t });

      await OperationLog.create(
        {
          userId: operatorId || order.userId,
          username: order.user?.username,
          role: order.user?.role,
          method: 'POST',
          path: `/api/charging-orders/${orderId}/resume`,
          params: JSON.stringify({ id: orderId }),
          body: JSON.stringify({}),
          statusCode: 200,
          operationType: OperationType.RESUME_CHARGING,
          description: `继续充电: 订单号 ${order.orderNo}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`订单 ${order.orderNo} 继续充电`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async markAbnormal(orderId: number, reason: string, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await ChargingOrder.findByPk(orderId, {
        include: [
          { model: User, as: 'user' },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (!this.canTransitionStatus(order.status, OrderStatus.ABNORMAL)) {
        throw new BadRequestException('当前订单状态不支持标记异常');
      }

      await order.update(
        {
          status: OrderStatus.ABNORMAL,
          abnormalReason: reason,
          endTime: new Date(),
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/charging-orders/${orderId}/abnormal`,
          params: JSON.stringify({ id: orderId }),
          body: JSON.stringify({ reason }),
          statusCode: 200,
          operationType: OperationType.REPORT_FAULT,
          description: `标记订单异常: 订单号 ${order.orderNo}, 原因: ${reason}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.warn(`订单 ${order.orderNo} 标记异常: ${reason}`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async handleAbnormalOrder(orderId: number, data: {
    energy: number;
    endSoc?: number;
    operatorId?: number;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await ChargingOrder.findByPk(orderId, {
        include: [
          {
            model: ChargingPile,
            as: 'pile',
            include: [
              {
                model: ChargingSite,
                as: 'site',
                include: [
                  {
                    model: FeeTemplate,
                    as: 'feeTemplate',
                  },
                ],
              },
            ],
          },
          {
            model: User,
            as: 'user',
          },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.status !== OrderStatus.ABNORMAL) {
        throw new BadRequestException('只有异常订单可以处理');
      }

      const feeTemplate = order.pile?.site?.feeTemplate;

      if (!feeTemplate) {
        throw new BadRequestException('站点未配置收费模板');
      }

      const startTime = order.startTime || order.createdAt;
      const endTime = new Date();

      const priceInfo = this.calculateChargingPrice(
        startTime,
        endTime,
        data.energy,
        feeTemplate,
        order.pile?.customElectricityPrice,
        order.pile?.customServiceFee
      );

      const discountAmount = Number((priceInfo.totalAmount * 0.8).toFixed(2));

      if (Number(order.user?.balance) < discountAmount) {
        throw new BadRequestException('账户余额不足');
      }

      await order.user?.decrement('balance', {
        by: discountAmount,
        transaction: t,
      });

      await order.pile?.increment('totalEnergy', {
        by: data.energy,
        transaction: t,
      });

      await order.update(
        {
          status: OrderStatus.COMPLETED,
          endTime,
          duration: priceInfo.duration,
          endSoc: data.endSoc || 0,
          energy: data.energy,
          electricityPrice: priceInfo.electricityPrice,
          serviceFee: priceInfo.serviceFee,
          electricityAmount: priceInfo.electricityAmount,
          serviceAmount: priceInfo.serviceAmount,
          totalAmount: discountAmount,
          platformShareAmount: Number((priceInfo.platformShareAmount * 0.8).toFixed(2)),
          maintenanceShareAmount: Number((priceInfo.maintenanceShareAmount * 0.8).toFixed(2)),
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: data.operatorId,
          method: 'POST',
          path: `/api/charging-orders/${orderId}/handle-abnormal`,
          params: JSON.stringify({ id: orderId }),
          body: JSON.stringify(data),
          statusCode: 200,
          operationType: OperationType.HANDLE_ABNORMAL,
          description: `处理异常订单: 订单号 ${order.orderNo}, 金额 ${discountAmount}元(8折)`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`异常订单 ${order.orderNo} 处理完成`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancelOrder(orderId: number, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await ChargingOrder.findByPk(orderId, {
        include: [
          { model: User, as: 'user' },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (!this.canTransitionStatus(order.status, OrderStatus.CANCELLED)) {
        throw new BadRequestException('当前订单状态无法取消');
      }

      await order.update({ status: OrderStatus.CANCELLED }, { transaction: t });

      await OperationLog.create(
        {
          userId: operatorId || order.userId,
          username: order.user?.username,
          role: order.user?.role,
          method: 'POST',
          path: `/api/charging-orders/${orderId}/cancel`,
          params: JSON.stringify({ id: orderId }),
          body: JSON.stringify({}),
          statusCode: 200,
          operationType: OperationType.CANCEL_ORDER,
          description: `取消订单: 订单号 ${order.orderNo}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`订单 ${order.orderNo} 已取消`);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number, userId?: number) {
    const order = await ChargingOrder.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'phone', 'realName'],
        },
        {
          model: ChargingPile,
          as: 'pile',
          attributes: ['id', 'pileCode', 'powerType', 'status'],
        },
        {
          model: ChargingSite,
          as: 'site',
          attributes: ['id', 'siteCode', 'name', 'address'],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('无权访问此订单');
    }

    return order;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
    siteId?: number;
    pileId?: number;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 10,
      userId,
      siteId,
      pileId,
      status,
      startDate,
      endDate,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (siteId) {
      where.siteId = siteId;
    }

    if (pileId) {
      where.pileId = pileId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate + ' 23:59:59'),
      };
    }

    if (keyword) {
      where[Op.or] = [{ orderNo: { [Op.like]: `%${keyword}%` } }];
    }

    const order: [string, string][] = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await ChargingOrder.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'phone', 'realName'],
        },
        {
          model: ChargingPile,
          as: 'pile',
          attributes: ['id', 'pileCode', 'powerType'],
        },
        {
          model: ChargingSite,
          as: 'site',
          attributes: ['id', 'siteCode', 'name'],
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
  }) {
    const { siteId, startDate, endDate } = params;

    const where: any = {
      status: OrderStatus.COMPLETED,
    };

    if (siteId) {
      where.siteId = siteId;
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate + ' 23:59:59'),
      };
    }

    const stats = await ChargingOrder.findOne({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalOrders'],
        [fn('SUM', col('energy')), 'totalEnergy'],
        [fn('SUM', col('duration')), 'totalDuration'],
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('electricityAmount')), 'totalElectricityAmount'],
        [fn('SUM', col('serviceAmount')), 'totalServiceAmount'],
        [fn('SUM', col('platformShareAmount')), 'totalPlatformShare'],
        [fn('SUM', col('maintenanceShareAmount')), 'totalMaintenanceShare'],
      ],
      raw: true,
    });

    return {
      totalOrders: Number((stats as any).totalOrders) || 0,
      totalEnergy: Number((stats as any).totalEnergy) || 0,
      totalDuration: Number((stats as any).totalDuration) || 0,
      totalAmount: Number((stats as any).totalAmount) || 0,
      totalElectricityAmount: Number((stats as any).totalElectricityAmount) || 0,
      totalServiceAmount: Number((stats as any).totalServiceAmount) || 0,
      totalPlatformShare: Number((stats as any).totalPlatformShare) || 0,
      totalMaintenanceShare: Number((stats as any).totalMaintenanceShare) || 0,
    };
  }

  async getOrderTrend(params: {
    days?: number;
    siteId?: number;
  }) {
    const { days = 7, siteId } = params;
    const results: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const startOfDay = new Date(date + ' 00:00:00');
      const endOfDay = new Date(date + ' 23:59:59');

      const where: any = {
        status: OrderStatus.COMPLETED,
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
      };

      if (siteId) {
        where.siteId = siteId;
      }

      const stats = await ChargingOrder.findOne({
        where,
        attributes: [
          [fn('COUNT', col('id')), 'orderCount'],
          [fn('SUM', col('energy')), 'totalEnergy'],
          [fn('SUM', col('totalAmount')), 'totalAmount'],
        ],
        raw: true,
      });

      results.push({
        date,
        orderCount: Number((stats as any).orderCount) || 0,
        totalEnergy: Number((stats as any).totalEnergy) || 0,
        totalAmount: Number((stats as any).totalAmount) || 0,
      });
    }

    return results;
  }

  async processTimeoutOrders(timeoutMinutes: number = 1440) {
    const t: Transaction = await sequelize.transaction();

    try {
      const cutoffTime = moment().subtract(timeoutMinutes, 'minutes').toDate();

      const timeoutOrders = await ChargingOrder.findAll({
        where: {
          status: { [Op.in]: [OrderStatus.CHARGING, OrderStatus.PENDING] },
          createdAt: { [Op.lte]: cutoffTime },
        },
        include: [{ model: User, as: 'user' }],
        transaction: t,
      });

      for (const order of timeoutOrders) {
        await order.update(
          {
            status: OrderStatus.ABNORMAL,
            abnormalReason: '充电超时自动处理',
            endTime: new Date(),
          },
          { transaction: t }
        );

        logger.warn(`订单 ${order.orderNo} 因充电超时标记为异常`);
      }

      await t.commit();

      return {
        success: true,
        processedCount: timeoutOrders.length,
      };
    } catch (error) {
      await t.rollback();
      logger.error('处理超时订单失败:', error);
      throw error;
    }
  }
}

export default new ChargingOrderService();

import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { Order, OrderTrack, Rider, Category, User } from '../models';
import { BusinessError, ErrorCode } from '../utils/businessError';
import { OrderStatus, OrderType, RiderStatus } from '../types';
import moment from 'moment';
import logger from '../config/logger';

export class OrderService {
  static generateOrderNo() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `OD${timestamp}${random}`;
  }

  static validateStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
      [OrderStatus.ASSIGNED]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: []
    };

    const isValid = validTransitions[currentStatus]?.includes(nextStatus) || false;
    
    if (!isValid) {
      logger.warn(`订单状态转换非法: ${currentStatus} -> ${nextStatus}`);
    }
    
    return isValid;
  }

  static async transitionOrderStatus(
    order: Order,
    nextStatus: OrderStatus,
    operatorId: number,
    remark?: string,
    transaction?: Transaction
  ) {
    if (!this.validateStatusTransition(order.status, nextStatus)) {
      throw new BusinessError(`订单状态不允许从${order.status}转换为${nextStatus}`, ErrorCode.ORDER_STATUS_ERROR);
    }

    const updateData: any = { status: nextStatus };
    const now = new Date();

    switch (nextStatus) {
      case OrderStatus.ACCEPTED:
        updateData.acceptedAt = now;
        break;
      case OrderStatus.PICKED_UP:
        updateData.pickedUpAt = now;
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = now;
        break;
      case OrderStatus.COMPLETED:
        updateData.completedAt = now;
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = now;
        if (remark) updateData.cancelReason = remark;
        break;
    }

    const exec = async (t: Transaction) => {
      await order.update(updateData, { transaction: t });

      await OrderTrack.create(
        {
          orderId: order.id,
          status: nextStatus,
          remark: remark || `状态变更为: ${nextStatus}`,
          operatorId
        },
        { transaction: t }
      );

      logger.info(`订单状态变更: ${order.orderNo} ${order.status} -> ${nextStatus}, 操作人: ${operatorId}`);
    };

    if (transaction) {
      await exec(transaction);
    } else {
      await sequelize.transaction(exec);
    }
  }

  static async createOrder(
    userId: number,
    type: OrderType,
    categoryId: number,
    title: string,
    pickupAddress: string,
    pickupContact: string,
    pickupPhone: string,
    deliveryAddress: string,
    deliveryContact: string,
    deliveryPhone: string,
    distance: number,
    description?: string,
    pickupLat?: number,
    pickupLng?: number,
    deliveryLat?: number,
    deliveryLng?: number,
    weight?: number,
    goodsValue?: number,
    remark?: string
  ) {
    const category = await Category.findByPk(categoryId);
    if (!category || category.status !== 1) {
      throw BusinessError.notFound('服务品类不存在或已下架');
    }

    const { CategoryService } = await import('./categoryService');
    const priceInfo = await CategoryService.calculatePrice(categoryId, distance, weight);
    const orderNo = this.generateOrderNo();

    const order = await sequelize.transaction(async (t) => {
      const newOrder = await Order.create(
        {
          orderNo,
          userId,
          type,
          categoryId,
          title,
          description,
          pickupAddress,
          pickupLat,
          pickupLng,
          pickupContact,
          pickupPhone,
          deliveryAddress,
          deliveryLat,
          deliveryLng,
          deliveryContact,
          deliveryPhone,
          distance,
          weight,
          goodsValue,
          baseAmount: priceInfo.baseAmount,
          premiumAmount: priceInfo.premiumAmount,
          totalAmount: priceInfo.totalAmount,
          riderCommission: priceInfo.riderCommission,
          platformFee: priceInfo.platformFee,
          status: OrderStatus.PENDING,
          remark
        },
        { transaction: t }
      );

      await OrderTrack.create(
        {
          orderId: newOrder.id,
          status: OrderStatus.PENDING,
          location: pickupAddress,
          lat: pickupLat,
          lng: pickupLng,
          remark: '订单创建成功',
          operatorId: userId
        },
        { transaction: t }
      );

      logger.info(`订单创建成功: ${orderNo}, 用户: ${userId}, 金额: ${priceInfo.totalAmount}`);

      return newOrder;
    });

    return order;
  }

  static async assignOrder(orderId: number, riderId?: number, operatorId?: number) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    if (!this.validateStatusTransition(order.status, OrderStatus.ASSIGNED)) {
      throw new BusinessError('订单状态不允许派单', ErrorCode.ORDER_STATUS_ERROR);
    }

    let selectedRider: Rider | null = null;

    if (riderId) {
      selectedRider = await Rider.findByPk(riderId);
      if (!selectedRider || selectedRider.status !== RiderStatus.ONLINE || !selectedRider.canReceiveOrder) {
        throw new BusinessError('指定骑手不可用');
      }
    } else {
      const availableRiders = await Rider.findAll({
        where: {
          status: RiderStatus.ONLINE,
          canReceiveOrder: true
        },
        order: [['rating', 'DESC'], ['totalOrders', 'ASC']],
        limit: 10
      });

      if (availableRiders.length === 0) {
        throw new BusinessError('暂无可用骑手');
      }

      selectedRider = availableRiders[0];
    }

    await sequelize.transaction(async (t) => {
      await order.update(
        { riderId: selectedRider!.id, status: OrderStatus.ASSIGNED },
        { transaction: t }
      );

      await OrderTrack.create(
        {
          orderId: order.id,
          status: OrderStatus.ASSIGNED,
          remark: `订单已派发给骑手${selectedRider!.realName}`,
          operatorId: operatorId || selectedRider!.id
        },
        { transaction: t }
      );

      logger.info(`订单派单成功: ${order.orderNo} -> 骑手${selectedRider!.realName}`);
    });

    return { order, rider: selectedRider };
  }

  static async acceptOrder(riderId: number, orderId: number) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    if (order.riderId !== riderId) {
      throw new BusinessError('您不是该订单的骑手', ErrorCode.ORDER_RIDER_MISMATCH);
    }

    await sequelize.transaction(async (t) => {
      await this.transitionOrderStatus(order, OrderStatus.ACCEPTED, riderId, '骑手已接单', t);
    });

    return order;
  }

  static async pickupOrder(riderId: number, orderId: number, lat?: number, lng?: number) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    if (order.riderId !== riderId) {
      throw new BusinessError('您不是该订单的骑手', ErrorCode.ORDER_RIDER_MISMATCH);
    }

    await sequelize.transaction(async (t) => {
      await this.transitionOrderStatus(order, OrderStatus.PICKED_UP, riderId, '骑手已取件', t);

      if (lat || lng) {
        await OrderTrack.create(
          {
            orderId: order.id,
            status: OrderStatus.PICKED_UP,
            location: order.pickupAddress,
            lat,
            lng,
            remark: '取件位置记录',
            operatorId: riderId
          },
          { transaction: t }
        );
      }
    });

    return order;
  }

  static async deliverOrder(riderId: number, orderId: number, lat?: number, lng?: number) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    if (order.riderId !== riderId) {
      throw new BusinessError('您不是该订单的骑手', ErrorCode.ORDER_RIDER_MISMATCH);
    }

    await sequelize.transaction(async (t) => {
      await this.transitionOrderStatus(order, OrderStatus.DELIVERED, riderId, '骑手已送达', t);

      if (lat || lng) {
        await OrderTrack.create(
          {
            orderId: order.id,
            status: OrderStatus.DELIVERED,
            location: order.deliveryAddress,
            lat,
            lng,
            remark: '送达位置记录',
            operatorId: riderId
          },
          { transaction: t }
        );
      }
    });

    return order;
  }

  static async completeOrder(userId: number, orderId: number) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    if (order.userId !== userId) {
      throw new BusinessError('您不是该订单的用户', 403);
    }

    await sequelize.transaction(async (t) => {
      await this.transitionOrderStatus(order, OrderStatus.COMPLETED, userId, '订单已完成', t);

      if (order.riderId) {
        await Rider.increment(
          { totalOrders: 1, balance: order.riderCommission },
          { where: { id: order.riderId }, transaction: t }
        );

        logger.info(`骑手余额更新: ${order.riderId}, 增加佣金: ${order.riderCommission}`);
      }
    });

    return order;
  }

  static async cancelOrder(userId: number, orderId: number, reason: string) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    if (order.userId !== userId) {
      throw new BusinessError('您不是该订单的用户', 403);
    }

    await sequelize.transaction(async (t) => {
      await this.transitionOrderStatus(order, OrderStatus.CANCELLED, userId, reason, t);
    });

    return order;
  }

  static async getOrderList(
    userId?: number,
    riderId?: number,
    status?: OrderStatus,
    page: number = 1,
    pageSize: number = 10,
    keyword?: string
  ) {
    const offset = (page - 1) * pageSize;
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }
    if (riderId) {
      where.riderId = riderId;
    }
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { pickupAddress: { [Op.like]: `%${keyword}%` } },
        { deliveryAddress: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['username', 'phone', 'avatar'] },
        { model: Rider, as: 'rider', attributes: ['realName', 'phone'] },
        { model: Category, as: 'category', attributes: ['name', 'type'] }
      ]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getOrderDetail(orderId: number) {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'user', attributes: ['username', 'phone', 'avatar'] },
        { model: Rider, as: 'rider', attributes: ['realName', 'phone'] },
        { model: Category, as: 'category', attributes: ['name', 'type'] },
        { model: OrderTrack, as: 'tracks', order: [['createdAt', 'ASC']] }
      ]
    });

    if (!order) {
      throw BusinessError.notFound('订单不存在');
    }

    return order;
  }

  static async getAvailableOrders(page: number = 1, pageSize: number = 10, deliveryArea?: string) {
    const offset = (page - 1) * pageSize;

    const where: any = {
      status: OrderStatus.PENDING
    };

    if (deliveryArea) {
      where[Op.or] = [
        { pickupAddress: { [Op.like]: `%${deliveryArea}%` } },
        { deliveryAddress: { [Op.like]: `%${deliveryArea}%` } }
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'user', attributes: ['username', 'phone'] },
        { model: Category, as: 'category', attributes: ['name', 'type'] }
      ]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async batchAssignOrders() {
    const pendingOrders = await Order.findAll({
      where: { status: OrderStatus.PENDING },
      order: [['createdAt', 'ASC']],
      limit: 50
    });

    const results = [];
    for (const order of pendingOrders) {
      try {
        const result = await this.assignOrder(order.id);
        results.push(result);
      } catch (error) {
        logger.warn(`批量派单失败: 订单${order.id}, 错误: ${(error as Error).message}`);
        continue;
      }
    }

    logger.info(`批量派单完成: 成功${results.length}/${pendingOrders.length}`);

    return results;
  }

  static async getOrderStatistics(riderId: number, startDate?: Date, endDate?: Date) {
    const where: any = { riderId };
    
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const orders = await Order.findAll({ where });

    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0),
      totalCommission: orders.reduce((sum, o) => sum + parseFloat(o.riderCommission.toString()), 0),
      completionRate: orders.length > 0 ? completedOrders.length / orders.length : 0
    };
  }

  static async autoCompleteDeliveredOrders() {
    const twoHoursAgo = moment().subtract(2, 'hours').toDate();
    
    const orders = await Order.findAll({
      where: {
        status: OrderStatus.DELIVERED,
        deliveredAt: { [Op.lte]: twoHoursAgo }
      },
      include: [{ model: User, as: 'user' }]
    });

    const results = [];
    for (const order of orders) {
      try {
        await this.completeOrder(order.userId, order.id);
        results.push(order.id);
      } catch (error) {
        logger.error(`自动确认收货失败: 订单${order.id}, 错误: ${(error as Error).message}`);
      }
    }

    if (results.length > 0) {
      logger.info(`自动确认收货完成: ${results.length}单`);
    }

    return results;
  }
}

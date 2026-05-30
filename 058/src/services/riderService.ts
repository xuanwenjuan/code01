import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';
import { Rider, User, RiderAuditLog, Order } from '../models';
import { BusinessError, ErrorCode } from '../utils/businessError';
import { RiderStatus, UserRole, OrderStatus } from '../types';
import logger from '../config/logger';

export class RiderService {
  static async applyRider(
    userId: number,
    realName: string,
    idCard: string,
    phone: string,
    vehicleType: string,
    idCardFront?: string,
    idCardBack?: string,
    vehicleNumber?: string,
    deliveryArea?: string
  ) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw BusinessError.notFound('用户不存在');
    }

    const existingRider = await Rider.findOne({ where: { userId } });
    if (existingRider) {
      throw new BusinessError('骑手申请已存在');
    }

    const existingIdCard = await Rider.findOne({ where: { idCard } });
    if (existingIdCard) {
      throw new BusinessError('该身份证已被使用');
    }

    if (!idCardFront || !idCardBack) {
      throw new BusinessError('请上传身份证正反面照片');
    }

    const rider = await sequelize.transaction(async (t) => {
      const newRider = await Rider.create(
        {
          userId,
          realName,
          idCard,
          phone,
          vehicleType,
          idCardFront,
          idCardBack,
          vehicleNumber,
          deliveryArea,
          status: RiderStatus.PENDING,
          canReceiveOrder: false,
          totalOrders: 0,
          rating: 5,
          balance: 0
        },
        { transaction: t }
      );

      await User.update({ role: UserRole.RIDER }, { where: { id: userId }, transaction: t });

      await RiderAuditLog.create(
        {
          riderId: newRider.id,
          status: RiderStatus.PENDING,
          remark: '骑手提交入驻申请'
        },
        { transaction: t }
      );

      logger.info(`骑手申请提交: 用户${userId} - ${realName}`);

      return newRider;
    });

    return rider;
  }

  static async auditRider(
    riderId: number,
    auditorId: number,
    status: RiderStatus.APPROVED | RiderStatus.REJECTED,
    remark?: string
  ) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    if (rider.status !== RiderStatus.PENDING) {
      throw new BusinessError('该骑手状态不允许审核', ErrorCode.RIDER_STATUS_ERROR);
    }

    if (status === RiderStatus.APPROVED && !rider.deliveryArea) {
      throw new BusinessError('骑手未设置配送范围，无法通过审核', ErrorCode.RIDER_DELIVERY_AREA_REQUIRED);
    }

    const result = await sequelize.transaction(async (t) => {
      const oldStatus = rider.status;
      
      rider.status = status;
      rider.canReceiveOrder = status === RiderStatus.APPROVED;
      await rider.save({ transaction: t });

      await RiderAuditLog.create(
        {
          riderId: rider.id,
          auditorId,
          status,
          oldStatus,
          remark: remark || (status === RiderStatus.APPROVED ? '审核通过' : '审核拒绝')
        },
        { transaction: t }
      );

      logger.info(`骑手审核: ${rider.realName} - ${status}, 审核人: ${auditorId}`);

      return rider;
    });

    return result;
  }

  static async updateRiderStatus(riderId: number, status: RiderStatus, operatorId?: number) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    if (!rider.deliveryArea && (status === RiderStatus.ONLINE || status === RiderStatus.APPROVED)) {
      throw new BusinessError('请先设置配送范围', ErrorCode.RIDER_DELIVERY_AREA_REQUIRED);
    }

    if (status === RiderStatus.ONLINE) {
      if (rider.status === RiderStatus.REJECTED || rider.status === RiderStatus.PENDING) {
        throw new BusinessError('骑手未通过审核，无法上线', ErrorCode.RIDER_STATUS_ERROR);
      }
      if (!rider.deliveryArea) {
        throw new BusinessError('骑手未设置配送范围，无法上线', ErrorCode.RIDER_DELIVERY_AREA_REQUIRED);
      }
      rider.canReceiveOrder = true;
    } else if (status === RiderStatus.OFFLINE) {
      rider.canReceiveOrder = false;
    } else if (status === RiderStatus.BANNED) {
      rider.canReceiveOrder = false;
      
      await Order.update(
        { status: OrderStatus.CANCELLED, cancelReason: '骑手账号被封禁，订单自动取消' },
        { where: { riderId, status: { [Op.in]: [OrderStatus.ASSIGNED, OrderStatus.ACCEPTED, OrderStatus.PICKED_UP] } } }
      );
    }

    const oldStatus = rider.status;
    rider.status = status;
    
    await sequelize.transaction(async (t) => {
      await rider.save({ transaction: t });
      
      await RiderAuditLog.create(
        {
          riderId: rider.id,
          auditorId: operatorId,
          status,
          oldStatus,
          remark: `状态变更为${status}`
        },
        { transaction: t }
      );

      logger.info(`骑手状态变更: ${rider.realName} - ${oldStatus} -> ${status}, 操作人: ${operatorId}`);
    });

    return rider;
  }

  static async updateDeliveryArea(riderId: number, deliveryArea: string) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    rider.deliveryArea = deliveryArea;
    await rider.save();
    
    logger.info(`骑手配送范围更新: ${rider.realName} - ${deliveryArea}`);
    
    return rider;
  }

  static async getRiderList(page: number = 1, pageSize: number = 10, status?: RiderStatus, keyword?: string) {
    const offset = (page - 1) * pageSize;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const riderCondition: any = {};
    if (keyword) {
      riderCondition[Op.or] = [
        { realName: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Rider.findAndCountAll({
      where: { ...where, ...riderCondition },
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username', 'phone', 'avatar'] }]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getRiderById(riderId: number) {
    const rider = await Rider.findByPk(riderId, {
      include: [
        { model: User, as: 'user', attributes: ['username', 'phone', 'avatar'] },
        { model: RiderAuditLog, as: 'auditLogs', limit: 20, order: [['createdAt', 'DESC']] }
      ]
    });
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }
    return rider;
  }

  static async getRiderByUserId(userId: number) {
    const rider = await Rider.findOne({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['username', 'phone', 'avatar'] },
        { model: RiderAuditLog, as: 'auditLogs', limit: 20, order: [['createdAt', 'DESC']] }
      ]
    });
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }
    return rider;
  }

  static async updateRiderInfo(
    riderId: number,
    data: {
      phone?: string;
      vehicleType?: string;
      vehicleNumber?: string;
      deliveryArea?: string;
    }
  ) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    await rider.update(data);
    
    logger.info(`骑手信息更新: ${rider.realName}`);
    
    return rider;
  }

  static async updateReceiveOrderPermission(riderId: number, canReceiveOrder: boolean, operatorId?: number) {
    const rider = await Rider.findByPk(riderId);
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }

    if (canReceiveOrder && !rider.deliveryArea) {
      throw new BusinessError('骑手未设置配送范围，无法开启接单权限', ErrorCode.RIDER_DELIVERY_AREA_REQUIRED);
    }

    rider.canReceiveOrder = canReceiveOrder;
    await rider.save();
    
    await RiderAuditLog.create({
      riderId,
      auditorId: operatorId,
      status: rider.status,
      oldStatus: rider.status,
      remark: `接单权限${canReceiveOrder ? '开启' : '关闭'}`
    });

    logger.info(`骑手接单权限变更: ${rider.realName} - ${canReceiveOrder ? '开启' : '关闭'}, 操作人: ${operatorId}`);

    return rider;
  }

  static async getRiderBalance(riderId: number) {
    const rider = await Rider.findByPk(riderId, {
      attributes: ['id', 'realName', 'balance']
    });
    if (!rider) {
      throw BusinessError.notFound('骑手不存在');
    }
    return rider;
  }

  static async getAvailableRiders(deliveryArea?: string) {
    const where: any = {
      status: RiderStatus.ONLINE,
      canReceiveOrder: true
    };

    if (deliveryArea) {
      where.deliveryArea = { [Op.like]: `%${deliveryArea}%` };
    }

    const riders = await Rider.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['username', 'phone', 'avatar'] }],
      order: [['rating', 'DESC'], ['totalOrders', 'ASC']]
    });

    return riders;
  }
}

import { Request, Response, NextFunction } from 'express';
import sequelize from '../config/database';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import Equipment from '../models/equipment.model';
import User from '../models/user.model';
import { ResponseUtil } from '../utils/response.util';
import { DamageCalculator } from '../utils/damage-calculator.util';
import { NotFoundException, BadRequestException } from '../common/http-exception';
import { OrderStatus, PaymentStatus, EquipmentStatus } from '../common/enums';
import { EquipmentScheduleService } from '../services/equipment-schedule.service';
import { OperationLogService } from '../services/operation-log.service';
import { Op, fn, col } from 'sequelize';
import moment from 'moment';

const generateOrderNo = (): string => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      customerName,
      customerPhone,
      createdBy,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (customerName) {
      where.customerName = { [Op.like]: `%${customerName}%` };
    }
    if (customerPhone) {
      where.customerPhone = { [Op.like]: `%${customerPhone}%` };
    }
    if (createdBy) {
      where.createdBy = createdBy;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    res.json(ResponseUtil.page(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'confirmer', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'outbounder', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'returner', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'completer', attributes: ['id', 'username', 'realName'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Equipment, as: 'equipment', attributes: ['id', 'name', 'assetNo', 'brand', 'model'] }],
        },
      ],
    });

    if (!order) {
      return next(new NotFoundException('订单不存在'));
    }

    res.json(ResponseUtil.success(order));
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      eventName,
      eventLocation,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail,
      depositAmount,
      items,
      remarks,
    } = req.body;

    if (!items || items.length === 0) {
      await transaction.rollback();
      return next(new BadRequestException('租赁设备不能为空'));
    }

    const equipmentIds = items.map((item: any) => item.equipmentId);
    const scheduleCheck = await EquipmentScheduleService.checkScheduleConflict({
      equipmentIds,
      startTime,
      endTime,
    });

    if (scheduleCheck.hasConflict) {
      await transaction.rollback();
      return next(new BadRequestException('存在档期冲突，请检查设备后重试'));
    }

    const orderNo = generateOrderNo();
    let totalAmount = 0;

    for (const item of items) {
      const equipment = await Equipment.findByPk(item.equipmentId, { transaction });
      if (!equipment) {
        await transaction.rollback();
        return next(new BadRequestException(`设备ID ${item.equipmentId} 不存在`));
      }
      if (equipment.status !== EquipmentStatus.IN_STOCK) {
        await transaction.rollback();
        return next(new BadRequestException(`设备 ${equipment.name} 不在库中`));
      }
      item.unitPrice = item.unitPrice || equipment.currentValue;
      item.subtotal = item.quantity * item.unitPrice;
      totalAmount += item.subtotal;
    }

    const order = await Order.create(
      {
        orderNo,
        eventName,
        eventLocation,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        depositAmount: depositAmount || 0,
        paidAmount: 0,
        paymentStatus: PaymentStatus.UNPAID,
        status: OrderStatus.PENDING_DEPOSIT,
        remarks,
        createdBy: req.user!.userId,
      },
      { transaction }
    );

    const orderItems = items.map((item: any) => ({
      orderId: order.id,
      equipmentId: item.equipmentId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      returnedQuantity: 0,
      damagedQuantity: 0,
      damageAmount: 0,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'create',
        recordId: order.id,
        afterData: order.toJSON(),
        changes: ['创建订单'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.created(order, '订单创建成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { paidAmount, paymentMethod, remarks } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status !== OrderStatus.PENDING_DEPOSIT) {
      await transaction.rollback();
      return next(new BadRequestException('订单状态不正确'));
    }

    const beforeData = order.toJSON();
    const newPaidAmount = (order.paidAmount as number) + (paidAmount || 0);
    let paymentStatus = order.paymentStatus;

    if (newPaidAmount >= order.totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (newPaidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    await order.update(
      {
        paidAmount: newPaidAmount,
        paymentStatus,
        status: OrderStatus.CONFIRMED,
        confirmedBy: req.user!.userId,
        confirmedAt: new Date(),
        remarks: remarks ? `${order.remarks || ''}\n${remarks}` : order.remarks,
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'confirm',
        recordId: order.id,
        beforeData,
        afterData: order.toJSON(),
        changes: ['确认订单', `支付金额: ${paidAmount || 0}`],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '订单确认成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const outboundOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      await transaction.rollback();
      return next(new BadRequestException('订单状态不正确'));
    }

    const beforeData = order.toJSON();

    for (const item of order.items!) {
      await Equipment.update(
        { status: EquipmentStatus.RENTED },
        { where: { id: item.equipmentId }, transaction }
      );
    }

    await order.update(
      {
        status: OrderStatus.OUTBOUND,
        outboundBy: req.user!.userId,
        outboundAt: new Date(),
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'outbound',
        recordId: order.id,
        beforeData,
        afterData: order.toJSON(),
        changes: ['设备出库'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '设备出库成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const returnOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { returnItems, remarks } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status !== OrderStatus.OUTBOUND && order.status !== OrderStatus.IN_USE) {
      await transaction.rollback();
      return next(new BadRequestException('订单状态不正确'));
    }

    const beforeData = order.toJSON();
    let totalDamageAmount = 0;

    for (const returnItem of returnItems) {
      const orderItem = order.items!.find((item) => item.id === returnItem.orderItemId);
      if (!orderItem) {
        await transaction.rollback();
        return next(new BadRequestException(`订单项 ${returnItem.orderItemId} 不存在`));
      }

      let damageAmount = 0;
      if (returnItem.damagedQuantity > 0 && returnItem.damageLevel) {
        const damageResult = DamageCalculator.calculateCompensation(
          orderItem.unitPrice as number,
          returnItem.damagedQuantity,
          returnItem.damageLevel
        );
        damageAmount = damageResult.amount;
        totalDamageAmount += damageAmount;
      }

      await orderItem.update(
        {
          returnedQuantity: returnItem.returnedQuantity,
          damagedQuantity: returnItem.damagedQuantity,
          damageAmount,
          damageLevel: returnItem.damageLevel,
          damageDescription: returnItem.damageDescription,
        },
        { transaction }
      );

      if (returnItem.returnedQuantity > 0) {
        await Equipment.update(
          { status: EquipmentStatus.IN_STOCK },
          { where: { id: orderItem.equipmentId }, transaction }
        );
      }
    }

    await order.update(
      {
        status: OrderStatus.RETURNED,
        returnedBy: req.user!.userId,
        returnedAt: new Date(),
        damageAmount: totalDamageAmount,
        remarks: remarks ? `${order.remarks || ''}\n${remarks}` : order.remarks,
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'return',
        recordId: order.id,
        beforeData,
        afterData: order.toJSON(),
        changes: ['设备归还', `破损赔付: ${totalDamageAmount}`],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '设备归还成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const completeOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status !== OrderStatus.RETURNED) {
      await transaction.rollback();
      return next(new BadRequestException('订单状态不正确'));
    }

    const beforeData = order.toJSON();

    await order.update(
      {
        status: OrderStatus.COMPLETED,
        completedBy: req.user!.userId,
        completedAt: new Date(),
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'complete',
        recordId: order.id,
        beforeData,
        afterData: order.toJSON(),
        changes: ['订单完成'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '订单完成'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.CLOSED) {
      await transaction.rollback();
      return next(new BadRequestException('订单状态不正确'));
    }

    const beforeData = order.toJSON();

    if (order.status === OrderStatus.OUTBOUND || order.status === OrderStatus.IN_USE) {
      for (const item of order.items!) {
        await Equipment.update(
          { status: EquipmentStatus.IN_STOCK },
          { where: { id: item.equipmentId }, transaction }
        );
      }
    }

    await order.update(
      {
        status: OrderStatus.CANCELLED,
        cancelledBy: req.user!.userId,
        cancelledAt: new Date(),
        cancelReason,
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'cancel',
        recordId: order.id,
        beforeData,
        afterData: order.toJSON(),
        changes: ['取消订单', `原因: ${cancelReason}`],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '订单取消成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { amount, paymentMethod, remarks } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED || order.status === OrderStatus.CLOSED) {
      await transaction.rollback();
      return next(new BadRequestException('订单状态不正确'));
    }

    const beforeData = order.toJSON();
    const newPaidAmount = (order.paidAmount as number) + amount;
    let paymentStatus = order.paymentStatus;

    if (newPaidAmount >= order.totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (newPaidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    await order.update(
      {
        paidAmount: newPaidAmount,
        paymentStatus,
        remarks: remarks ? `${order.remarks || ''}\n支付记录: ${amount}, 方式: ${paymentMethod || '未指定'}` : order.remarks,
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'payment',
        recordId: order.id,
        beforeData,
        afterData: order.toJSON(),
        changes: ['记录付款', `金额: ${amount}`],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '付款记录成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateOrderItem = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id, itemId } = req.params;
    const { quantity, unitPrice, remarks } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundException('订单不存在'));
    }

    if (order.status !== OrderStatus.PENDING_DEPOSIT && order.status !== OrderStatus.CONFIRMED) {
      await transaction.rollback();
      return next(new BadRequestException('订单已出库，无法修改明细'));
    }

    const orderItem = order.items!.find((item) => item.id === Number(itemId));
    if (!orderItem) {
      await transaction.rollback();
      return next(new NotFoundException('订单项不存在'));
    }

    const beforeData = { order: order.toJSON(), orderItem: orderItem.toJSON() };

    const subtotal = quantity * (unitPrice || orderItem.unitPrice);

    await orderItem.update(
      {
        quantity,
        unitPrice: unitPrice || orderItem.unitPrice,
        subtotal,
        remarks,
      },
      { transaction }
    );

    const totalAmount = order.items!.reduce((sum, item) => sum + (item.id === Number(itemId) ? subtotal : item.subtotal), 0);
    await order.update({ totalAmount }, { transaction });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'order',
        operation: 'update',
        recordId: order.id,
        beforeData,
        afterData: { order: order.toJSON(), orderItem: orderItem.toJSON() },
        changes: ['更新订单项'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(order, '订单项更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const statusCounts = await Order.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    const totalRevenue = await Order.sum('totalAmount', {
      where: { ...where, status: OrderStatus.COMPLETED },
    });

    const paidAmount = await Order.sum('paidAmount', {
      where,
    });

    const totalOrders = await Order.count({ where });
    const completedOrders = await Order.count({ where: { ...where, status: OrderStatus.COMPLETED } });

    const stats = {
      totalOrders,
      completedOrders,
      completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0,
      byStatus: statusCounts,
      totalRevenue: totalRevenue || 0,
      paidAmount: paidAmount || 0,
      unpaidAmount: (totalRevenue || 0) - (paidAmount || 0),
    };

    res.json(ResponseUtil.success(stats));
  } catch (error) {
    next(error);
  }
};

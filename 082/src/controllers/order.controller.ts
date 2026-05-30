import { Request, Response } from 'express';
import { Order, OrderStatusLog, Room, RoomCategory } from '../models';
import { ResponseUtil } from '../utils/response';
import { OrderStatus, SeasonType, RoomStatus } from '../constants';
import { PaginationResult, OrderEntity, CheckOutParams, ExtraChargeItem } from '../types';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

const determineSeasonType = (date: Date): SeasonType => {
  const month = date.getMonth() + 1;
  if ([1, 2, 7, 8, 12].includes(month)) return SeasonType.PEAK;
  if ([3, 4, 5, 6, 9, 10, 11].includes(month)) return SeasonType.NORMAL;
  return SeasonType.LOW;
};

const calculateOrderAmount = (room: Room, checkInDate: Date, checkOutDate: Date) => {
  const seasonType = determineSeasonType(checkInDate);
  const dailyPrice = seasonType === SeasonType.PEAK ? room.peakPrice :
    seasonType === SeasonType.NORMAL ? room.normalPrice : room.lowPrice;
  const totalDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = Number(dailyPrice) * totalDays;
  const depositAmount = totalAmount * 0.3;
  return { seasonType, dailyPrice, totalDays, totalAmount, depositAmount };
};

export const createOrder = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { roomId, customerName, customerPhone, customerIdCard, checkInDate, checkOutDate, guestCount, remark } = req.body;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('离店日期必须晚于入住日期'));
    }
    const room = await Room.findByPk(roomId, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('房源不存在'));
    }
    if (room.status !== RoomStatus.VACANT && room.status !== RoomStatus.LOCKED) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('该房源当前不可预订'));
    }
    const conflictingOrder = await Order.findOne({
      where: {
        roomId,
        status: { [Op.in]: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CHECKED_IN] },
        [Op.or]: [
          { checkInDate: { [Op.between]: [checkIn, checkOut] } },
          { checkOutDate: { [Op.between]: [checkIn, checkOut] } },
          {
            [Op.and]: [
              { checkInDate: { [Op.lte]: checkOut } },
              { checkOutDate: { [Op.gte]: checkIn } }
            ]
          }
        ]
      },
      transaction: t
    });
    if (conflictingOrder) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('该时间段房源已被预订'));
    }
    const { seasonType, dailyPrice, totalDays, totalAmount, depositAmount } = calculateOrderAmount(room, checkIn, checkOut);
    const previousRoomStatus = room.status;
    room.status = RoomStatus.LOCKED;
    await room.save({ transaction: t });
    const order = await Order.create({
      userId: req.user!.userId,
      roomId,
      customerName,
      customerPhone,
      customerIdCard,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount,
      seasonType,
      dailyPrice,
      totalDays,
      totalAmount,
      depositAmount,
      paidAmount: 0,
      extraAmount: 0,
      status: OrderStatus.PENDING_PAYMENT,
      remark
    }, { transaction: t });
    await OrderStatusLog.create({
      orderId: order.id,
      orderNo: order.orderNo,
      currentStatus: OrderStatus.PENDING_PAYMENT,
      operatorId: req.user!.userId,
      operatorName: req.user!.username,
      remark: `创建订单，房源状态从${previousRoomStatus}变更为锁定`
    }, { transaction: t });
    await t.commit();
    res.status(201).json(ResponseUtil.success(order, '订单创建成功，房源已锁定'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getOrderList = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, status, startDate, endDate, keyword, building } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
  }
  if (keyword) {
    where[Op.or] = [
      { orderNo: { [Op.like]: `%${keyword}%` } },
      { customerName: { [Op.like]: `%${keyword}%` } },
      { customerPhone: { [Op.like]: `%${keyword}%` } }
    ];
  }
  if (req.user!.role === 'customer') where.userId = req.user!.userId;
  const roomWhere: any = {};
  if (building) roomWhere.building = building;
  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: Room, as: 'room', where: roomWhere, include: [{ model: RoomCategory, as: 'category', attributes: ['name'] }] }
    ],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize),
    order: [['createdAt', 'DESC']]
  });
  const result: PaginationResult<OrderEntity> = {
    list: rows as unknown as OrderEntity[],
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  };
  res.json(ResponseUtil.success(result));
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findByPk(id, {
    include: [
      { model: Room, as: 'room', include: [{ model: RoomCategory, as: 'category' }] },
      { model: OrderStatusLog, as: 'statusLogs', order: [['createdAt', 'ASC']] }
    ]
  });
  if (!order) return res.status(404).json(ResponseUtil.notFound('订单不存在'));
  res.json(ResponseUtil.success(order));
};

export const payOrder = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { payAmount } = req.body;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('订单不存在'));
    }
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('当前订单状态不允许支付'));
    }
    const actualPayAmount = payAmount || order.totalAmount;
    const previousStatus = order.status;
    order.status = OrderStatus.PAID;
    order.paidAmount = Number(order.paidAmount) + Number(actualPayAmount);
    order.paidTime = new Date();
    await order.save({ transaction: t });
    const room = await Room.findByPk(order.roomId, { transaction: t });
    if (room) {
      room.status = RoomStatus.BOOKED;
      await room.save({ transaction: t });
    }
    await OrderStatusLog.create({
      orderId: order.id,
      orderNo: order.orderNo,
      previousStatus,
      currentStatus: OrderStatus.PAID,
      operatorId: req.user!.userId,
      operatorName: req.user!.username,
      remark: `支付成功，支付金额：${actualPayAmount}`
    }, { transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(order, '支付成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const checkIn = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { remark } = req.body;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('订单不存在'));
    }
    if (order.status !== OrderStatus.PAID) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('当前订单状态不允许入住'));
    }
    const previousStatus = order.status;
    order.status = OrderStatus.CHECKED_IN;
    order.checkInTime = new Date();
    await order.save({ transaction: t });
    const room = await Room.findByPk(order.roomId, { transaction: t });
    if (room) {
      room.status = RoomStatus.CHECKED_IN;
      await room.save({ transaction: t });
    }
    await OrderStatusLog.create({
      orderId: order.id,
      orderNo: order.orderNo,
      previousStatus,
      currentStatus: OrderStatus.CHECKED_IN,
      operatorId: req.user!.userId,
      operatorName: req.user!.username,
      remark: remark || '办理入住'
    }, { transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(order, '入住办理成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const checkOut = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { extraCharges = [], remark } = req.body as CheckOutParams;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('订单不存在'));
    }
    if (order.status !== OrderStatus.CHECKED_IN) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('当前订单状态不允许退房'));
    }
    let extraAmount = 0;
    const processedCharges: ExtraChargeItem[] = [];
    for (const charge of extraCharges) {
      const quantity = charge.quantity || 1;
      const amount = Number(charge.amount) * quantity;
      extraAmount += amount;
      processedCharges.push({
        name: charge.name,
        amount,
        quantity,
        remark: charge.remark
      });
    }
    const actualCheckIn = order.checkInTime || order.checkInDate;
    const actualCheckOut = new Date();
    const actualDays = Math.ceil((actualCheckOut.getTime() - actualCheckIn.getTime()) / (1000 * 60 * 60 * 24));
    let roomChargeAdjustment = 0;
    if (actualDays > order.totalDays) {
      const extraDays = actualDays - order.totalDays;
      roomChargeAdjustment = Number(order.dailyPrice) * extraDays;
      processedCharges.push({
        name: '续住费用',
        amount: roomChargeAdjustment,
        quantity: extraDays,
        remark: `续住${extraDays}天`
      });
      extraAmount += roomChargeAdjustment;
    }
    const finalTotalAmount = Number(order.totalAmount) + extraAmount;
    const remainingAmount = finalTotalAmount - Number(order.paidAmount);
    const previousStatus = order.status;
    order.status = OrderStatus.CHECKED_OUT;
    order.checkOutTime = actualCheckOut;
    order.extraAmount = extraAmount;
    order.extraCharges = JSON.stringify(processedCharges);
    order.totalAmount = finalTotalAmount;
    await order.save({ transaction: t });
    const room = await Room.findByPk(order.roomId, { transaction: t });
    if (room) {
      room.status = RoomStatus.VACANT;
      await room.save({ transaction: t });
    }
    await OrderStatusLog.create({
      orderId: order.id,
      orderNo: order.orderNo,
      previousStatus,
      currentStatus: OrderStatus.CHECKED_OUT,
      operatorId: req.user!.userId,
      operatorName: req.user!.username,
      remark: `办理退房，额外消费：${extraAmount.toFixed(2)}，总金额：${finalTotalAmount.toFixed(2)}${remark ? `，${remark}` : ''}`
    }, { transaction: t });
    await t.commit();
    res.json(ResponseUtil.success({
      order,
      extraCharges: processedCharges,
      extraAmount,
      finalTotalAmount,
      remainingAmount: remainingAmount > 0 ? remainingAmount : 0
    }, '退房办理成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('订单不存在'));
    }
    if (![OrderStatus.PENDING_PAYMENT, OrderStatus.PAID].includes(order.status)) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('当前订单状态不允许取消'));
    }
    const previousStatus = order.status;
    order.status = OrderStatus.CANCELLED;
    order.cancelTime = new Date();
    await order.save({ transaction: t });
    const room = await Room.findByPk(order.roomId, { transaction: t });
    if (room) {
      room.status = RoomStatus.VACANT;
      await room.save({ transaction: t });
    }
    await OrderStatusLog.create({
      orderId: order.id,
      orderNo: order.orderNo,
      previousStatus,
      currentStatus: OrderStatus.CANCELLED,
      operatorId: req.user!.userId,
      operatorName: req.user!.username,
      remark: cancelReason || '取消订单'
    }, { transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(order, '订单已取消，房源已释放'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

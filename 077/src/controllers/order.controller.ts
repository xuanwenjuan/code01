import { Request, Response } from 'express';
import { Op, Transaction, literal } from 'sequelize';
import { ApiResponse } from '../utils/response';
import RentalOrder from '../database/models/RentalOrder.model';
import OrderLog from '../database/models/OrderLog.model';
import PaymentRecord from '../database/models/PaymentRecord.model';
import Customer from '../database/models/Customer.model';
import Equipment from '../database/models/Equipment.model';
import OperationLog from '../database/models/OperationLog.model';
import { sequelize } from '../database';
import {
  NotFoundException,
  BadRequestException,
  ConflictException
} from '../exceptions/http.exception';
import {
  EquipmentStatus,
  OrderStatus,
  PaymentStatus,
  PaymentType,
  RentalType,
  LogModule,
  LogAction
} from '../types';
import { generateOrderNo, generatePaymentNo } from '../utils/orderNo';
import type {
  ICreateOrderDto,
  IUpdateOrderDto,
  ICancelOrderDto,
  IPayDepositDto,
  IReturnEquipmentDto,
  IPayRentDto,
  IOrderFilterDto,
  AuthRequest
} from '../types';

const logOperation = async (req: Request, module: LogModule, operation: string, result: string = 'success') => {
  try {
    const authReq = req as AuthRequest;
    await OperationLog.create({
      userId: authReq.user?.id,
      username: authReq.user?.username,
      module,
      operation,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.socket.remoteAddress,
      params: JSON.stringify({ body: req.body, params: req.params, query: req.query }),
      result,
      status: 1
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
};

const recordOrderLog = async (
  orderId: number,
  operatorId: number | undefined,
  action: string,
  oldStatus: string | null,
  newStatus: string | null,
  description?: string
) => {
  await OrderLog.create({
    orderId,
    operatorId,
    action,
    oldStatus,
    newStatus,
    description
  });
};

export const calculateOverduePenalty = (
  actualEndDate: Date,
  scheduledEndDate: Date,
  dailyPrice: number
): { days: number; amount: number } => {
  const actualEnd = new Date(actualEndDate);
  const scheduledEnd = new Date(scheduledEndDate);

  if (actualEnd <= scheduledEnd) {
    return { days: 0, amount: 0 };
  }

  const diffTime = actualEnd.getTime() - scheduledEnd.getTime();
  const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const penaltyRate = 1.5;
  const overdueAmount = dailyPrice * overdueDays * penaltyRate;

  return { days: overdueDays, amount: Number(overdueAmount.toFixed(2)) };
};

export const createOrder = async (req: Request, res: Response) => {
  const dto: ICreateOrderDto = req.body;
  const authReq = req as AuthRequest;

  if (!dto.customerId) {
    throw new BadRequestException('请选择客户');
  }
  if (!dto.equipmentId) {
    throw new BadRequestException('请选择设备');
  }
  if (!dto.rentalType || !Object.values(RentalType).includes(dto.rentalType)) {
    throw new BadRequestException('请选择正确的租赁类型');
  }
  if (dto.rentalType === RentalType.DAILY && (!dto.rentalDays || dto.rentalDays <= 0)) {
    throw new BadRequestException('请填写有效的租赁天数');
  }
  if (dto.rentalType === RentalType.MONTHLY && (!dto.rentalMonths || dto.rentalMonths <= 0)) {
    throw new BadRequestException('请填写有效的租赁月数');
  }
  if (!dto.startDate) {
    throw new BadRequestException('请选择租赁开始日期');
  }
  if (!dto.endDate) {
    throw new BadRequestException('请选择租赁结束日期');
  }

  const startDate = new Date(dto.startDate);
  const endDate = new Date(dto.endDate);
  if (startDate >= endDate) {
    throw new BadRequestException('租赁结束日期必须晚于开始日期');
  }

  const customer = await Customer.findByPk(dto.customerId);
  if (!customer) {
    throw new BadRequestException('客户不存在');
  }
  if (customer.status !== 1) {
    throw new BadRequestException('客户已被禁用');
  }

  const equipment = await Equipment.findByPk(dto.equipmentId);
  if (!equipment) {
    throw new BadRequestException('设备不存在');
  }
  if (equipment.status !== EquipmentStatus.IN_STOCK) {
    throw new ConflictException('设备不在库中，无法租赁');
  }

  const unitPrice = dto.rentalType === RentalType.DAILY
    ? Number(equipment.dailyPrice)
    : Number(equipment.monthlyPrice);

  const duration = dto.rentalType === RentalType.DAILY ? dto.rentalDays! : dto.rentalMonths!;
  const totalAmount = unitPrice * duration;

  const orderNo = generateOrderNo();

  const order = await sequelize.transaction(async (t: Transaction) => {
    await Equipment.update(
      { status: EquipmentStatus.LOCKED },
      { where: { id: dto.equipmentId }, transaction: t }
    );

    const newOrder = await RentalOrder.create({
      orderNo,
      customerId: dto.customerId,
      equipmentId: dto.equipmentId,
      rentalType: dto.rentalType,
      rentalDays: dto.rentalType === RentalType.DAILY ? dto.rentalDays : null,
      rentalMonths: dto.rentalType === RentalType.MONTHLY ? dto.rentalMonths : null,
      startDate,
      endDate,
      unitPrice,
      totalAmount,
      deposit: Number(equipment.deposit),
      depositStatus: PaymentStatus.UNPAID,
      rentStatus: PaymentStatus.UNPAID,
      overdueDays: 0,
      overdueAmount: 0,
      damageAmount: 0,
      status: OrderStatus.PENDING_PAYMENT,
      operatorId: authReq.user?.id,
      remark: dto.remark
    }, { transaction: t });

    await recordOrderLog(
      newOrder.id,
      authReq.user?.id,
      LogAction.CREATE,
      null,
      OrderStatus.PENDING_PAYMENT,
      `创建订单 ${orderNo}，设备已锁定`
    );

    await logOperation(req, LogModule.ORDER, `${LogAction.CREATE}_${newOrder.id}`);

    return newOrder;
  });

  res.json(ApiResponse.success(order, '订单创建成功，设备已锁定'));
};

export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: IUpdateOrderDto = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    throw new BadRequestException('订单已确认，无法修改');
  }

  if (dto.startDate && dto.endDate) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (start >= end) {
      throw new BadRequestException('租赁结束日期必须晚于开始日期');
    }
  }

  await sequelize.transaction(async (t: Transaction) => {
    const oldOrder = { ...order.toJSON() };
    await order.update(dto, { transaction: t });

    const changes: string[] = [];
    if (dto.startDate) changes.push('开始日期');
    if (dto.endDate) changes.push('结束日期');
    if (dto.remark) changes.push('备注');

    if (changes.length > 0) {
      await recordOrderLog(
        orderId,
        authReq.user?.id,
        LogAction.UPDATE,
        oldOrder.status,
        order.status,
        `修改订单信息: ${changes.join(', ')}`
      );
    }

    await logOperation(req, LogModule.ORDER, `${LogAction.UPDATE}_${orderId}`);
  });

  res.json(ApiResponse.success(order, '订单更新成功'));
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: ICancelOrderDto = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
    throw new BadRequestException('订单已完成或已取消');
  }

  if (order.status === OrderStatus.IN_USE || order.status === OrderStatus.OVERDUE) {
    throw new BadRequestException('设备已交付使用，需先归还才能取消');
  }

  await sequelize.transaction(async (t: Transaction) => {
    const oldStatus = order.status;

    if (oldStatus === OrderStatus.PENDING_PAYMENT || oldStatus === OrderStatus.PAID) {
      await Equipment.update(
        { status: EquipmentStatus.IN_STOCK },
        { where: { id: order.equipmentId }, transaction: t }
      );
    }

    await order.update({ status: OrderStatus.CANCELLED }, { transaction: t });

    await recordOrderLog(
      orderId,
      authReq.user?.id,
      'cancel',
      oldStatus,
      OrderStatus.CANCELLED,
      dto.reason || '取消订单，设备已解锁'
    );

    await logOperation(req, LogModule.ORDER, `CANCEL_${orderId}`);
  });

  res.json(ApiResponse.success(null, '订单取消成功，设备已解锁'));
};

export const payDeposit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: IPayDepositDto = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  if (!dto.amount || dto.amount <= 0) {
    throw new BadRequestException('请填写有效的支付金额');
  }
  if (!dto.paymentMethod) {
    throw new BadRequestException('请选择支付方式');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    throw new BadRequestException('订单状态不正确');
  }

  if (order.depositStatus === PaymentStatus.PAID) {
    throw new BadRequestException('押金已支付');
  }

  await sequelize.transaction(async (t: Transaction) => {
    const paymentNo = generatePaymentNo();
    await PaymentRecord.create({
      paymentNo,
      orderId,
      customerId: order.customerId,
      paymentType: PaymentType.DEPOSIT,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      transactionNo: dto.transactionNo,
      remark: dto.remark,
      operatorId: authReq.user?.id
    }, { transaction: t });

    await order.update({
      depositStatus: PaymentStatus.PAID,
      status: OrderStatus.PAID
    }, { transaction: t });

    await recordOrderLog(
      orderId,
      authReq.user?.id,
      'pay_deposit',
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      `支付押金 ${dto.amount} 元，支付方式: ${dto.paymentMethod}`
    );

    await logOperation(req, LogModule.ORDER, `PAY_DEPOSIT_${orderId}`);
  });

  res.json(ApiResponse.success(null, '押金支付成功'));
};

export const deliverEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { remark } = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status !== OrderStatus.PAID) {
    throw new BadRequestException('订单状态不正确，需先支付押金');
  }

  const equipment = await Equipment.findByPk(order.equipmentId);
  if (!equipment || equipment.status !== EquipmentStatus.LOCKED) {
    throw new ConflictException('设备状态异常，无法出库');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await order.update({ status: OrderStatus.DELIVERED }, { transaction: t });

    await equipment.update({ status: EquipmentStatus.RENTED }, { transaction: t });

    await recordOrderLog(
      orderId,
      authReq.user?.id,
      'deliver',
      OrderStatus.PAID,
      OrderStatus.DELIVERED,
      remark || '设备已出库交付客户'
    );

    await logOperation(req, LogModule.ORDER, `DELIVER_${orderId}`);
  });

  res.json(ApiResponse.success(null, '设备出库成功'));
};

export const startRental = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { remark } = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status !== OrderStatus.DELIVERED) {
    throw new BadRequestException('订单状态不正确，需设备先出库');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await order.update({ status: OrderStatus.IN_USE }, { transaction: t });

    await recordOrderLog(
      orderId,
      authReq.user?.id,
      'start_rental',
      OrderStatus.DELIVERED,
      OrderStatus.IN_USE,
      remark || '客户确认接收设备，开始租赁'
    );

    await logOperation(req, LogModule.ORDER, `START_RENTAL_${orderId}`);
  });

  res.json(ApiResponse.success(null, '租赁开始成功'));
};

export const returnEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: IReturnEquipmentDto = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  if (dto.damageAmount !== undefined && dto.damageAmount < 0) {
    throw new BadRequestException('损坏赔偿金额不能小于0');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status !== OrderStatus.IN_USE && order.status !== OrderStatus.OVERDUE) {
    throw new BadRequestException('订单状态不正确，设备需在使用中才能归还');
  }

  const today = new Date();
  const { days: overdueDays, amount: overdueAmount } = calculateOverduePenalty(
    today,
    order.endDate,
    Number(order.unitPrice)
  );

  const damageAmount = dto.damageAmount || 0;

  await sequelize.transaction(async (t: Transaction) => {
    await order.update({
      actualEndDate: today,
      overdueDays,
      overdueAmount,
      damageAmount,
      status: OrderStatus.RETURNED
    }, { transaction: t });

    await Equipment.update(
      { status: EquipmentStatus.IN_STOCK },
      { where: { id: order.equipmentId }, transaction: t }
    );

    let description = `设备归还成功`;
    if (overdueDays > 0) {
      description += `，逾期 ${overdueDays} 天，逾期罚金 ${overdueAmount} 元`;
    }
    if (damageAmount > 0) {
      description += `，损坏赔偿 ${damageAmount} 元`;
      if (dto.damageDescription) {
        description += `，备注: ${dto.damageDescription}`;
      }
    }

    await recordOrderLog(
      orderId,
      authReq.user?.id,
      'return',
      order.status,
      OrderStatus.RETURNED,
      description
    );

    await logOperation(req, LogModule.ORDER, `RETURN_${orderId}`);
  });

  res.json(ApiResponse.success({
    overdueDays,
    overdueAmount,
    damageAmount,
    totalPayable: Number(order.totalAmount) + overdueAmount + damageAmount
  }, '设备归还成功'));
};

export const payRent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: IPayRentDto = req.body;
  const authReq = req as AuthRequest;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  if (!dto.amount || dto.amount <= 0) {
    throw new BadRequestException('请填写有效的支付金额');
  }
  if (!dto.paymentMethod) {
    throw new BadRequestException('请选择支付方式');
  }

  const order = await RentalOrder.findByPk(orderId);
  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (order.status !== OrderStatus.RETURNED) {
    throw new BadRequestException('订单状态不正确，需设备先归还');
  }

  if (order.rentStatus === PaymentStatus.PAID) {
    throw new BadRequestException('租金已支付');
  }

  await sequelize.transaction(async (t: Transaction) => {
    const paymentNo = generatePaymentNo();
    await PaymentRecord.create({
      paymentNo,
      orderId,
      customerId: order.customerId,
      paymentType: PaymentType.RENT,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      transactionNo: dto.transactionNo,
      remark: dto.remark,
      operatorId: authReq.user?.id
    }, { transaction: t });

    if (order.overdueAmount > 0) {
      await PaymentRecord.create({
        paymentNo: generatePaymentNo(),
        orderId,
        customerId: order.customerId,
        paymentType: PaymentType.OVERDUE,
        amount: order.overdueAmount,
        paymentMethod: dto.paymentMethod,
        operatorId: authReq.user?.id
      }, { transaction: t });
    }

    if (order.damageAmount > 0) {
      await PaymentRecord.create({
        paymentNo: generatePaymentNo(),
        orderId,
        customerId: order.customerId,
        paymentType: PaymentType.DAMAGE,
        amount: order.damageAmount,
        paymentMethod: dto.paymentMethod,
        operatorId: authReq.user?.id
      }, { transaction: t });
    }

    await order.update({
      rentStatus: PaymentStatus.PAID,
      status: OrderStatus.COMPLETED
    }, { transaction: t });

    await recordOrderLog(
      orderId,
      authReq.user?.id,
      'pay_rent',
      OrderStatus.RETURNED,
      OrderStatus.COMPLETED,
      `支付租金 ${dto.amount} 元，订单完成`
    );

    await logOperation(req, LogModule.ORDER, `PAY_RENT_${orderId}`);
  });

  res.json(ApiResponse.success(null, '租金支付成功，订单已完成'));
};

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  const order = await RentalOrder.findByPk(orderId, {
    include: [
      { model: Customer, as: 'customer' },
      { model: Equipment, as: 'equipment', include: [{ model: require('../database/models/Category.model').default, as: 'category' }] }
    ]
  });

  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  const orderLogs = await OrderLog.findAll({
    where: { orderId },
    order: [['createdAt', 'ASC']]
  });

  const paymentRecords = await PaymentRecord.findAll({
    where: { orderId },
    order: [['createdAt', 'ASC']]
  });

  res.json(ApiResponse.success({
    ...order.toJSON(),
    orderLogs,
    paymentRecords
  }));
};

export const getOrderList = async (req: Request, res: Response) => {
  const filter: IOrderFilterDto = req.query as any;

  const page = filter.page || 1;
  const pageSize = filter.pageSize || 10;

  if (page < 1) {
    throw new BadRequestException('页码必须大于0');
  }
  if (pageSize < 1 || pageSize > 100) {
    throw new BadRequestException('每页数量必须在1-100之间');
  }

  const where: any = {};

  if (filter.orderNo) {
    where.orderNo = { [Op.like]: `%${filter.orderNo}%` };
  }
  if (filter.customerId) {
    where.customerId = filter.customerId;
  }
  if (filter.equipmentId) {
    where.equipmentId = filter.equipmentId;
  }
  if (filter.status) {
    where.status = filter.status;
  }
  if (filter.startDateFrom && filter.startDateTo) {
    where.startDate = {
      [Op.between]: [new Date(filter.startDateFrom), new Date(filter.startDateTo)]
    };
  }
  if (filter.endDateFrom && filter.endDateTo) {
    where.endDate = {
      [Op.between]: [new Date(filter.endDateFrom), new Date(filter.endDateTo)]
    };
  }

  const { count, rows } = await RentalOrder.findAndCountAll({
    where,
    include: [
      { model: Customer, as: 'customer' },
      { model: Equipment, as: 'equipment' }
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  res.json(ApiResponse.successPage(rows, count, page, pageSize));
};

export const getOrderLogs = async (req: Request, res: Response) => {
  const { id } = req.params;

  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    throw new BadRequestException('无效的订单ID');
  }

  const logs = await OrderLog.findAll({
    where: { orderId },
    order: [['createdAt', 'ASC']]
  });

  res.json(ApiResponse.success(logs));
};

export const getOrderStats = async (req: Request, res: Response) => {
  const stats = await RentalOrder.findAll({
    attributes: [
      'status',
      [literal('COUNT(*)'), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const total = await RentalOrder.count();
  const pendingPayment = await RentalOrder.count({ where: { status: OrderStatus.PENDING_PAYMENT } });
  const paid = await RentalOrder.count({ where: { status: OrderStatus.PAID } });
  const delivered = await RentalOrder.count({ where: { status: OrderStatus.DELIVERED } });
  const inUse = await RentalOrder.count({ where: { status: OrderStatus.IN_USE } });
  const overdue = await RentalOrder.count({ where: { status: OrderStatus.OVERDUE } });
  const returned = await RentalOrder.count({ where: { status: OrderStatus.RETURNED } });
  const completed = await RentalOrder.count({ where: { status: OrderStatus.COMPLETED } });
  const cancelled = await RentalOrder.count({ where: { status: OrderStatus.CANCELLED } });

  res.json(ApiResponse.success({
    total,
    byStatus: {
      pendingPayment,
      paid,
      delivered,
      inUse,
      overdue,
      returned,
      completed,
      cancelled
    },
    details: stats
  }));
};

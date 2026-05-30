import { Request, Response, NextFunction } from 'express';
import { Op, fn, col, cast } from 'sequelize';
import Order, { OrderStatus } from '../models/Order';
import Auction, { AuctionStatus } from '../models/Auction';
import Equipment, { EquipmentStatus } from '../models/Equipment';
import User from '../models/User';
import Commission, { CommissionStatus } from '../models/Commission';
import Category from '../models/Category';
import { ApiResponse } from '../utils/response';
import { AppError, NotFoundError, ForbiddenError } from '../exceptions/AppError';
import { UserRole } from '../models';
import { calculateCommission, getSettlementMonth } from '../utils/commission';
import dayjs from 'dayjs';
import sequelize from '../config/database';

const generateOrderNo = (): string => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OR${timestamp}${random}`;
};

export const createOrderFromAuction = async (auctionId: number) => {
  const t = await sequelize.transaction();
  try {
    const auction = await Auction.findByPk(auctionId, { transaction: t });
    if (!auction) {
      throw new NotFoundError('竞拍不存在');
    }
    
    if (auction.bidCount === 0) {
      await auction.update({ status: AuctionStatus.FAILED }, { transaction: t });
      const equipment = await Equipment.findByPk(auction.equipmentId, { transaction: t });
      if (equipment) {
        await equipment.update({ status: EquipmentStatus.OFF_SHELF }, { transaction: t });
      }
      await t.commit();
      return null;
    }
    
    const winningBid = await (await import('../models/Bid')).default.findOne({
      where: { auctionId },
      order: [['bidPrice', 'DESC']],
      transaction: t,
    });
    
    if (!winningBid) {
      throw new AppError('未找到中标记录', 400);
    }
    
    const equipment = await Equipment.findByPk(auction.equipmentId, { transaction: t });
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }
    
    const category = await Category.findByPk(equipment.categoryId, { transaction: t });
    const finalPrice = auction.currentPrice;
    
    const { commissionRate, commissionAmount } = calculateCommission(
      Number(finalPrice),
      category?.commissionRate
    );
    
    const sellerReceivable = finalPrice - commissionAmount;
    const depositAmount = finalPrice * 0.2;
    
    const orderNo = generateOrderNo();
    
    const order = await Order.create(
      {
        orderNo,
        auctionId,
        equipmentId: auction.equipmentId,
        buyerId: winningBid.userId,
        sellerId: auction.sellerId,
        finalPrice,
        depositAmount,
        commissionAmount,
        sellerReceivable,
        status: OrderStatus.PENDING_PAYMENT,
      },
      { transaction: t }
    );
    
    await auction.update({ winnerId: winningBid.userId, status: AuctionStatus.ENDED }, { transaction: t });
    await equipment.update({ status: EquipmentStatus.SOLD }, { transaction: t });
    
    await Commission.create(
      {
        orderId: order.id,
        sellerId: auction.sellerId,
        categoryId: equipment.categoryId,
        transactionAmount: finalPrice,
        commissionRate,
        commissionAmount,
        status: CommissionStatus.PENDING,
        settlementMonth: getSettlementMonth(),
      },
      { transaction: t }
    );
    
    await t.commit();
    
    return order;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'auctionNo'],
        },
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'brand', 'equipmentNo'],
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'phone', 'realName'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'phone', 'realName'],
        },
      ],
    });
    
    if (!order) {
      throw new NotFoundError('订单不存在');
    }
    
    if (
      req.user!.role !== UserRole.ADMIN &&
      order.buyerId !== req.user!.userId &&
      order.sellerId !== req.user!.userId
    ) {
      throw new AppError('无权查看此订单', 403);
    }
    
    ApiResponse.success(res, order);
  } catch (error) {
    next(error);
  }
};

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, role } = req.query;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    const whereCondition: any = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (userRole !== UserRole.ADMIN) {
      if (role === 'buyer') {
        whereCondition.buyerId = userId;
      } else if (role === 'seller') {
        whereCondition.sellerId = userId;
      } else {
        whereCondition[Op.or] = [{ buyerId: userId }, { sellerId: userId }];
      }
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['id', 'DESC']],
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'brand'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const payOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      throw new NotFoundError('订单不存在');
    }
    
    if (order.buyerId !== req.user!.userId) {
      throw new AppError('无权支付此订单', 403);
    }
    
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new AppError('订单状态不允许支付', 400);
    }
    
    const buyer = await User.findByPk(order.buyerId, { transaction: t });
    if (!buyer) {
      throw new NotFoundError('买家不存在');
    }
    
    if (Number(buyer.balance) < order.depositAmount) {
      throw new AppError('余额不足', 400);
    }
    
    await buyer.update(
      { balance: Number(buyer.balance) - order.depositAmount },
      { transaction: t }
    );
    
    await order.update(
      { status: OrderStatus.PAID, paymentTime: new Date() },
      { transaction: t }
    );
    
    await t.commit();
    
    ApiResponse.success(res, order, '支付成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, remark } = req.body;
    
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      throw new NotFoundError('订单不存在');
    }
    
    if (
      req.user!.role !== UserRole.ADMIN &&
      order.buyerId !== req.user!.userId &&
      order.sellerId !== req.user!.userId
    ) {
      throw new AppError('无权修改此订单状态', 403);
    }
    
    if (!Object.values(OrderStatus).includes(status)) {
      throw new AppError('无效的状态值', 400);
    }
    
    validateOrderStatusTransition(order.status, status, req.user!.role);
    
    const updateData: any = { status, remark };
    
    if (status === OrderStatus.PENDING_DELIVERY) {
      updateData.deliveryTime = new Date();
    } else if (status === OrderStatus.COMPLETED) {
      updateData.completedTime = new Date();
      
      const commission = await Commission.findOne({
        where: { orderId: id },
        transaction: t,
      });
      if (commission) {
        await commission.update({ status: CommissionStatus.SETTLED, settlementTime: new Date() }, { transaction: t });
      }
    }
    
    await order.update(updateData, { transaction: t });
    
    await t.commit();
    
    ApiResponse.success(res, order, '状态更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const validateOrderStatusTransition = (currentStatus: OrderStatus, newStatus: OrderStatus, userRole: string) => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.PENDING_DELIVERY, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
    [OrderStatus.PENDING_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
  };
  
  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new AppError(`无法从 ${currentStatus} 状态变更为 ${newStatus}`, 400);
  }
  
  const allowedActionsByRole: Record<string, OrderStatus[]> = {
    [UserRole.BUYER]: [OrderStatus.COMPLETED],
    [UserRole.SELLER]: [OrderStatus.PENDING_DELIVERY, OrderStatus.DELIVERED],
    [UserRole.ADMIN]: Object.values(OrderStatus),
  };
  
  if (!allowedActionsByRole[userRole]?.includes(newStatus)) {
    throw new ForbiddenError(`当前角色无权执行 ${newStatus} 操作`);
  }
};

export const getBuyerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const buyerId = req.user!.userId;
    
    const whereCondition: any = { buyerId };
    
    if (status) {
      whereCondition.status = status;
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'brand'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const sellerId = req.user!.userId;
    
    const whereCondition: any = { sellerId };
    
    if (status) {
      whereCondition.status = status;
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'brand'],
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'username', 'phone'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      throw new NotFoundError('订单不存在');
    }
    
    if (order.buyerId !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权取消此订单', 403);
    }
    
    if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.PAID) {
      throw new AppError('当前状态无法取消订单', 400);
    }
    
    await order.update({ status: OrderStatus.CANCELLED }, { transaction: t });
    
    if (order.status === OrderStatus.PAID) {
      const commission = await Commission.findOne({
        where: { orderId: id },
        transaction: t,
      });
      if (commission) {
        await commission.update({ status: CommissionStatus.PENDING }, { transaction: t });
      }
    }
    
    await t.commit();
    
    ApiResponse.success(res, order, '订单取消成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

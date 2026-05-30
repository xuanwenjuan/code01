import { Request, Response, NextFunction } from 'express';
import sequelize from '../config/database';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import Equipment from '../models/equipment.model';
import Category from '../models/category.model';
import { ResponseUtil } from '../utils/response.util';
import { OrderStatus } from '../common/enums';
import { Op, fn, col } from 'sequelize';
import moment from 'moment';

export const getRevenueStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const orders = await Order.findAll({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: { [Op.between]: [start, end] },
      },
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), period === 'month' ? '%Y-%m' : '%Y-%m-%d'), 'date'],
        [fn('SUM', col('totalAmount')), 'revenue'],
        [fn('COUNT', col('id')), 'orderCount'],
      ],
      group: ['date'],
      order: [[col('date'), 'ASC']],
    });

    res.json(ResponseUtil.success(orders));
  } catch (error) {
    next(error);
  }
};

export const getCategoryStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const categoryStats = await OrderItem.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            status: OrderStatus.COMPLETED,
            createdAt: { [Op.between]: [start, end] },
          },
          attributes: [],
        },
        {
          model: Equipment,
          as: 'equipment',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
          attributes: [],
        },
      ],
      attributes: [
        [col('equipment.category.id'), 'categoryId'],
        [col('equipment.category.name'), 'categoryName'],
        [fn('SUM', col('subtotal')), 'revenue'],
        [fn('COUNT', col('id')), 'rentalCount'],
      ],
      group: ['equipment.category.id'],
      order: [[fn('SUM', col('subtotal')), 'DESC']],
    });

    res.json(ResponseUtil.success(categoryStats));
  } catch (error) {
    next(error);
  }
};

export const getEquipmentUtilization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'month').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const equipments = await Equipment.findAll({
      where: { status: { [Op.ne]: 'scrapped' } },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          required: false,
          include: [
            {
              model: Order,
              as: 'order',
              where: {
                status: { [Op.in]: [OrderStatus.CONFIRMED, OrderStatus.OUTBOUND, OrderStatus.IN_USE, OrderStatus.RETURNED, OrderStatus.COMPLETED] },
                [Op.or]: [
                  { startTime: { [Op.between]: [start, end] } },
                  { endTime: { [Op.between]: [start, end] } },
                  {
                    [Op.and]: [
                      { startTime: { [Op.lte]: start } },
                      { endTime: { [Op.gte]: end } },
                    ],
                  },
                ],
              },
              attributes: ['startTime', 'endTime'],
            },
          ],
        },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    const utilizationData = equipments.map((equipment) => {
      let rentedDays = 0;
      equipment.orderItems?.forEach((item) => {
        if (item.order) {
          const itemStart = new Date(Math.max(start.getTime(), new Date(item.order.startTime).getTime()));
          const itemEnd = new Date(Math.min(end.getTime(), new Date(item.order.endTime).getTime()));
          const days = Math.ceil((itemEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24));
          rentedDays += Math.max(0, days);
        }
      });

      const utilizationRate = totalDays > 0 ? ((rentedDays / totalDays) * 100).toFixed(2) : '0.00';

      return {
        id: equipment.id,
        assetNo: equipment.assetNo,
        name: equipment.name,
        category: equipment.category?.name,
        totalDays,
        rentedDays,
        utilizationRate: Number(utilizationRate),
      };
    });

    res.json(ResponseUtil.success(utilizationData));
  } catch (error) {
    next(error);
  }
};

export const getSummaryStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const totalRevenue = await Order.sum('totalAmount', {
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: { [Op.between]: [start, end] },
      },
    });

    const totalOrders = await Order.count({
      where: {
        createdAt: { [Op.between]: [start, end] },
      },
    });

    const completedOrders = await Order.count({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: { [Op.between]: [start, end] },
      },
    });

    const totalEquipments = await Equipment.count({
      where: { status: { [Op.ne]: 'scrapped' } },
    });

    const inUseEquipments = await Equipment.count({
      where: { status: 'rented' },
    });

    const totalDamageAmount = await OrderItem.sum('damageAmount', {
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            status: OrderStatus.COMPLETED,
            createdAt: { [Op.between]: [start, end] },
          },
        },
      ],
    });

    const totalPaidAmount = await Order.sum('paidAmount', {
      where: {
        createdAt: { [Op.between]: [start, end] },
      },
    });

    const summary = {
      totalRevenue: totalRevenue || 0,
      totalPaidAmount: totalPaidAmount || 0,
      totalUnpaidAmount: (totalRevenue || 0) - (totalPaidAmount || 0),
      totalOrders,
      completedOrders,
      completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100) : 0,
      totalEquipments,
      inUseEquipments,
      equipmentUtilization: totalEquipments > 0 ? ((inUseEquipments / totalEquipments) * 100) : 0,
      totalDamageAmount: totalDamageAmount || 0,
    };

    res.json(ResponseUtil.success(summary));
  } catch (error) {
    next(error);
  }
};

export const getCustomerStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, top = 10 } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const customerStats = await Order.findAll({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: { [Op.between]: [start, end] },
      },
      attributes: [
        'customerName',
        'customerPhone',
        [fn('SUM', col('totalAmount')), 'totalRevenue'],
        [fn('COUNT', col('id')), 'orderCount'],
      ],
      group: ['customerName', 'customerPhone'],
      order: [[fn('SUM', col('totalAmount')), 'DESC']],
      limit: Number(top),
    });

    res.json(ResponseUtil.success(customerStats));
  } catch (error) {
    next(error);
  }
};

export const getSalespersonStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const salesStats = await Order.findAll({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: { [Op.between]: [start, end] },
      },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
      ],
      attributes: [
        'createdBy',
        [fn('SUM', col('totalAmount')), 'totalRevenue'],
        [fn('COUNT', col('id')), 'orderCount'],
      ],
      group: ['createdBy'],
      order: [[fn('SUM', col('totalAmount')), 'DESC']],
    });

    res.json(ResponseUtil.success(salesStats));
  } catch (error) {
    next(error);
  }
};

export const getDamageStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const damageStats = await OrderItem.findAll({
      where: {
        damageAmount: { [Op.gt]: 0 },
      },
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            status: OrderStatus.COMPLETED,
            createdAt: { [Op.between]: [start, end] },
          },
          attributes: ['orderNo', 'customerName'],
        },
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'assetNo', 'name'],
        },
      ],
      attributes: ['id', 'quantity', 'damagedQuantity', 'damageAmount', 'remarks'],
      order: [[col('damageAmount'), 'DESC']],
    });

    const totalDamageAmount = damageStats.reduce((sum, item) => sum + item.damageAmount, 0);

    res.json(ResponseUtil.success({
      list: damageStats,
      totalDamageAmount,
      totalCount: damageStats.length,
    }));
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : moment().subtract(1, 'year').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    const paymentStats = await Order.findAll({
      where: {
        createdAt: { [Op.between]: [start, end] },
      },
      attributes: [
        'paymentStatus',
        [fn('SUM', col('totalAmount')), 'totalAmount'],
        [fn('SUM', col('paidAmount')), 'paidAmount'],
        [fn('COUNT', col('id')), 'orderCount'],
      ],
      group: ['paymentStatus'],
    });

    res.json(ResponseUtil.success(paymentStats));
  } catch (error) {
    next(error);
  }
};
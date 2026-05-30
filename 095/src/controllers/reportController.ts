import { Request, Response, NextFunction } from 'express';
import sequelize from '../config/database';
import { Order, OrderItem, Category, RevenueReport } from '../models';
import { successResponse } from '../utils/response';
import { OrderStatus } from '../types';
import { Op } from 'sequelize';

export const getRevenueStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, categoryId } = req.query;

    const where: any = {
      status: {
        [Op.in]: [OrderStatus.PAID, OrderStatus.PRODUCING, OrderStatus.QUALITY_CHECKING, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
      },
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Category,
              as: 'category',
              ...(categoryId ? { where: { id: categoryId } } : {}),
            },
          ],
        },
      ],
    });

    let totalOrders = orders.length;
    let totalAmount = 0;
    let totalMaterialCost = 0;
    let totalQuantity = 0;

    for (const order of orders) {
      totalAmount += Number(order.totalAmount);
      for (const item of (order as any).items) {
        totalMaterialCost += Number(item.materialCost);
        totalQuantity += Number(item.quantity);
      }
    }

    const grossProfit = totalAmount - totalMaterialCost;
    const grossProfitRate = totalAmount > 0 ? ((grossProfit / totalAmount) * 100).toFixed(2) : 0;

    res.json(
      successResponse({
        totalOrders,
        totalQuantity,
        totalAmount,
        totalMaterialCost,
        grossProfit,
        grossProfitRate: Number(grossProfitRate),
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getRevenueByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: {
        [Op.in]: [OrderStatus.PAID, OrderStatus.PRODUCING, OrderStatus.QUALITY_CHECKING, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
      },
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const categoryStats = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('materialCost')), 'totalMaterialCost'],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      group: ['category.id'],
      order: [[sequelize.literal('totalAmount'), 'DESC']],
    });

    const result = categoryStats.map((stat: any) => ({
      categoryId: stat.category?.id,
      categoryName: stat.category?.name || '未分类',
      totalQuantity: Number(stat.getDataValue('totalQuantity') || 0),
      totalAmount: Number(stat.getDataValue('totalAmount') || 0),
      totalMaterialCost: Number(stat.getDataValue('totalMaterialCost') || 0),
      grossProfit: Number(stat.getDataValue('totalAmount') || 0) - Number(stat.getDataValue('totalMaterialCost') || 0),
    }));

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const results = await RevenueReport.findAll({
      where: sequelize.where(sequelize.fn('YEAR', sequelize.col('reportDate')), year),
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('reportDate'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('totalOrders')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('totalQuantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.col('materialCost')), 'materialCost'],
        [sequelize.fn('SUM', sequelize.col('grossProfit')), 'grossProfit'],
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('reportDate'), '%Y-%m')],
      order: [[sequelize.literal('month'), 'ASC']],
    });

    const formattedResults = results.map((row: any) => ({
      month: row.getDataValue('month'),
      totalOrders: Number(row.getDataValue('totalOrders') || 0),
      totalQuantity: Number(row.getDataValue('totalQuantity') || 0),
      totalAmount: Number(row.getDataValue('totalAmount') || 0),
      materialCost: Number(row.getDataValue('materialCost') || 0),
      grossProfit: Number(row.getDataValue('grossProfit') || 0),
    }));

    res.json(successResponse(formattedResults));
  } catch (error) {
    next(error);
  }
};

export const generateDailyReport = async (_req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.findAll({
      where: {
        createdAt: { [Op.between]: [today, tomorrow] },
        status: {
          [Op.in]: [OrderStatus.PAID, OrderStatus.PRODUCING, OrderStatus.QUALITY_CHECKING, OrderStatus.SHIPPED, OrderStatus.COMPLETED],
        },
      },
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    let totalOrders = orders.length;
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalMaterialCost = 0;

    for (const order of orders) {
      totalAmount += Number(order.totalAmount);
      for (const item of (order as any).items) {
        totalQuantity += Number(item.quantity);
        totalMaterialCost += Number(item.materialCost);
      }
    }

    const grossProfit = totalAmount - totalMaterialCost;
    const grossProfitRate = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;

    await RevenueReport.create(
      {
        reportDate: today,
        totalOrders,
        totalQuantity,
        totalAmount,
        materialCost: totalMaterialCost,
        processingFee: 0,
        grossProfit,
        grossProfitRate,
      },
      { transaction }
    );

    await transaction.commit();

    res.json(successResponse(null, '日报表生成成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
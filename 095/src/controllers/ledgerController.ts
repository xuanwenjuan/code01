import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import sequelize from '../config/database';
import { Ledger, LedgerItem, Order, OrderItem, Category, Product, User } from '../models';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { LedgerStatus, OrderStatus } from '../types';
import { Op } from 'sequelize';
import logger from '../config/logger';

export const createLedgerValidation = [
  body('orderId').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
];

export const updateLedgerValidation = [
  param('id').isInt({ min: 1 }).withMessage('台账ID必须为正整数'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
  body('materialLossRate').optional().isFloat({ min: 0, max: 1 }).withMessage('面料损耗率必须在0-1之间'),
];

const calculateProfit = (orderItems: any[], materialLossRate: number = 0.05) => {
  let totalRevenue = 0;
  let totalMaterialCost = 0;
  let totalCustomFee = 0;

  for (const item of orderItems) {
    totalRevenue += Number(item.totalPrice);
    totalMaterialCost += Number(item.materialCost) * Number(item.quantity) * (1 + materialLossRate);
    totalCustomFee += Number(item.customFee) * Number(item.quantity);
  }

  const processingCost = totalRevenue * 0.15;
  const totalCost = totalMaterialCost + totalCustomFee + processingCost;
  const profit = totalRevenue - totalCost;
  const profitRate = totalRevenue > 0 ? profit / totalRevenue : 0;

  return {
    totalRevenue,
    totalMaterialCost,
    totalCustomFee,
    processingCost,
    totalCost,
    profit,
    profitRate,
  };
};

export const createLedger = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { orderId, notes, materialLossRate } = req.body;

    const order = await Order.findByPk(orderId, {
      transaction,
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      await transaction.rollback();
      return next(new AppError('订单不存在', 404));
    }

    if (order.status !== OrderStatus.COMPLETED) {
      await transaction.rollback();
      return next(new AppError('只能为已完成订单生成台账', 400));
    }

    const existingLedger = await Ledger.findOne({ where: { orderId }, transaction });
    if (existingLedger) {
      await transaction.rollback();
      return next(new AppError('该订单已存在台账记录', 400));
    }

    const lossRate = materialLossRate || 0.05;
    const calculation = calculateProfit(order.items, lossRate);

    const ledger = await Ledger.create(
      {
        orderId,
        orderNo: order.orderNo,
        companyName: order.companyName,
        totalRevenue: calculation.totalRevenue,
        totalMaterialCost: calculation.totalMaterialCost,
        totalCustomFee: calculation.totalCustomFee,
        processingCost: calculation.processingCost,
        totalCost: calculation.totalCost,
        profit: calculation.profit,
        profitRate: calculation.profitRate,
        materialLossRate: lossRate,
        status: LedgerStatus.DRAFT,
        notes,
        createdBy: req.user!.userId,
      },
      { transaction }
    );

    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction });
      const category = product ? await Category.findByPk(product.categoryId, { transaction }) : null;

      const unitMaterialCost = Number(item.materialCost) * (1 + lossRate);
      const unitCustomFee = Number(item.customFee);
      const unitProcessingCost = Number(item.unitPrice) * 0.15;
      const unitTotalCost = unitMaterialCost + unitCustomFee + unitProcessingCost;
      const unitProfit = Number(item.unitPrice) + unitCustomFee - unitTotalCost;

      await LedgerItem.create(
        {
          ledgerId: ledger.id,
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          categoryId: category?.id,
          categoryName: category?.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitMaterialCost,
          unitCustomFee,
          unitProcessingCost,
          unitTotalCost,
          unitProfit,
          totalMaterialCost: unitMaterialCost * item.quantity,
          totalCustomFee: unitCustomFee * item.quantity,
          totalProcessingCost: unitProcessingCost * item.quantity,
          totalCost: unitTotalCost * item.quantity,
          totalRevenue: item.totalPrice,
          totalProfit: unitProfit * item.quantity,
          sizeDetails: item.sizeDetails,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const result = await Ledger.findByPk(ledger.id, {
      include: [
        { model: LedgerItem, as: 'items' },
        { model: Order, as: 'order' },
        { model: User, as: 'creator', attributes: ['id', 'realName', 'username'] },
      ],
    });

    logger.info(`台账创建成功: 订单${order.orderNo}, 创建人: ${req.user!.username}`);
    res.json(successResponse(result, '台账创建成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getLedgerList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderNo,
      companyName,
      categoryId,
      status,
      startDate,
      endDate,
      minProfit,
      maxProfit,
      minProfitRate,
      maxProfitRate,
    } = req.query;

    const where: any = {};
    if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
    if (companyName) where.companyName = { [Op.like]: `%${companyName}%` };
    if (status) where.status = status;
    if (minProfit) where.profit = { ...where.profit, [Op.gte]: Number(minProfit) };
    if (maxProfit) where.profit = { ...where.profit, [Op.lte]: Number(maxProfit) };
    if (minProfitRate) where.profitRate = { ...where.profitRate, [Op.gte]: Number(minProfitRate) };
    if (maxProfitRate) where.profitRate = { ...where.profitRate, [Op.lte]: Number(maxProfitRate) };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const itemWhere: any = {};
    if (categoryId) itemWhere.categoryId = categoryId;

    const { count, rows } = await Ledger.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        { model: LedgerItem, as: 'items', where: itemWhere, required: categoryId ? true : false },
        { model: Order, as: 'order', attributes: ['id', 'orderNo', 'totalAmount'] },
        { model: User, as: 'creator', attributes: ['id', 'realName', 'username'] },
      ],
    });

    res.json(paginatedResponse(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getLedgerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ledger = await Ledger.findByPk(id, {
      include: [
        {
          model: LedgerItem,
          as: 'items',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        },
        {
          model: Order,
          as: 'order',
          include: [{ model: OrderItem, as: 'items' }],
        },
        { model: User, as: 'creator', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'auditor', attributes: ['id', 'realName', 'username'] },
      ],
    });

    if (!ledger) {
      return next(new AppError('台账不存在', 404));
    }

    res.json(successResponse(ledger));
  } catch (error) {
    next(error);
  }
};

export const updateLedger = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { id } = req.params;
    const { notes, materialLossRate } = req.body;

    const ledger = await Ledger.findByPk(id, {
      transaction,
      include: [{ model: LedgerItem, as: 'items' }, { model: Order, as: 'order', include: [{ model: OrderItem, as: 'items' }] }],
    });

    if (!ledger) {
      await transaction.rollback();
      return next(new AppError('台账不存在', 404));
    }

    if (ledger.status !== LedgerStatus.DRAFT) {
      await transaction.rollback();
      return next(new AppError('只能编辑草稿状态的台账', 400));
    }

    const lossRate = materialLossRate !== undefined ? materialLossRate : ledger.materialLossRate;

    if (materialLossRate !== undefined && ledger.order) {
      const calculation = calculateProfit(ledger.order.items, lossRate);

      await ledger.update(
        {
          totalRevenue: calculation.totalRevenue,
          totalMaterialCost: calculation.totalMaterialCost,
          totalCustomFee: calculation.totalCustomFee,
          processingCost: calculation.processingCost,
          totalCost: calculation.totalCost,
          profit: calculation.profit,
          profitRate: calculation.profitRate,
          materialLossRate: lossRate,
          notes: notes !== undefined ? notes : ledger.notes,
        },
        { transaction }
      );

      for (const item of ledger.items) {
        const unitMaterialCost = Number(item.unitMaterialCost) * (1 + lossRate) / (1 + Number(ledger.materialLossRate));
        const unitTotalCost = unitMaterialCost + Number(item.unitCustomFee) + Number(item.unitProcessingCost);
        const unitProfit = Number(item.unitPrice) + Number(item.unitCustomFee) - unitTotalCost;

        await item.update(
          {
            unitMaterialCost,
            unitTotalCost,
            unitProfit,
            totalMaterialCost: unitMaterialCost * Number(item.quantity),
            totalCost: unitTotalCost * Number(item.quantity),
            totalProfit: unitProfit * Number(item.quantity),
          },
          { transaction }
        );
      }
    } else {
      await ledger.update(
        {
          notes: notes !== undefined ? notes : ledger.notes,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const result = await Ledger.findByPk(ledger.id, {
      include: [{ model: LedgerItem, as: 'items' }],
    });

    logger.info(`台账更新成功: ID ${id}, 操作人: ${req.user!.username}`);
    res.json(successResponse(result, '台账更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const auditLedger = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, auditNotes } = req.body;

    const ledger = await Ledger.findByPk(id, { transaction });
    if (!ledger) {
      await transaction.rollback();
      return next(new AppError('台账不存在', 404));
    }

    if (ledger.status !== LedgerStatus.DRAFT) {
      await transaction.rollback();
      return next(new AppError('只能审核草稿状态的台账', 400));
    }

    if (![LedgerStatus.FINALIZED, LedgerStatus.REJECTED].includes(status)) {
      await transaction.rollback();
      return next(new AppError('审核状态无效', 400));
    }

    const user = await User.findByPk(req.user!.userId, { transaction });
    await ledger.update(
      {
        status,
        auditNotes,
        auditedBy: req.user!.userId,
        auditedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`台账审核完成: ID ${id}, 状态: ${status}, 审核人: ${user?.realName || req.user!.username}`);
    res.json(successResponse(null, status === LedgerStatus.FINALIZED ? '台账已确认' : '台账已驳回'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteLedger = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const ledger = await Ledger.findByPk(id, { transaction });
    if (!ledger) {
      await transaction.rollback();
      return next(new AppError('台账不存在', 404));
    }

    if (ledger.status !== LedgerStatus.DRAFT && ledger.status !== LedgerStatus.REJECTED) {
      await transaction.rollback();
      return next(new AppError('只能删除草稿或已驳回状态的台账', 400));
    }

    await LedgerItem.destroy({ where: { ledgerId: id }, transaction });
    await ledger.destroy({ transaction });

    await transaction.commit();

    logger.info(`台账删除成功: ID ${id}, 操作人: ${req.user!.username}`);
    res.json(successResponse(null, '台账删除成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getLedgerStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, categoryId } = req.query;

    const where: any = { status: LedgerStatus.FINALIZED };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const itemWhere: any = {};
    if (categoryId) itemWhere.categoryId = categoryId;

    const ledgers = await Ledger.findAll({
      where,
      include: [{ model: LedgerItem, as: 'items', where: itemWhere, required: categoryId ? true : false }],
    });

    let totalRevenue = 0;
    let totalMaterialCost = 0;
    let totalCustomFee = 0;
    let totalProcessingCost = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalOrders = ledgers.length;

    for (const ledger of ledgers) {
      totalRevenue += Number(ledger.totalRevenue);
      totalMaterialCost += Number(ledger.totalMaterialCost);
      totalCustomFee += Number(ledger.totalCustomFee);
      totalProcessingCost += Number(ledger.processingCost);
      totalCost += Number(ledger.totalCost);
      totalProfit += Number(ledger.profit);
    }

    const overallProfitRate = totalRevenue > 0 ? totalProfit / totalRevenue : 0;

    const categoryStats = await LedgerItem.findAll({
      attributes: [
        'categoryId',
        'categoryName',
        [sequelize.fn('SUM', sequelize.col('totalRevenue')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('totalProfit')), 'totalProfit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'itemCount'],
      ],
      where: itemWhere,
      group: ['categoryId', 'categoryName'],
      order: [[sequelize.fn('SUM', sequelize.col('totalProfit')), 'DESC']],
    });

    const monthlyStats = await Ledger.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('totalRevenue')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('totalProfit')), 'totalProfit'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
      ],
      group: ['month'],
      order: [['month', 'DESC']],
      limit: 12,
    });

    const statusBreakdown = await Ledger.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalRevenue')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('totalProfit')), 'totalProfit'],
      ],
      group: ['status'],
    });

    res.json(successResponse({
      overview: {
        totalOrders,
        totalRevenue,
        totalMaterialCost,
        totalCustomFee,
        totalProcessingCost,
        totalCost,
        totalProfit,
        overallProfitRate,
      },
      categoryStats,
      monthlyStats: monthlyStats.reverse(),
      statusBreakdown,
    }));
  } catch (error) {
    next(error);
  }
};

export const exportLedgerReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, categoryId, format = 'json' } = req.query;

    const where: any = { status: LedgerStatus.FINALIZED };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const itemWhere: any = {};
    if (categoryId) itemWhere.categoryId = categoryId;

    const ledgers = await Ledger.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: LedgerItem, as: 'items', where: itemWhere, required: categoryId ? true : false },
        { model: Order, as: 'order', attributes: ['id', 'orderNo', 'companyName'] },
        { model: User, as: 'creator', attributes: ['id', 'realName'] },
      ],
    });

    const reportData = {
      generatedAt: new Date(),
      period: startDate && endDate ? `${startDate} 至 ${endDate}` : '全部',
      recordCount: ledgers.length,
      data: ledgers,
    };

    if (format === 'csv') {
      const csvRows = [
        ['台账ID', '订单号', '客户名称', '总收入', '材料成本', '定制费', '加工费', '总成本', '利润', '利润率', '创建人', '创建时间'].join(','),
      ];

      for (const ledger of ledgers) {
        csvRows.push([
          ledger.id,
          ledger.orderNo,
          ledger.companyName,
          ledger.totalRevenue,
          ledger.totalMaterialCost,
          ledger.totalCustomFee,
          ledger.processingCost,
          ledger.totalCost,
          ledger.profit,
          (ledger.profitRate * 100).toFixed(2) + '%',
          ledger.creator?.realName || '',
          ledger.createdAt.toISOString(),
        ].join(','));
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=ledger-report-${Date.now()}.csv`);
      res.send('\uFEFF' + csvRows.join('\n'));
    } else {
      res.json(successResponse(reportData, '报表生成成功'));
    }
  } catch (error) {
    next(error);
  }
};
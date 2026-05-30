import { Request, Response, NextFunction } from 'express';
import { Op, fn, col, cast } from 'sequelize';
import Commission, { CommissionStatus } from '../models/Commission';
import Order from '../models/Order';
import User from '../models/User';
import Category from '../models/Category';
import { ApiResponse } from '../utils/response';
import { AppError, NotFoundError } from '../exceptions/AppError';
import { UserRole } from '../models';
import dayjs from 'dayjs';
import sequelize from '../config/database';

export const getCommissionList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, settlementMonth, sellerId } = req.query;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权访问', 403);
    }
    
    const whereCondition: any = {};
    
    if (status) {
      whereCondition.status = status;
    }
    if (settlementMonth) {
      whereCondition.settlementMonth = settlementMonth;
    }
    if (sellerId) {
      whereCondition.sellerId = sellerId;
    }
    
    const { count, rows } = await Commission.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['id', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo', 'finalPrice'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'realName'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
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

export const getCommissionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权访问', 403);
    }
    
    const commission = await Commission.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo', 'finalPrice'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'realName'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    if (!commission) {
      throw new NotFoundError('佣金记录不存在');
    }
    
    ApiResponse.success(res, commission);
  } catch (error) {
    next(error);
  }
};

export const getCommissionStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startMonth, endMonth } = req.query;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权访问', 403);
    }
    
    const whereCondition: any = {
      status: CommissionStatus.SETTLED,
    };
    
    if (startMonth && endMonth) {
      whereCondition.settlementMonth = {
        [Op.between]: [startMonth, endMonth],
      };
    }
    
    const statistics = await Commission.findAll({
      where: whereCondition,
      attributes: [
        'settlementMonth',
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', cast(col('transaction_amount'), 'DECIMAL(12,2)')), 'totalTransactionAmount'],
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'totalCommissionAmount'],
      ],
      group: ['settlementMonth'],
      order: [['settlementMonth', 'DESC']],
    });
    
    const totalStatistics = await Commission.findOne({
      where: whereCondition,
      attributes: [
        [fn('COUNT', col('id')), 'totalOrderCount'],
        [fn('SUM', cast(col('transaction_amount'), 'DECIMAL(12,2)')), 'totalTransactionAmount'],
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'totalCommissionAmount'],
      ],
      raw: true,
    });
    
    ApiResponse.success(res, {
      monthlyData: statistics,
      total: totalStatistics,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerCommissionSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.userId;
    
    const pendingCommissions = await Commission.findAll({
      where: {
        sellerId,
        status: CommissionStatus.PENDING,
      },
      attributes: [
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'pendingAmount'],
      ],
      raw: true,
    });
    
    const settledCommissions = await Commission.findAll({
      where: {
        sellerId,
        status: CommissionStatus.SETTLED,
      },
      attributes: [
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'settledAmount'],
      ],
      raw: true,
    });
    
    const monthlySummary = await Commission.findAll({
      where: { sellerId },
      attributes: [
        'settlementMonth',
        'status',
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', cast(col('transaction_amount'), 'DECIMAL(12,2)')), 'transactionAmount'],
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'commissionAmount'],
      ],
      group: ['settlementMonth', 'status'],
      order: [['settlementMonth', 'DESC']],
    });
    
    ApiResponse.success(res, {
      pendingAmount: pendingCommissions[0]?.pendingAmount || 0,
      settledAmount: settledCommissions[0]?.settledAmount || 0,
      monthlySummary,
    });
  } catch (error) {
    next(error);
  }
};

export const settleCommission = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权结算佣金', 403);
    }
    
    const commission = await Commission.findByPk(id, { transaction: t });
    if (!commission) {
      throw new NotFoundError('佣金记录不存在');
    }
    
    if (commission.status === CommissionStatus.SETTLED) {
      throw new AppError('该佣金已结算', 400);
    }
    
    await commission.update(
      { status: CommissionStatus.SETTLED, settlementTime: new Date() },
      { transaction: t }
    );
    
    await t.commit();
    
    ApiResponse.success(res, commission, '佣金结算成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const batchSettleCommissions = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { ids, settlementMonth } = req.body;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权结算佣金', 403);
    }
    
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('佣金ID列表不能为空', 400);
    }
    
    const commissions = await Commission.findAll({
      where: { id: ids, status: CommissionStatus.PENDING },
      transaction: t,
    });
    
    if (commissions.length === 0) {
      throw new NotFoundError('未找到有效的待结算佣金记录');
    }
    
    await Commission.update(
      { status: CommissionStatus.SETTLED, settlementTime: new Date(), settlementMonth },
      { where: { id: ids }, transaction: t }
    );
    
    const totalSettled = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    
    await t.commit();
    
    ApiResponse.success(res, {
      settledCount: commissions.length,
      totalSettled,
    }, '批量结算成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getCommissionByMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权访问', 403);
    }
    
    const { count, rows } = await Commission.findAndCountAll({
      where: { settlementMonth: month },
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['id', 'DESC']],
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'realName'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    const monthlyTotal = await Commission.findOne({
      where: { settlementMonth: month },
      attributes: [
        [fn('SUM', cast(col('transaction_amount'), 'DECIMAL(12,2)')), 'totalTransactionAmount'],
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'totalCommissionAmount'],
        [fn('COUNT', col('id')), 'orderCount'],
      ],
      raw: true,
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      monthlyTotal,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryCommissionReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startMonth, endMonth } = req.query;
    
    if (req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权访问', 403);
    }
    
    const whereCondition: any = { status: CommissionStatus.SETTLED };
    
    if (startMonth && endMonth) {
      whereCondition.settlementMonth = { [Op.between]: [startMonth, endMonth] };
    }
    
    const categoryReport = await Commission.findAll({
      where: whereCondition,
      attributes: [
        'categoryId',
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', cast(col('transaction_amount'), 'DECIMAL(12,2)')), 'totalTransactionAmount'],
        [fn('SUM', cast(col('commission_amount'), 'DECIMAL(12,2)')), 'totalCommissionAmount'],
      ],
      group: ['categoryId'],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });
    
    ApiResponse.success(res, categoryReport);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Settlement, AuntProfile, Order } from '../models';
import { SettlementStatus, UserRole, AuntIncomeSummary } from '../types';
import { ResponseUtil } from '../utils/response';
import { OperationLogger } from '../utils/operationLogger';
import { NotFoundException, ForbiddenException, BadRequestException } from '../exceptions/HttpException';
import { Op, fn, col } from 'sequelize';
import { sequelize } from '../database';

export const settleSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '结算ID不能为空',
    }),
  }),
});

export const getSettlementByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '结算ID不能为空',
    }),
  }),
});

export const getSettlementStatisticsSchema = Joi.object({
  query: Joi.object({
    auntId: Joi.number().integer().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),
});

export const getSettlementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const settlement = await Settlement.findByPk(id, {
      include: [
        { model: AuntProfile, as: 'aunt' },
        { model: Order, as: 'order' },
      ],
    });

    if (!settlement) {
      throw new NotFoundException('结算记录不存在');
    }

    if (req.user!.role !== UserRole.ADMIN) {
      const aunt = await AuntProfile.findOne({ where: { userId: req.user!.userId } });
      if (!aunt || settlement.auntId !== aunt.id) {
        throw new ForbiddenException('无权查看他人结算记录');
      }
    }

    res.json(ResponseUtil.success(settlement, '获取结算记录成功'));
  } catch (error) {
    next(error);
  }
};

export const getMySettlements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user!.userId;

    const aunt = await AuntProfile.findOne({ where: { userId } });
    if (!aunt) {
      return res.json(ResponseUtil.success({
        list: [],
        total: 0,
        page: Number(page),
        pageSize: Number(pageSize),
      }, '获取结算列表成功'));
    }

    const whereCondition: any = { auntId: aunt.id };
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Order, as: 'order' },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取结算列表成功'));
  } catch (error) {
    next(error);
  }
};

export const getSettlementList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, auntId, startDate, endDate } = req.query;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    if (auntId) {
      whereCondition.auntId = auntId;
    }
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where: whereCondition,
      include: [
        { model: AuntProfile, as: 'aunt' },
        { model: Order, as: 'order' },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取结算列表成功'));
  } catch (error) {
    next(error);
  }
};

export const settle = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const settlement = await Settlement.findByPk(id, { transaction });
    if (!settlement) {
      throw new NotFoundException('结算记录不存在');
    }

    if (settlement.status === SettlementStatus.SETTLED) {
      throw new BadRequestException('该记录已结算');
    }

    await settlement.update(
      {
        status: SettlementStatus.SETTLED,
        settledAt: new Date(),
      },
      { transaction }
    );

    await OperationLogger.logSettlement('settle', req, settlement.id, '结算单已完成');

    await transaction.commit();

    res.json(ResponseUtil.success(settlement, '结算成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getSettlementStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { auntId, startDate, endDate } = req.query;

    const whereCondition: any = {};
    if (auntId) {
      whereCondition.auntId = auntId;
    }
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const statistics = await Settlement.findAll({
      where: whereCondition,
      attributes: [
        [fn('SUM', col('orderAmount')), 'totalOrderAmount'],
        [fn('SUM', col('commissionAmount')), 'totalCommissionAmount'],
        [fn('SUM', col('auntAmount')), 'totalAuntAmount'],
        [fn('COUNT', col('id')), 'totalCount'],
      ],
      raw: true,
    });

    const pendingCount = await Settlement.count({
      where: { ...whereCondition, status: SettlementStatus.PENDING },
    });

    const settledCount = await Settlement.count({
      where: { ...whereCondition, status: SettlementStatus.SETTLED },
    });

    res.json(ResponseUtil.success({
      ...statistics[0],
      pendingCount,
      settledCount,
    }, '获取统计数据成功'));
  } catch (error) {
    next(error);
  }
};

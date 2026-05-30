import { Request, Response, NextFunction } from 'express';
import { Transaction, Op, fn, col } from 'sequelize';
import LossStatistic from '../models/LossStatistic';
import CultivationBatch from '../models/CultivationBatch';
import { ResponseUtil } from '../utils/response';
import sequelize from '../config/database';

export const getLossStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      batchId, 
      categoryId, 
      lossType, 
      startDate, 
      endDate 
    } = req.query;

    const where: any = {};
    
    if (batchId) {
      where.batchId = Number(batchId);
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (lossType) {
      where.lossType = lossType;
    }
    if (startDate || endDate) {
      where.lossDate = {};
      if (startDate) {
        where.lossDate[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.lossDate[Op.lte] = new Date(endDate as string);
      }
    }

    const { count, rows } = await LossStatistic.findAndCountAll({
      where,
      include: [
        { 
          model: CultivationBatch, 
          as: 'batch',
          attributes: ['batchCode', 'quantity', 'status']
        }
      ],
      order: [['lossDate', 'DESC'], ['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    }));
  } catch (error) {
    next(error);
  }
};

export const getLossSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    const where: any = {};
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (startDate || endDate) {
      where.lossDate = {};
      if (startDate) {
        where.lossDate[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.lossDate[Op.lte] = new Date(endDate as string);
      }
    }

    const lossByType = await LossStatistic.findAll({
      where,
      attributes: [
        'lossType',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('lossQuantity')), 'totalQuantity']
      ],
      group: ['lossType']
    });

    const totalLosses = await LossStatistic.count({ where });
    const totalLossQuantity = await LossStatistic.sum('lossQuantity', { where });

    res.json(ResponseUtil.success({
      totalLosses,
      totalLossQuantity: totalLossQuantity || 0,
      lossByType
    }));
  } catch (error) {
    next(error);
  }
};

export const getLossById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const loss = await LossStatistic.findByPk(id, {
      include: [
        { 
          model: CultivationBatch, 
          as: 'batch',
          attributes: ['batchCode', 'quantity', 'status']
        }
      ]
    });

    if (!loss) {
      return res.status(404).json(ResponseUtil.notFound('损耗记录不存在'));
    }

    res.json(ResponseUtil.success(loss));
  } catch (error) {
    next(error);
  }
};

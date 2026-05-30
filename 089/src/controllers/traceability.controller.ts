import { Request, Response, NextFunction } from 'express';
import { Transaction, Op, fn, col } from 'sequelize';
import TraceabilityRecord from '../models/TraceabilityRecord';
import CultivationBatch from '../models/CultivationBatch';
import MotherStrain from '../models/MotherStrain';
import StrainCategory from '../models/StrainCategory';
import User from '../models/User';
import { ResponseUtil } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/error';
import { BatchStatus, OperationType, TraceabilityFilterParams } from '../types';
import sequelize from '../config/database';
import OperationLogService from '../services/operationLog.service';

export const generateTraceabilityReport = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { categoryId, startDate, endDate, remark } = req.body;

    const category = await StrainCategory.findByPk(categoryId, { transaction: t });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const batches = await CultivationBatch.findAll({
      where: {
        categoryId,
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      transaction: t
    });

    const totalBatches = batches.length;
    const totalQuantity = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const scrappedQuantity = batches
      .filter(b => b.status === BatchStatus.SCRAPPED)
      .reduce((sum, b) => sum + (b.quantity || 0), 0);
    const qcPassedCount = batches.filter(b => b.status === BatchStatus.QC_PASSED).length;
    const qcFailedCount = batches.filter(b => b.status === BatchStatus.QC_FAILED).length;
    const qcPassRate = totalBatches > 0 ? ((qcPassedCount / totalBatches) * 100).toFixed(2) : '0.00';

    const recordCode = `TRACE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const record = await TraceabilityRecord.create({
      recordCode,
      categoryId,
      periodStart: new Date(startDate),
      periodEnd: new Date(endDate),
      totalBatches,
      totalQuantity,
      scrappedQuantity,
      qcPassedCount,
      qcFailedCount,
      qcPassRate,
      totalCost: 0,
      unitCost: 0,
      remark,
      generatedBy: req.user?.userId
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'traceability',
      OperationType.GENERATE_REPORT,
      record.id,
      recordCode,
      null,
      record.toJSON(),
      remark || '生成溯源台账报告'
    );

    await t.commit();

    res.json(ResponseUtil.success({
      id: record.id,
      recordCode: record.recordCode,
      totalBatches,
      totalQuantity,
      qcPassRate: `${qcPassRate}%`,
      scrappedQuantity
    }, '溯源台账生成成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getTraceabilityRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      categoryId, 
      startDate, 
      endDate 
    } = req.query as TraceabilityFilterParams;

    const where: any = {};
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) {
        where.periodStart[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.periodStart[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await TraceabilityRecord.findAndCountAll({
      where,
      include: [
        { model: StrainCategory, as: 'category', attributes: ['id', 'categoryName', 'categoryCode'] },
        { model: User, as: 'generatedByUser', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['createdAt', 'DESC']],
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

export const getTraceabilityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const record = await TraceabilityRecord.findByPk(id, {
      include: [
        { model: StrainCategory, as: 'category' },
        { model: User, as: 'generatedByUser', attributes: ['id', 'username', 'realName'] }
      ]
    });

    if (!record) {
      throw new NotFoundError('溯源台账不存在');
    }

    res.json(ResponseUtil.success(record));
  } catch (error) {
    next(error);
  }
};

export const getBatchTraceability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchCode } = req.params;
    
    const batch = await CultivationBatch.findOne({
      where: { batchCode },
      include: [
        { 
          model: MotherStrain, 
          as: 'motherStrain',
          include: [{ model: StrainCategory, as: 'category' }]
        },
        { model: User, as: 'cultivator', attributes: ['id', 'username', 'realName', 'email', 'phone'] },
        { model: User, as: 'qcInspector', attributes: ['id', 'username', 'realName', 'email', 'phone'] }
      ]
    });

    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    const traceabilityChain = {
      batch: {
        batchCode: batch.batchCode,
        quantity: batch.quantity,
        status: batch.status,
        cultureMedium: batch.cultureMedium,
        cultivationTemperature: batch.cultivationTemperature,
        cultivationHumidity: batch.cultivationHumidity,
        createdAt: batch.createdAt,
        cultivator: batch.cultivator,
        qcInspector: batch.qcInspector,
        qcRemark: batch.qcRemark,
        qcDate: batch.qcDate
      },
      motherStrain: batch.motherStrain ? {
        strainCode: batch.motherStrain.strainCode,
        strainName: batch.motherStrain.strainName,
        generation: batch.motherStrain.generation,
        mediumFormula: batch.motherStrain.mediumFormula,
        status: batch.motherStrain.status
      } : null,
      category: batch.motherStrain?.category ? {
        categoryName: batch.motherStrain.category.categoryName,
        categoryCode: batch.motherStrain.category.categoryCode,
        categoryType: batch.motherStrain.category.categoryType
      } : null
    };

    res.json(ResponseUtil.success(traceabilityChain));
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    const where: any = {};
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    const batchStats = await CultivationBatch.findAll({
      where,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('quantity')), 'totalQuantity']
      ],
      group: ['status']
    });

    const categoryStats = await StrainCategory.findAll({
      where: { isActive: true },
      attributes: ['id', 'categoryName', 'categoryCode'],
      include: [{
        model: CultivationBatch,
        as: 'batches',
        attributes: [[fn('COUNT', col('batches.id')), 'batchCount']]
      }]
    });

    res.json(ResponseUtil.success({
      batchStats,
      categoryStats
    }));
  } catch (error) {
    next(error);
  }
};

export const getCategoryReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

    if (!categoryId) {
      throw new BadRequestError('分类ID不能为空');
    }

    const category = await StrainCategory.findByPk(Number(categoryId));
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const where: any = { categoryId: Number(categoryId) };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    const batches = await CultivationBatch.findAll({
      where,
      include: [
        { model: MotherStrain, as: 'motherStrain' },
        { model: User, as: 'cultivator', attributes: ['id', 'username', 'realName'] }
      ]
    });

    const stats = {
      category: {
        id: category.id,
        categoryName: category.categoryName,
        categoryCode: category.categoryCode
      },
      totalBatches: batches.length,
      totalQuantity: batches.reduce((sum, b) => sum + (b.quantity || 0), 0),
      statusBreakdown: batches.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      batches: batches.map(b => ({
        batchCode: b.batchCode,
        quantity: b.quantity,
        status: b.status,
        motherStrain: b.motherStrain?.strainCode,
        cultivator: b.cultivator?.realName,
        createdAt: b.createdAt
      }))
    };

    res.json(ResponseUtil.success(stats));
  } catch (error) {
    next(error);
  }
};

export const deleteTraceabilityRecord = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const record = await TraceabilityRecord.findByPk(id, { transaction: t });
    if (!record) {
      throw new NotFoundError('溯源台账不存在');
    }

    const oldValue = record.toJSON();

    await record.destroy({ transaction: t });

    await OperationLogService.createLog(
      req,
      'traceability',
      OperationType.DELETE,
      record.id,
      record.recordCode,
      oldValue,
      null,
      '删除溯源台账记录'
    );

    await t.commit();

    res.json(ResponseUtil.success(null, '溯源台账删除成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

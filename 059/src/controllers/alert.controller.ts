import { Request, Response } from 'express';
import SafetyStockAlert from '../models/SafetyStockAlert.model';
import SparePart from '../models/SparePart.model';
import SparePartCategory from '../models/SparePartCategory.model';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { OperationType } from '../types';
import { createOperationLog } from '../services/operationLog.service';
import { Op, fn, col, Transaction } from 'sequelize';
import sequelize from '../config/database';

export const getAlertList = async (req: Request, res: Response) => {
  try {
    const { isHandled, workshop, categoryId, page = 1, pageSize = 10 } = req.query;
    const where: any = {};

    if (isHandled !== undefined) {
      where.isHandled = isHandled === 'true';
    }

    const sparePartWhere: any = {};
    if (workshop) {
      sparePartWhere.workshop = workshop;
    }
    if (categoryId) {
      sparePartWhere.categoryId = categoryId;
    }

    const { count, rows } = await SafetyStockAlert.findAndCountAll({
      where,
      include: [
        {
          model: SparePart,
          as: 'sparePart',
          where: sparePartWhere,
          include: [{ model: SparePartCategory, as: 'category', attributes: ['id', 'name', 'code'] }]
        }
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    return res.json(successResponse({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    return res.status(500).json(errorResponse('获取预警列表失败'));
  }
};

export const getAlertDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await SafetyStockAlert.findByPk(id, {
      include: [
        {
          model: SparePart,
          as: 'sparePart',
          include: [{ model: SparePartCategory, as: 'category', attributes: ['name'] }]
        }
      ]
    });

    if (!alert) {
      throw new AppError('预警记录不存在', 404);
    }

    return res.json(successResponse(alert));
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('获取预警详情失败'));
  }
};

export const handleAlert = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { handleRemark } = req.body;

    const alert = await SafetyStockAlert.findByPk(id, { transaction });
    if (!alert) {
      throw new AppError('预警记录不存在', 404);
    }

    if (alert.isHandled) {
      throw new AppError('该预警已被处理', 400);
    }

    await alert.update({
      isHandled: true,
      handledBy: req.user?.userId,
      handledAt: new Date(),
      handleRemark
    }, { transaction });

    await transaction.commit();

    createOperationLog(req, 'alert', OperationType.UPDATE, `处理预警: ${id}`);
    return res.json(successResponse(alert, '预警处理成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('处理预警失败'));
  }
};

export const batchHandleAlerts = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { ids, handleRemark } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('请选择要处理的预警记录', 400);
    }

    const alerts = await SafetyStockAlert.findAll({
      where: { id: { [Op.in]: ids }, isHandled: false },
      transaction
    });

    if (alerts.length === 0) {
      throw new AppError('没有可处理的预警记录', 400);
    }

    await SafetyStockAlert.update(
      {
        isHandled: true,
        handledBy: req.user?.userId,
        handledAt: new Date(),
        handleRemark
      },
      { where: { id: { [Op.in]: ids } }, transaction }
    );

    await transaction.commit();

    createOperationLog(req, 'alert', OperationType.UPDATE, `批量处理预警: ${ids.join(',')}`);
    return res.json(successResponse({ handledCount: alerts.length }, `成功处理 ${alerts.length} 条预警`));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('批量处理预警失败'));
  }
};

export const scanAndGenerateAlerts = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const lowStockParts = await SparePart.findAll({
      where: sequelize.literal('currentStock < safetyStock AND safetyStock > 0 AND isEnabled = true'),
      transaction
    });

    let newAlertCount = 0;

    for (const part of lowStockParts) {
      const existingAlert = await SafetyStockAlert.findOne({
        where: { sparePartId: part.id, isHandled: false },
        transaction
      });

      if (!existingAlert) {
        const shortage = Number(part.safetyStock) - Number(part.currentStock);
        await SafetyStockAlert.create({
          sparePartId: part.id,
          currentStock: Number(part.currentStock),
          safetyStock: Number(part.safetyStock),
          shortage
        }, { transaction });
        newAlertCount++;
      } else {
        const shortage = Number(part.safetyStock) - Number(part.currentStock);
        await existingAlert.update({
          currentStock: Number(part.currentStock),
          safetyStock: Number(part.safetyStock),
          shortage
        }, { transaction });
      }
    }

    await transaction.commit();

    createOperationLog(req, 'alert', OperationType.QUERY, `扫描安全库存预警: 新增 ${newAlertCount} 条`);
    return res.json(successResponse({ newAlertCount, scannedCount: lowStockParts.length }, '安全库存扫描完成'));
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json(errorResponse('扫描安全库存失败'));
  }
};

export const getAlertStatistics = async (req: Request, res: Response) => {
  try {
    const totalAlerts = await SafetyStockAlert.count();
    const unhandledAlerts = await SafetyStockAlert.count({ where: { isHandled: false } });
    const handledAlerts = await SafetyStockAlert.count({ where: { isHandled: true } });

    const totalShortage = await SafetyStockAlert.sum('shortage', { where: { isHandled: false } });

    const workshopStats = await SparePart.findAll({
      attributes: ['workshop', [fn('COUNT', col('alerts.id')), 'count'], [fn('SUM', col('alerts.shortage')), 'totalShortage']],
      include: [{
        model: SafetyStockAlert,
        as: 'alerts',
        attributes: [],
        where: { isHandled: false },
        required: false
      }],
      group: ['workshop'],
      where: { workshop: { [Op.ne]: null } },
      order: [[col('count'), 'DESC']],
      raw: true
    });

    const categoryStats = await SparePartCategory.findAll({
      attributes: ['id', 'name', 'code', [fn('COUNT', col('spareParts.alerts.id')), 'count']],
      include: [{
        model: SparePart,
        as: 'spareParts',
        attributes: [],
        include: [{
          model: SafetyStockAlert,
          as: 'alerts',
          attributes: [],
          where: { isHandled: false },
          required: false
        }]
      }],
      group: ['SparePartCategory.id'],
      order: [[col('count'), 'DESC']],
      raw: true
    });

    return res.json(successResponse({
      total: totalAlerts,
      unhandled: unhandledAlerts,
      handled: handledAlerts,
      totalShortage: totalShortage || 0,
      byWorkshop: workshopStats,
      byCategory: categoryStats
    }));
  } catch (error) {
    return res.status(500).json(errorResponse('获取预警统计失败'));
  }
};

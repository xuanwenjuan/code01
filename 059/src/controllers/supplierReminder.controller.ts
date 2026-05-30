import { Request, Response } from 'express';
import SupplierReminder from '../models/SupplierReminder.model';
import Supplier from '../models/Supplier.model';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { ReminderLevel, OperationType } from '../types';
import { createOperationLog } from '../services/operationLog.service';
import { Op, Transaction, fn, col } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';

export const scanAndCreateExpiryReminders = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const today = moment().startOf('day');
    const warningDays = [30, 15, 7, 3, 1];

    const activeSuppliers = await Supplier.findAll({
      where: {
        status: 'active',
        cooperationEndDate: { [Op.not]: null }
      },
      transaction
    });

    let createdCount = 0;

    for (const supplier of activeSuppliers) {
      const daysUntilExpiry = moment(supplier.cooperationEndDate).diff(today, 'days');

      if (daysUntilExpiry <= 0) {
        await supplier.update({ status: 'expired' }, { transaction });
        continue;
      }

      if (warningDays.includes(daysUntilExpiry)) {
        const existingReminder = await SupplierReminder.findOne({
          where: {
            supplierId: supplier.id,
            reminderType: 'expiration',
            daysUntilExpiry,
            reminderDate: today.toDate()
          },
          transaction
        });

        if (!existingReminder) {
          let reminderLevel = ReminderLevel.NORMAL;
          if (daysUntilExpiry <= 1) reminderLevel = ReminderLevel.URGENT;
          else if (daysUntilExpiry <= 3) reminderLevel = ReminderLevel.HIGH;
          else if (daysUntilExpiry <= 7) reminderLevel = ReminderLevel.HIGH;
          else if (daysUntilExpiry <= 15) reminderLevel = ReminderLevel.NORMAL;

          await SupplierReminder.create({
            supplierId: supplier.id,
            reminderType: 'expiration',
            reminderLevel,
            reminderDate: today.toDate(),
            daysUntilExpiry,
            isRead: false,
            isHandled: false
          }, { transaction });

          createdCount++;
        }
      }
    }

    await transaction.commit();

    createOperationLog(req, 'supplierReminder', OperationType.CREATE, `扫描供应商到期提醒: 新增 ${createdCount} 条`);

    return res.json(successResponse({
      scannedCount: activeSuppliers.length,
      createdCount,
      scanDate: today.format('YYYY-MM-DD')
    }, '扫描完成'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getReminderList = async (req: Request, res: Response) => {
  const { isRead, isHandled, reminderLevel, page = 1, pageSize = 10 } = req.query;
  const where: any = {};

  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }
  if (isHandled !== undefined) {
    where.isHandled = isHandled === 'true';
  }
  if (reminderLevel) {
    where.reminderLevel = reminderLevel;
  }

  const { count, rows } = await SupplierReminder.findAndCountAll({
    where,
    include: [{
      model: Supplier,
      as: 'supplier',
      attributes: ['id', 'name', 'code', 'contactPerson', 'phone', 'cooperationEndDate']
    }],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize),
    order: [
      ['reminderLevel', 'DESC'],
      ['createdAt', 'DESC']
    ]
  });

  return res.json(successResponse({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const getReminderDetail = async (req: Request, res: Response) => {
  const { id } = req.params;

  const reminder = await SupplierReminder.findByPk(id, {
    include: [{
      model: Supplier,
      as: 'supplier'
    }]
  });

  if (!reminder) {
    throw new AppError('提醒记录不存在', 404);
  }

  return res.json(successResponse(reminder));
};

export const markAsRead = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('请选择要标记的提醒记录', 400);
    }

    await SupplierReminder.update(
      { isRead: true },
      { where: { id: { [Op.in]: ids } }, transaction }
    );

    await transaction.commit();

    createOperationLog(req, 'supplierReminder', OperationType.UPDATE, `标记提醒已读: ${ids.join(',')}`);

    return res.json(successResponse({ markedCount: ids.length }, '标记成功'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const handleReminder = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { handleRemark } = req.body;

    const reminder = await SupplierReminder.findByPk(id, { transaction });
    if (!reminder) {
      throw new AppError('提醒记录不存在', 404);
    }

    await reminder.update({
      isHandled: true,
      handledBy: req.user?.userId,
      handledAt: new Date(),
      handleRemark
    }, { transaction });

    await transaction.commit();

    createOperationLog(req, 'supplierReminder', OperationType.UPDATE, `处理提醒: ${id}`);

    return res.json(successResponse(reminder, '处理成功'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getReminderStatistics = async (req: Request, res: Response) => {
  const totalCount = await SupplierReminder.count();
  const unreadCount = await SupplierReminder.count({ where: { isRead: false } });
  const unhandledCount = await SupplierReminder.count({ where: { isHandled: false } });

  const levelStats = await SupplierReminder.findAll({
    attributes: ['reminderLevel', [fn('COUNT', col('id')), 'count']],
    where: { isHandled: false },
    group: ['reminderLevel'],
    raw: true
  });

  const today = moment().startOf('day');
  const todayCount = await SupplierReminder.count({
    where: {
      reminderDate: today.toDate(),
      isHandled: false
    }
  });

  return res.json(successResponse({
    total: totalCount,
    unread: unreadCount,
    unhandled: unhandledCount,
    todayNew: todayCount,
    byLevel: levelStats
  }));
};

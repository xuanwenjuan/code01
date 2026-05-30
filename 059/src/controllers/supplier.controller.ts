import { Request, Response } from 'express';
import Supplier from '../models/Supplier.model';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { CooperationStatus, OperationType } from '../types';
import { createOperationLog } from '../services/operationLog.service';
import { Op, Transaction, fn, col } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';

export const createSupplier = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { name, code, contactPerson, phone, email, address, supplyCategories, cooperationStartDate, cooperationEndDate, qualification, creditRating, remark } = req.body;

    const exists = await Supplier.findOne({ where: { code }, transaction });
    if (exists) {
      throw new AppError('供应商编码已存在', 400);
    }

    let status = CooperationStatus.PENDING;
    if (cooperationStartDate && cooperationEndDate) {
      const now = moment();
      const endDate = moment(cooperationEndDate);
      const startDate = moment(cooperationStartDate);
      
      if (now.isBefore(startDate)) {
        status = CooperationStatus.PENDING;
      } else if (now.isBetween(startDate, endDate, null, '[]')) {
        status = CooperationStatus.ACTIVE;
      } else {
        status = CooperationStatus.EXPIRED;
      }
    }

    const supplier = await Supplier.create({
      name,
      code,
      contactPerson,
      phone,
      email,
      address,
      supplyCategories: supplyCategories ? JSON.stringify(supplyCategories) : null,
      cooperationStartDate,
      cooperationEndDate,
      status,
      qualification,
      creditRating,
      remark
    }, { transaction });

    await transaction.commit();

    createOperationLog(req, 'supplier', OperationType.CREATE, `创建供应商: ${name}`);
    return res.json(successResponse(supplier, '供应商创建成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('创建供应商失败'));
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, code, contactPerson, phone, email, address, supplyCategories, cooperationStartDate, cooperationEndDate, status, qualification, creditRating, remark } = req.body;

    const supplier = await Supplier.findByPk(id, { transaction });
    if (!supplier) {
      throw new AppError('供应商不存在', 404);
    }

    if (code && code !== supplier.code) {
      const exists = await Supplier.findOne({ where: { code }, transaction });
      if (exists) {
        throw new AppError('供应商编码已存在', 400);
      }
    }

    let finalStatus = status;
    if (cooperationStartDate && cooperationEndDate && !status) {
      const now = moment();
      const endDate = moment(cooperationEndDate);
      const startDate = moment(cooperationStartDate);
      
      if (now.isBefore(startDate)) {
        finalStatus = CooperationStatus.PENDING;
      } else if (now.isBetween(startDate, endDate, null, '[]')) {
        finalStatus = CooperationStatus.ACTIVE;
      } else {
        finalStatus = CooperationStatus.EXPIRED;
      }
    }

    await supplier.update({
      name,
      code,
      contactPerson,
      phone,
      email,
      address,
      supplyCategories: supplyCategories ? JSON.stringify(supplyCategories) : null,
      cooperationStartDate,
      cooperationEndDate,
      status: finalStatus,
      qualification,
      creditRating,
      remark
    }, { transaction });

    await transaction.commit();

    createOperationLog(req, 'supplier', OperationType.UPDATE, `更新供应商: ${name}`);
    return res.json(successResponse(supplier, '供应商更新成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('更新供应商失败'));
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id, { transaction });
    if (!supplier) {
      throw new AppError('供应商不存在', 404);
    }

    await supplier.destroy({ transaction });

    await transaction.commit();

    createOperationLog(req, 'supplier', OperationType.DELETE, `删除供应商: ${supplier.name}`);
    return res.json(successResponse(null, '供应商删除成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('删除供应商失败'));
  }
};

export const getSupplierList = async (req: Request, res: Response) => {
  try {
    const { keyword, status, page = 1, pageSize = 10 } = req.query;
    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
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
    return res.status(500).json(errorResponse('获取供应商列表失败'));
  }
};

export const getSupplierDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      throw new AppError('供应商不存在', 404);
    }

    return res.json(successResponse(supplier));
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('获取供应商详情失败'));
  }
};

export const getExpiringSuppliers = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const targetDate = moment().add(Number(days), 'days').toDate();

    const suppliers = await Supplier.findAll({
      where: {
        cooperationEndDate: {
          [Op.lte]: targetDate,
          [Op.gte]: moment().toDate()
        },
        status: CooperationStatus.ACTIVE
      },
      order: [['cooperationEndDate', 'ASC']]
    });

    return res.json(successResponse(suppliers));
  } catch (error) {
    return res.status(500).json(errorResponse('获取到期预警失败'));
  }
};

export const updateExpiredSupplierStatus = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const now = moment().toDate();
    
    const [affectedCount] = await Supplier.update(
      { status: CooperationStatus.EXPIRED },
      {
        where: {
          cooperationEndDate: { [Op.lt]: now },
          status: { [Op.ne]: CooperationStatus.EXPIRED }
        },
        transaction
      }
    );

    await transaction.commit();

    createOperationLog(req, 'supplier', OperationType.UPDATE, `更新到期供应商状态: ${affectedCount}个`);
    return res.json(successResponse({ updatedCount: affectedCount }, `已更新 ${affectedCount} 个供应商状态为已过期`));
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json(errorResponse('更新状态失败'));
  }
};

export const getSupplierStatistics = async (req: Request, res: Response) => {
  try {
    const total = await Supplier.count();
    const activeCount = await Supplier.count({ where: { status: CooperationStatus.ACTIVE } });
    const expiredCount = await Supplier.count({ where: { status: CooperationStatus.EXPIRED } });
    const pendingCount = await Supplier.count({ where: { status: CooperationStatus.PENDING } });
    const suspendedCount = await Supplier.count({ where: { status: CooperationStatus.SUSPENDED } });

    const today = moment();
    const expiringIn30Days = await Supplier.count({
      where: {
        cooperationEndDate: {
          [Op.lte]: today.clone().add(30, 'days').toDate(),
          [Op.gte]: today.toDate()
        },
        status: CooperationStatus.ACTIVE
      }
    });

    return res.json(successResponse({
      total,
      byStatus: {
        active: activeCount,
        expired: expiredCount,
        pending: pendingCount,
        suspended: suspendedCount
      },
      expiringIn30Days
    }));
  } catch (error) {
    return res.status(500).json(errorResponse('获取统计信息失败'));
  }
};

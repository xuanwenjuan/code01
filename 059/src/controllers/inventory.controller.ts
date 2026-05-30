import { Request, Response } from 'express';
import InventoryRecord from '../models/InventoryRecord.model';
import SparePart from '../models/SparePart.model';
import Supplier from '../models/Supplier.model';
import SparePartCategory from '../models/SparePartCategory.model';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { InventoryType, OperationType } from '../types';
import { createOperationLog } from '../services/operationLog.service';
import { Op, Transaction, fn, col } from 'sequelize';
import sequelize from '../config/database';
import SafetyStockAlert from '../models/SafetyStockAlert.model';
import { v4 as uuidv4 } from 'uuid';

export enum InventoryAdjustType {
  INCREASE = 'increase',
  DECREASE = 'decrease'
}

export const stockIn = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { sparePartId, quantity, supplierId, reason, remark } = req.body;

    const sparePart = await SparePart.findByPk(sparePartId, { transaction });
    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    if (!sparePart.isEnabled) {
      throw new AppError('该备件已禁用，无法入库', 400);
    }

    const beforeQuantity = Number(sparePart.currentStock);
    const afterQuantity = beforeQuantity + Number(quantity);

    await sparePart.update({ currentStock: afterQuantity }, { transaction });

    const record = await InventoryRecord.create({
      sparePartId,
      type: InventoryType.IN,
      quantity,
      beforeQuantity,
      afterQuantity,
      supplierId,
      reason,
      orderNo: `IN${uuidv4().slice(0, 8).toUpperCase()}`,
      remark,
      operatorId: req.user?.userId,
      operatorName: req.user?.username
    }, { transaction });

    if (afterQuantity < Number(sparePart.safetyStock)) {
      const shortage = Number(sparePart.safetyStock) - afterQuantity;
      await SafetyStockAlert.create({
        sparePartId,
        currentStock: afterQuantity,
        safetyStock: Number(sparePart.safetyStock),
        shortage
      }, { transaction });
    } else {
      await SafetyStockAlert.destroy({
        where: { sparePartId, isHandled: false },
        transaction
      });
    }

    await transaction.commit();

    createOperationLog(req, 'inventory', OperationType.CREATE, `入库操作: ${sparePart.name} 数量: ${quantity}`);
    return res.json(successResponse(record, '入库成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('入库失败'));
  }
};

export const stockOut = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { sparePartId, quantity, applicantId, applicantName, department, reason, remark } = req.body;

    const sparePart = await SparePart.findByPk(sparePartId, { transaction });
    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    if (!sparePart.isEnabled) {
      throw new AppError('该备件已禁用，无法出库', 400);
    }

    const beforeQuantity = Number(sparePart.currentStock);
    if (beforeQuantity < Number(quantity)) {
      throw new AppError('库存不足', 400);
    }

    const afterQuantity = beforeQuantity - Number(quantity);

    await sparePart.update({ currentStock: afterQuantity }, { transaction });

    const record = await InventoryRecord.create({
      sparePartId,
      type: InventoryType.OUT,
      quantity,
      beforeQuantity,
      afterQuantity,
      applicantId,
      applicantName,
      department,
      reason,
      orderNo: `OUT${uuidv4().slice(0, 8).toUpperCase()}`,
      remark,
      operatorId: req.user?.userId,
      operatorName: req.user?.username
    }, { transaction });

    if (afterQuantity < Number(sparePart.safetyStock)) {
      const shortage = Number(sparePart.safetyStock) - afterQuantity;
      await SafetyStockAlert.create({
        sparePartId,
        currentStock: afterQuantity,
        safetyStock: Number(sparePart.safetyStock),
        shortage
      }, { transaction });
    }

    await transaction.commit();

    createOperationLog(req, 'inventory', OperationType.UPDATE, `出库操作: ${sparePart.name} 数量: ${quantity}`);
    return res.json(successResponse(record, '出库成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('出库失败'));
  }
};

export const stockReturn = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { sparePartId, quantity, applicantId, applicantName, department, reason, remark } = req.body;

    const sparePart = await SparePart.findByPk(sparePartId, { transaction });
    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    if (!sparePart.isEnabled) {
      throw new AppError('该备件已禁用，无法退库', 400);
    }

    const beforeQuantity = Number(sparePart.currentStock);
    const afterQuantity = beforeQuantity + Number(quantity);

    await sparePart.update({ currentStock: afterQuantity }, { transaction });

    const record = await InventoryRecord.create({
      sparePartId,
      type: InventoryType.RETURN,
      quantity,
      beforeQuantity,
      afterQuantity,
      applicantId,
      applicantName,
      department,
      reason,
      orderNo: `RET${uuidv4().slice(0, 8).toUpperCase()}`,
      remark,
      operatorId: req.user?.userId,
      operatorName: req.user?.username
    }, { transaction });

    if (afterQuantity >= Number(sparePart.safetyStock)) {
      await SafetyStockAlert.destroy({
        where: { sparePartId, isHandled: false },
        transaction
      });
    }

    await transaction.commit();

    createOperationLog(req, 'inventory', OperationType.UPDATE, `退库操作: ${sparePart.name} 数量: ${quantity}`);
    return res.json(successResponse(record, '退库成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('退库失败'));
  }
};

export const getInventoryRecords = async (req: Request, res: Response) => {
  try {
    const { sparePartId, type, startDate, endDate, page = 1, pageSize = 10 } = req.query;
    const where: any = {};

    if (sparePartId) {
      where.sparePartId = sparePartId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await InventoryRecord.findAndCountAll({
      where,
      include: [
        { model: SparePart, as: 'sparePart', attributes: ['name', 'code', 'unit', 'specification'] },
        { model: Supplier, as: 'supplier', attributes: ['name'] }
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
    return res.status(500).json(errorResponse('获取出入库记录失败'));
  }
};

export const getSparePartList = async (req: Request, res: Response) => {
  try {
    const { keyword, categoryId, workshop, page = 1, pageSize = 10, isLowStock } = req.query;
    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (workshop) {
      where.workshop = workshop;
    }

    if (isLowStock === 'true') {
      where[Op.and] = sequelize.literal('currentStock < safetyStock');
    }

    const { count, rows } = await SparePart.findAndCountAll({
      where,
      include: [{ model: SparePartCategory, as: 'category', attributes: ['id', 'name', 'code'] }],
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
    return res.status(500).json(errorResponse('获取备件列表失败'));
  }
};

export const getSparePartDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sparePart = await SparePart.findByPk(id, {
      include: [
        { model: SparePartCategory, as: 'category', attributes: ['id', 'name', 'code'] }
      ]
    });

    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    const recentRecords = await InventoryRecord.findAll({
      where: { sparePartId: id },
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Supplier, as: 'supplier', attributes: ['name'] }
      ]
    });

    return res.json(successResponse({
      sparePart,
      recentRecords
    }));
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('获取备件详情失败'));
  }
};

export const createSparePart = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { name, code, categoryId, specification, model, unit, brand, safetyStock, currentStock, unitPrice, workshop, location, description, isEnabled } = req.body;

    const exists = await SparePart.findOne({ where: { code }, transaction });
    if (exists) {
      throw new AppError('备件编码已存在', 400);
    }

    const category = await SparePartCategory.findByPk(categoryId, { transaction });
    if (!category) {
      throw new AppError('分类不存在', 400);
    }

    const sparePart = await SparePart.create({
      name,
      code,
      categoryId,
      specification,
      model,
      unit,
      brand,
      safetyStock: safetyStock || 0,
      currentStock: currentStock || 0,
      unitPrice,
      workshop,
      location,
      description,
      isEnabled: isEnabled !== undefined ? isEnabled : true
    }, { transaction });

    const initialStock = Number(currentStock || 0);
    const safetyStockVal = Number(safetyStock || 0);
    
    if (initialStock > 0) {
      await InventoryRecord.create({
        sparePartId: sparePart.id,
        type: InventoryType.IN,
        quantity: initialStock,
        beforeQuantity: 0,
        afterQuantity: initialStock,
        reason: '初始库存',
        orderNo: `INIT${uuidv4().slice(0, 8).toUpperCase()}`,
        operatorId: req.user?.userId,
        operatorName: req.user?.username
      }, { transaction });

      if (initialStock < safetyStockVal) {
        const shortage = safetyStockVal - initialStock;
        await SafetyStockAlert.create({
          sparePartId: sparePart.id,
          currentStock: initialStock,
          safetyStock: safetyStockVal,
          shortage
        }, { transaction });
      }
    }

    await transaction.commit();

    createOperationLog(req, 'sparePart', OperationType.CREATE, `创建备件: ${name}`);
    return res.json(successResponse(sparePart, '备件创建成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('创建备件失败'));
  }
};

export const updateSparePart = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, code, categoryId, specification, model, unit, brand, safetyStock, currentStock, unitPrice, workshop, location, description, isEnabled } = req.body;

    const sparePart = await SparePart.findByPk(id, { transaction });
    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    if (code && code !== sparePart.code) {
      const exists = await SparePart.findOne({ where: { code }, transaction });
      if (exists) {
        throw new AppError('备件编码已存在', 400);
      }
    }

    if (categoryId && categoryId !== sparePart.categoryId) {
      const category = await SparePartCategory.findByPk(categoryId, { transaction });
      if (!category) {
        throw new AppError('分类不存在', 400);
      }
    }

    await sparePart.update({
      name,
      code,
      categoryId,
      specification,
      model,
      unit,
      brand,
      safetyStock,
      currentStock,
      unitPrice,
      workshop,
      location,
      description,
      isEnabled
    }, { transaction });

    const safetyStockVal = Number(safetyStock || sparePart.safetyStock);
    const currentStockVal = Number(currentStock !== undefined ? currentStock : sparePart.currentStock);

    if (currentStockVal < safetyStockVal) {
      const shortage = safetyStockVal - currentStockVal;
      const existingAlert = await SafetyStockAlert.findOne({
        where: { sparePartId: id, isHandled: false },
        transaction
      });
      
      if (!existingAlert) {
        await SafetyStockAlert.create({
          sparePartId: id,
          currentStock: currentStockVal,
          safetyStock: safetyStockVal,
          shortage
        }, { transaction });
      } else {
        await existingAlert.update({
          currentStock: currentStockVal,
          safetyStock: safetyStockVal,
          shortage
        }, { transaction });
      }
    } else {
      await SafetyStockAlert.destroy({
        where: { sparePartId: id, isHandled: false },
        transaction
      });
    }

    await transaction.commit();

    createOperationLog(req, 'sparePart', OperationType.UPDATE, `更新备件: ${name || sparePart.name}`);
    return res.json(successResponse(sparePart, '备件更新成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('更新备件失败'));
  }
};

export const deleteSparePart = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const sparePart = await SparePart.findByPk(id, { transaction });
    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    const hasRecords = await InventoryRecord.count({ where: { sparePartId: id }, transaction });
    if (hasRecords > 0) {
      throw new AppError('该备件存在出入库记录，无法删除，请先禁用', 400);
    }

    await SafetyStockAlert.destroy({ where: { sparePartId: id }, transaction });
    await sparePart.destroy({ transaction });

    await transaction.commit();

    createOperationLog(req, 'sparePart', OperationType.DELETE, `删除备件: ${sparePart.name}`);
    return res.json(successResponse(null, '备件删除成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('删除备件失败'));
  }
};

export const getSparePartStatistics = async (req: Request, res: Response) => {
  try {
    const totalSpareParts = await SparePart.count();
    const lowStockCount = await SparePart.count({
      where: sequelize.literal('currentStock < safetyStock AND safetyStock > 0')
    });
    const enabledCount = await SparePart.count({ where: { isEnabled: true } });
    const disabledCount = totalSpareParts - enabledCount;

    const totalStockValue = await SparePart.sum(
      sequelize.literal('currentStock * unitPrice'),
      { where: { isEnabled: true } }
    );

    const categoryStats = await SparePartCategory.findAll({
      attributes: ['id', 'name', 'code', [fn('COUNT', col('spareParts.id')), 'count']],
      include: [{
        model: SparePart,
        as: 'spareParts',
        attributes: [],
        where: { isEnabled: true },
        required: false
      }],
      group: ['SparePartCategory.id'],
      order: [[col('count'), 'DESC']],
      raw: true
    });

    const workshopStats = await SparePart.findAll({
      attributes: ['workshop', [fn('COUNT', col('id')), 'count']],
      where: { isEnabled: true, workshop: { [Op.ne]: null } },
      group: ['workshop'],
      order: [[col('count'), 'DESC']],
      raw: true
    });

    return res.json(successResponse({
      total: totalSpareParts,
      enabled: enabledCount,
      disabled: disabledCount,
      lowStock: lowStockCount,
      totalStockValue: totalStockValue || 0,
      byCategory: categoryStats,
      byWorkshop: workshopStats
    }));
  } catch (error) {
    return res.status(500).json(errorResponse('获取统计信息失败'));
  }
};

export const stockAdjust = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { sparePartId, adjustType, quantity, reason, remark } = req.body;

    const sparePart = await SparePart.findByPk(sparePartId, { transaction });
    if (!sparePart) {
      throw new AppError('备件不存在', 404);
    }

    if (!sparePart.isEnabled) {
      throw new AppError('该备件已禁用，无法调整库存', 400);
    }

    const beforeQuantity = Number(sparePart.currentStock);
    let afterQuantity: number;

    if (adjustType === InventoryAdjustType.INCREASE) {
      afterQuantity = beforeQuantity + Number(quantity);
    } else if (adjustType === InventoryAdjustType.DECREASE) {
      if (beforeQuantity < Number(quantity)) {
        throw new AppError('库存不足，无法减少', 400);
      }
      afterQuantity = beforeQuantity - Number(quantity);
    } else {
      throw new AppError('调整类型不正确', 400);
    }

    await sparePart.update({ currentStock: afterQuantity }, { transaction });

    const record = await InventoryRecord.create({
      sparePartId,
      type: adjustType === InventoryAdjustType.INCREASE ? InventoryType.IN : InventoryType.OUT,
      quantity,
      beforeQuantity,
      afterQuantity,
      reason: reason || '库存调整',
      orderNo: `ADJ${uuidv4().slice(0, 8).toUpperCase()}`,
      remark,
      operatorId: req.user?.userId,
      operatorName: req.user?.username
    }, { transaction });

    if (afterQuantity < Number(sparePart.safetyStock)) {
      const shortage = Number(sparePart.safetyStock) - afterQuantity;
      const existingAlert = await SafetyStockAlert.findOne({
        where: { sparePartId, isHandled: false },
        transaction
      });

      if (!existingAlert) {
        await SafetyStockAlert.create({
          sparePartId,
          currentStock: afterQuantity,
          safetyStock: Number(sparePart.safetyStock),
          shortage
        }, { transaction });
      } else {
        await existingAlert.update({
          currentStock: afterQuantity,
          safetyStock: Number(sparePart.safetyStock),
          shortage
        }, { transaction });
      }
    } else {
      await SafetyStockAlert.destroy({
        where: { sparePartId, isHandled: false },
        transaction
      });
    }

    await transaction.commit();

    createOperationLog(req, 'inventory', OperationType.UPDATE, `库存调整: ${sparePart.name} ${adjustType} 数量: ${quantity}`);
    return res.json(successResponse(record, '库存调整成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('库存调整失败'));
  }
};

export const batchStockIn = async (req: Request, res: Response) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { items, supplierId, remark } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('请选择要入库的备件', 400);
    }

    const records = [];
    const batchNo = `BATCH${uuidv4().slice(0, 8).toUpperCase()}`;

    for (const item of items) {
      const sparePart = await SparePart.findByPk(item.sparePartId, { transaction });
      if (!sparePart) {
        throw new AppError(`备件ID ${item.sparePartId} 不存在`, 404);
      }

      if (!sparePart.isEnabled) {
        throw new AppError(`备件 ${sparePart.name} 已禁用`, 400);
      }

      const beforeQuantity = Number(sparePart.currentStock);
      const afterQuantity = beforeQuantity + Number(item.quantity);

      await sparePart.update({ currentStock: afterQuantity }, { transaction });

      const record = await InventoryRecord.create({
        sparePartId: item.sparePartId,
        type: InventoryType.IN,
        quantity: item.quantity,
        beforeQuantity,
        afterQuantity,
        supplierId,
        reason: item.reason || '批量入库',
        orderNo: batchNo,
        remark,
        operatorId: req.user?.userId,
        operatorName: req.user?.username
      }, { transaction });

      records.push(record);

      if (afterQuantity < Number(sparePart.safetyStock)) {
        const shortage = Number(sparePart.safetyStock) - afterQuantity;
        await SafetyStockAlert.create({
          sparePartId: item.sparePartId,
          currentStock: afterQuantity,
          safetyStock: Number(sparePart.safetyStock),
          shortage
        }, { transaction });
      } else {
        await SafetyStockAlert.destroy({
          where: { sparePartId: item.sparePartId, isHandled: false },
          transaction
        });
      }
    }

    await transaction.commit();

    createOperationLog(req, 'inventory', OperationType.CREATE, `批量入库: ${items.length} 个备件`);
    return res.json(successResponse({ records, batchNo }, '批量入库成功'));
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('批量入库失败'));
  }
};

export const getStockSummary = async (req: Request, res: Response) => {
  try {
    const totalStock = await SparePart.sum('currentStock', { where: { isEnabled: true } });
    const lowStockCount = await SparePart.count({
      where: sequelize.literal('currentStock < safetyStock AND safetyStock > 0 AND isEnabled = true')
    });
    const outOfStockCount = await SparePart.count({
      where: { currentStock: 0, isEnabled: true }
    });

    const totalValue = await SparePart.sum(
      sequelize.literal('currentStock * unitPrice'),
      { where: { isEnabled: true } }
    );

    const recentInRecords = await InventoryRecord.count({
      where: { type: InventoryType.IN },
      limit: 30
    });

    const recentOutRecords = await InventoryRecord.count({
      where: { type: InventoryType.OUT },
      limit: 30
    });

    return res.json(successResponse({
      totalStock: totalStock || 0,
      lowStockCount,
      outOfStockCount,
      totalStockValue: totalValue || 0,
      recentInRecords,
      recentOutRecords
    }));
  } catch (error) {
    return res.status(500).json(errorResponse('获取库存汇总失败'));
  }
};

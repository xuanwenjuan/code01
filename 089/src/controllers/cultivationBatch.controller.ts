import { Request, Response, NextFunction } from 'express';
import { Transaction } from 'sequelize';
import CultivationBatch from '../models/CultivationBatch';
import MotherStrain from '../models/MotherStrain';
import StrainCategory from '../models/StrainCategory';
import User from '../models/User';
import LossStatistic from '../models/LossStatistic';
import { ResponseUtil } from '../utils/response';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/error';
import { 
  BatchStatus, 
  BATCH_STATUS_TRANSITIONS, 
  QC_FAILED_LOCKED_STATUSES,
  CultivationBatchFilterParams, 
  OperationType,
  UserRole,
  Op 
} from '../types';
import sequelize from '../config/database';
import OperationLogService from '../services/operationLog.service';

const canTransitionStatus = (currentStatus: BatchStatus, newStatus: BatchStatus): boolean => {
  const allowedTransitions = BATCH_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

const isBatchLocked = (status: BatchStatus): boolean => {
  return QC_FAILED_LOCKED_STATUSES.includes(status);
};

const checkBatchPermission = (req: Request, batch: CultivationBatch, action: string): void => {
  const userRole = req.user?.role;
  const userId = req.user?.userId;

  if (userRole === UserRole.ADMIN) return;

  if (action === 'qc' && userRole !== UserRole.QC) {
    throw new ForbiddenError('只有质检员可以执行质检操作');
  }

  if (action === 'update' && userRole !== UserRole.CULTIVATOR) {
    throw new ForbiddenError('只有培育员可以更新批次信息');
  }

  if (action === 'cultivate' && userRole !== UserRole.CULTIVATOR) {
    throw new ForbiddenError('只有培育员可以执行培育操作');
  }

  if (action === 'unlock' && userRole !== UserRole.ADMIN) {
    throw new ForbiddenError('只有管理员可以解锁批次');
  }
};

export const createCultivationBatch = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { batchCode, motherStrainId, quantity, cultureMedium, cultivationTemperature, cultivationHumidity, estimatedDays, remark } = req.body;

    const existingBatch = await CultivationBatch.findOne({ where: { batchCode }, transaction: t });
    if (existingBatch) {
      throw new BadRequestError('批次编号已存在');
    }

    const motherStrain = await MotherStrain.findByPk(motherStrainId, { transaction: t });
    if (!motherStrain) {
      throw new NotFoundError('母种档案不存在');
    }

    const batch = await CultivationBatch.create({
      batchCode,
      motherStrainId,
      categoryId: motherStrain.categoryId,
      quantity,
      cultureMedium,
      cultivationTemperature,
      cultivationHumidity,
      estimatedDays,
      status: BatchStatus.INOCULATED,
      cultivatorId: req.user?.userId,
      remark
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.CREATE,
      batch.id,
      batchCode,
      null,
      batch.toJSON(),
      '创建培育批次'
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '培育批次创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getCultivationBatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      batchCode, 
      motherStrainId, 
      categoryId, 
      status, 
      cultivatorId,
      qcInspectorId,
      startDate,
      endDate
    } = req.query as CultivationBatchFilterParams;

    const where: any = {};
    
    if (batchCode) {
      where.batchCode = { [Op.like]: `%${batchCode}%` };
    }
    if (motherStrainId) {
      where.motherStrainId = Number(motherStrainId);
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (status) {
      where.status = status;
    }
    if (cultivatorId) {
      where.cultivatorId = Number(cultivatorId);
    }
    if (qcInspectorId) {
      where.qcInspectorId = Number(qcInspectorId);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await CultivationBatch.findAndCountAll({
      where,
      include: [
        { model: MotherStrain, as: 'motherStrain', attributes: ['id', 'strainCode', 'strainName'] },
        { model: StrainCategory, as: 'category', attributes: ['id', 'categoryName', 'categoryCode'] },
        { model: User, as: 'cultivator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'qcInspector', attributes: ['id', 'username', 'realName'] }
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

export const getCultivationBatchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const batch = await CultivationBatch.findByPk(id, {
      include: [
        { model: MotherStrain, as: 'motherStrain' },
        { model: StrainCategory, as: 'category' },
        { model: User, as: 'cultivator' },
        { model: User, as: 'qcInspector' }
      ]
    });

    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    res.json(ResponseUtil.success(batch));
  } catch (error) {
    next(error);
  }
};

export const updateCultivationBatch = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    checkBatchPermission(req, batch, 'update');

    if (isBatchLocked(batch.status)) {
      throw new BadRequestError('批次已锁定，无法更新');
    }

    const oldValue = batch.toJSON();

    await batch.update(updateData, { transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.UPDATE,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      '更新培育批次'
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '培育批次更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateBatchStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    checkBatchPermission(req, batch, 'cultivate');

    if (isBatchLocked(batch.status)) {
      throw new BadRequestError('批次已锁定，需管理员解锁后才能变更状态');
    }

    if (!canTransitionStatus(batch.status, status)) {
      throw new BadRequestError(`无法从 ${batch.status} 变更为 ${status}`);
    }

    const oldValue = batch.toJSON();

    await batch.update({ status }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.STATUS_CHANGE,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      remark || `批次状态变更为: ${status}`
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '批次状态更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const performQcInspection = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { qcResult, qcRemark, qcItems, sampleCount, passCount } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    checkBatchPermission(req, batch, 'qc');

    if (batch.status !== BatchStatus.QC_INSPECTION) {
      throw new BadRequestError('批次不在待质检状态');
    }

    const newStatus = qcResult === 'pass' ? BatchStatus.QC_PASSED : BatchStatus.QC_FAILED;
    const oldValue = batch.toJSON();

    await batch.update({
      status: newStatus,
      qcInspectorId: req.user?.userId,
      qcRemark,
      qcItems: qcItems ? JSON.stringify(qcItems) : null,
      qcSampleCount: sampleCount,
      qcPassCount: passCount,
      qcDate: new Date()
    }, { transaction: t });

    if (qcResult === 'fail') {
      const lossQuantity = batch.quantity - (passCount || 0);
      await LossStatistic.create({
        batchId: batch.id,
        batchCode: batch.batchCode,
        categoryId: batch.categoryId,
        lossType: 'qc_failed',
        lossQuantity: Math.max(0, lossQuantity),
        lossReason: qcRemark || '质检不合格',
        lossDate: new Date(),
        recordedBy: req.user?.userId
      }, { transaction: t });
    }

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.QC_INSPECTION,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      `质检${qcResult === 'pass' ? '合格' : '不合格'}: ${qcRemark}`
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, `质检${qcResult === 'pass' ? '合格' : '不合格'}`));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const unlockBatch = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    checkBatchPermission(req, batch, 'unlock');

    if (!isBatchLocked(batch.status)) {
      throw new BadRequestError('批次未锁定，无需解锁');
    }

    const oldValue = batch.toJSON();

    await batch.update({ status: BatchStatus.CULTIVATING }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.STATUS_CHANGE,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      remark || '管理员解锁批次'
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '批次解锁成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const batchPackaged = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { actualQuantity, remark } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    if (batch.status !== BatchStatus.QC_PASSED) {
      throw new BadRequestError('只有质检合格的批次才能分装');
    }

    const oldValue = batch.toJSON();

    await batch.update({
      status: BatchStatus.PACKAGED,
      actualQuantity: actualQuantity || batch.quantity
    }, { transaction: t });

    if (actualQuantity && actualQuantity < batch.quantity) {
      await LossStatistic.create({
        batchId: batch.id,
        batchCode: batch.batchCode,
        categoryId: batch.categoryId,
        lossType: 'other',
        lossQuantity: batch.quantity - actualQuantity,
        lossReason: remark || '分装损耗',
        lossDate: new Date(),
        recordedBy: req.user?.userId
      }, { transaction: t });
    }

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.STATUS_CHANGE,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      remark || '批次分装完成'
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '批次分装完成'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const batchInStock = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { warehouseLocation, remark } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    if (batch.status !== BatchStatus.PACKAGED) {
      throw new BadRequestError('只有已分装的批次才能入库');
    }

    const oldValue = batch.toJSON();

    await batch.update({
      status: BatchStatus.IN_STOCK,
      warehouseLocation,
      inStockDate: new Date()
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.STATUS_CHANGE,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      remark || '批次入库完成'
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '批次入库完成'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const batchShipped = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { orderNumber, customerInfo, shippingQuantity, remark } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    if (batch.status !== BatchStatus.IN_STOCK) {
      throw new BadRequestError('只有已入库的批次才能出库');
    }

    const oldValue = batch.toJSON();

    await batch.update({
      status: BatchStatus.SHIPPED,
      orderNumber,
      customerInfo,
      shippingQuantity,
      shippedDate: new Date()
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.STATUS_CHANGE,
      batch.id,
      batch.batchCode,
      oldValue,
      batch.toJSON(),
      remark || '批次出库完成'
    );

    await t.commit();

    res.json(ResponseUtil.success(batch, '批次出库完成'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const recordAbnormalLoss = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { lossQuantity, lossReason, lossType = 'abnormal' } = req.body;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    await LossStatistic.create({
      batchId: batch.id,
      batchCode: batch.batchCode,
      categoryId: batch.categoryId,
      lossType,
      lossQuantity,
      lossReason,
      lossDate: new Date(),
      recordedBy: req.user?.userId
    }, { transaction: t });

    if (lossType === 'abnormal') {
      const oldValue = batch.toJSON();
      await batch.update({ status: BatchStatus.ABNORMAL }, { transaction: t });
      
      await OperationLogService.createLog(
        req,
        'cultivation_batch',
        OperationType.STATUS_CHANGE,
        batch.id,
        batch.batchCode,
        oldValue,
        batch.toJSON(),
        `记录异常损耗: ${lossReason}`
      );
    }

    await t.commit();

    res.json(ResponseUtil.success(null, '损耗记录成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteCultivationBatch = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const batch = await CultivationBatch.findByPk(id, { transaction: t });
    if (!batch) {
      throw new NotFoundError('培育批次不存在');
    }

    const oldValue = batch.toJSON();

    await batch.destroy({ transaction: t });

    await OperationLogService.createLog(
      req,
      'cultivation_batch',
      OperationType.DELETE,
      batch.id,
      batch.batchCode,
      oldValue,
      null,
      '删除培育批次'
    );

    await t.commit();

    res.json(ResponseUtil.success(null, '培育批次删除成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

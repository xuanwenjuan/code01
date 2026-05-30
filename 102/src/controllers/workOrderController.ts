import { Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import WorkOrder from '../models/WorkOrder';
import WorkOrderStageLog from '../models/WorkOrderStageLog';
import WorkOrderMaterial from '../models/WorkOrderMaterial';
import Wine from '../models/Wine';
import User from '../models/User';
import Material from '../models/Material';
import ResponseUtil from '../utils/response';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../database';
import { WorkOrderStage, WorkOrderStatus, WineStatus } from '../constants';
import dayjs from 'dayjs';

export const StageFlow: Record<string, string> = {
  [WorkOrderStage.SORTING_PRESSING]: WorkOrderStage.CONSTANT_TEMP_FERMENTATION,
  [WorkOrderStage.CONSTANT_TEMP_FERMENTATION]: WorkOrderStage.BARREL_AGING,
  [WorkOrderStage.BARREL_AGING]: WorkOrderStage.WINE_BLENDING,
  [WorkOrderStage.WINE_BLENDING]: WorkOrderStage.BOTTLING_SEALING,
  [WorkOrderStage.BOTTLING_SEALING]: WorkOrderStage.WAREHOUSE_STORAGE,
};

export const StageStatusMap: Record<string, string> = {
  [WorkOrderStage.SORTING_PRESSING]: WorkOrderStatus.SORTING,
  [WorkOrderStage.CONSTANT_TEMP_FERMENTATION]: WorkOrderStatus.FERMENTING,
  [WorkOrderStage.BARREL_AGING]: WorkOrderStatus.AGING,
  [WorkOrderStage.WINE_BLENDING]: WorkOrderStatus.BLENDING,
  [WorkOrderStage.BOTTLING_SEALING]: WorkOrderStatus.BOTTLING,
  [WorkOrderStage.WAREHOUSE_STORAGE]: WorkOrderStatus.STORING,
};

const getNextStage = (currentStage: string): string | undefined => {
  return StageFlow[currentStage] || undefined;
};

const getStatusForStage = (stage: string): WorkOrderStatus => {
  return (StageStatusMap[stage] as WorkOrderStatus) || WorkOrderStatus.PENDING;
};

export const getWorkOrderList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      currentStage,
      assignedTo,
      wineId,
      keyword,
      overdue,
      startDate,
      endDate,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (currentStage) where.currentStage = currentStage;
    if (assignedTo) where.assignedTo = assignedTo;
    if (wineId) where.wineId = wineId;
    if (overdue === 'true') where.isOverdue = true;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { orderNo: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const order: any[] = [];
    if (sortBy && sortOrder) {
      order.push([sortBy as string, sortOrder as string]);
    }
    order.push(['id', 'DESC']);

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      include: [
        {
          model: Wine,
          as: 'wine',
          attributes: ['id', 'batchNo', 'name', 'vintageYear', 'origin'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName'],
        },
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order,
    });

    ResponseUtil.pagination(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '查询成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        {
          model: Wine,
          as: 'wine',
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName', 'phone'],
        },
        {
          model: WorkOrderStageLog,
          as: 'stages',
          include: [
            {
              model: User,
              as: 'operator',
              attributes: ['id', 'username', 'realName'],
            },
          ],
          order: [['id', 'ASC']],
        },
        {
          model: WorkOrderMaterial,
          as: 'materials',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'name', 'code', 'unit', 'unitPrice'],
            },
          ],
        },
      ],
    });

    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    const workOrderData: any = workOrder.toJSON();
    workOrderData.nextStage = getNextStage(workOrderData.currentStage);
    workOrderData.canAdvance = workOrderData.nextStage && 
      workOrderData.status !== WorkOrderStatus.COMPLETED && 
      workOrderData.status !== WorkOrderStatus.SUSPENDED;

    ResponseUtil.success(res, workOrderData);
  } catch (error) {
    next(error);
  }
};

export const createWorkOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { orderNo, wineId, materials, ...workOrderData } = req.body;

    const existingOrder = await WorkOrder.findOne({ where: { orderNo }, transaction });
    if (existingOrder) {
      throw new BadRequestError('工单号已存在');
    }

    const wine = await Wine.findByPk(wineId, { transaction });
    if (!wine) {
      throw new BadRequestError('酒品不存在');
    }

    const initialStage = workOrderData.currentStage || WorkOrderStage.SORTING_PRESSING;
    const initialStatus = getStatusForStage(initialStage);

    const workOrder = await WorkOrder.create(
      {
        ...workOrderData,
        orderNo,
        wineId,
        currentStage: initialStage,
        status: initialStatus,
      },
      { transaction }
    );

    if (materials && materials.length > 0) {
      const workOrderMaterials = materials.map((m: any) => ({
        ...m,
        workOrderId: workOrder.id,
        unitPrice: m.unitPrice || 0,
        totalCost: (m.quantity || 0) * (m.unitPrice || 0),
      }));
      await WorkOrderMaterial.bulkCreate(workOrderMaterials, { transaction });
    }

    await WorkOrderStageLog.create(
      {
        workOrderId: workOrder.id,
        stage: initialStage,
        status: initialStatus,
        startedAt: new Date(),
        operatedBy: req.user?.id,
      },
      { transaction }
    );

    await transaction.commit();

    const createdWorkOrder = await WorkOrder.findByPk(workOrder.id, {
      include: [
        { model: Wine, as: 'wine', attributes: ['id', 'batchNo', 'name'] },
        { model: WorkOrderMaterial, as: 'materials', include: ['material'] },
      ],
    });

    ResponseUtil.success(res, createdWorkOrder, '创建成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const selectAndLockMaterials = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { workOrderId } = req.params;
    const workOrderIdNum = Number(workOrderId);
    const { materials, autoLock = true } = req.body;

    const workOrder = await WorkOrder.findByPk(workOrderIdNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法选择原料');
    }

    if (workOrder.status === WorkOrderStatus.CANCELLED) {
      throw new BadRequestError('已取消的工单无法选择原料');
    }

    const lockResults = [];
    
    for (const mat of materials) {
      const { materialId, quantity, remarks } = mat;
      
      if (!materialId || !quantity || quantity <= 0) {
        throw new BadRequestError('原料ID和数量不能为空且数量必须大于0');
      }

      const material = await Material.findByPk(materialId, { transaction });
      if (!material) {
        throw new NotFoundError(`原料ID ${materialId} 不存在`);
      }

      if (!material.status) {
        throw new BadRequestError(`原料「${material.name}」已停用`);
      }

      if (autoLock) {
        const availableStock = Number(material.stock) - Number(material.lockedStock);
        if (quantity > availableStock) {
          throw new BadRequestError(
            `原料「${material.name}」库存不足，可用：${availableStock} ${material.unit}，需要：${quantity} ${material.unit}`
          );
        }

        await material.update(
          {
            lockedStock: Number(material.lockedStock) + Number(quantity),
          },
          { transaction }
        );
      }

      const existingWorkOrderMaterial = await WorkOrderMaterial.findOne({
        where: { workOrderId: workOrderIdNum, materialId },
        transaction,
      });

      if (existingWorkOrderMaterial) {
        const oldQuantity = existingWorkOrderMaterial.quantity;
        if (autoLock) {
          await material.update(
            {
              lockedStock: Number(material.lockedStock) - Number(oldQuantity) + Number(quantity),
            },
            { transaction }
          );
        }
        await (existingWorkOrderMaterial as any).update(
          {
            quantity,
            unitPrice: material.unitPrice,
            totalCost: Number(quantity) * Number(material.unitPrice),
            isLocked: autoLock,
            lockedAt: autoLock ? new Date() : undefined,
            lockedBy: autoLock ? req.user?.id : undefined,
            remarks,
          },
          { transaction }
        );
      } else {
        await WorkOrderMaterial.create(
          {
            workOrderId: workOrderIdNum,
            materialId,
            quantity,
            unitPrice: material.unitPrice,
            totalCost: Number(quantity) * Number(material.unitPrice),
            isLocked: autoLock,
            lockedAt: autoLock ? new Date() : undefined,
            lockedBy: autoLock ? req.user?.id : undefined,
            remarks,
          },
          { transaction }
        );
      }

      lockResults.push({
        materialId,
        materialName: material.name,
        quantity,
        unit: material.unit,
        unitPrice: material.unitPrice,
        totalCost: Number(quantity) * Number(material.unitPrice),
        isLocked: autoLock,
      });
    }

    await transaction.commit();

    ResponseUtil.success(
      res,
      {
        workOrderId: workOrderIdNum,
        totalMaterials: lockResults.length,
        materials: lockResults,
      },
      autoLock ? '原料选择并锁定成功' : '原料选择成功'
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const unlockWorkOrderMaterials = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { workOrderId } = req.params;
    const workOrderIdNum = Number(workOrderId);
    const { materialIds } = req.body;

    const workOrder = await WorkOrder.findByPk(workOrderIdNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    const whereCondition: any = { workOrderId: workOrderIdNum, isLocked: true };
    if (materialIds && materialIds.length > 0) {
      whereCondition.materialId = { [Op.in]: materialIds };
    }

    const lockedMaterials = await WorkOrderMaterial.findAll({
      where: whereCondition,
      include: [{ model: Material, as: 'material' }],
      transaction,
    });

    const unlockResults = [];
    for (const wom of lockedMaterials) {
      const material = wom.material;
      if (material) {
        const newLockedStock = Number(material.lockedStock) - Number(wom.quantity);
        await material.update(
          { lockedStock: Math.max(0, newLockedStock) },
          { transaction }
        );
      }

      await (wom as any).update(
        {
          isLocked: false,
          lockedAt: undefined,
          lockedBy: undefined,
        },
        { transaction }
      );

      unlockResults.push({
        materialId: wom.materialId,
        materialName: material?.name,
        unlockedQuantity: wom.quantity,
      });
    }

    await transaction.commit();

    ResponseUtil.success(
      res,
      {
        workOrderId: workOrderIdNum,
        totalUnlocked: unlockResults.length,
        materials: unlockResults,
      },
      '原料解锁成功'
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateWorkOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { orderNo, wineId, materials, ...updateData } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法修改');
    }

    if (orderNo && orderNo !== workOrder.orderNo) {
      const existingOrder = await WorkOrder.findOne({ where: { orderNo }, transaction });
      if (existingOrder) {
        throw new BadRequestError('工单号已存在');
      }
    }

    if (wineId && wineId !== workOrder.wineId) {
      const wine = await Wine.findByPk(wineId, { transaction });
      if (!wine) {
        throw new BadRequestError('酒品不存在');
      }
    }

    await workOrder.update(updateData, { transaction });

    if (materials && materials.length > 0) {
      await WorkOrderMaterial.destroy({ where: { workOrderId: id }, transaction });
      const workOrderMaterials = materials.map((m: any) => ({
        ...m,
        workOrderId: id,
      }));
      await WorkOrderMaterial.bulkCreate(workOrderMaterials, { transaction });
    }

    await transaction.commit();

    const updatedWorkOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: Wine, as: 'wine', attributes: ['id', 'batchNo', 'name'] },
        { model: WorkOrderMaterial, as: 'materials', include: ['material'] },
      ],
    });

    ResponseUtil.success(res, updatedWorkOrder, '更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const advanceWorkOrderStage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const idNum = Number(id);
    const { quantity, temperature, notes } = req.body;

    const workOrder = await WorkOrder.findByPk(idNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法推进阶段');
    }

    if (workOrder.status === WorkOrderStatus.SUSPENDED) {
      throw new BadRequestError('已搁置的工单无法推进阶段，请先恢复工单');
    }

    const nextStage = getNextStage(workOrder.currentStage);
    if (!nextStage) {
      throw new BadRequestError('当前已是最后阶段，无法继续推进');
    }

    const nextStatus = getStatusForStage(nextStage);

    await WorkOrderStageLog.update(
      {
        completedAt: new Date(),
        quantity,
        temperature,
        notes,
      },
      {
        where: {
          workOrderId: idNum,
          stage: workOrder.currentStage,
        },
        transaction,
      }
    );

    await WorkOrderStageLog.create(
      {
        workOrderId: idNum,
        stage: nextStage as WorkOrderStage,
        status: nextStatus,
        startedAt: new Date(),
        operatedBy: req.user?.id,
        quantity,
        temperature,
        notes,
      },
      { transaction }
    );

    await (workOrder as any).update(
      {
        currentStage: nextStage as WorkOrderStage,
        status: nextStatus,
      },
      { transaction }
    );

    await transaction.commit();

    const updatedWorkOrder = await WorkOrder.findByPk(idNum, {
      include: [
        { model: Wine, as: 'wine', attributes: ['id', 'batchNo', 'name'] },
        { model: WorkOrderStageLog, as: 'stages', order: [['id', 'ASC']] },
      ],
    });

    ResponseUtil.success(res, updatedWorkOrder, `阶段已推进至：${nextStage}`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const rollbackWorkOrderStage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const idNum = Number(id);
    const { reason } = req.body;

    const workOrder = await WorkOrder.findByPk(idNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法回退阶段');
    }

    const stageEntries = Object.entries(StageFlow);
    const currentEntry = stageEntries.find(([_, target]) => target === workOrder.currentStage);
    
    if (!currentEntry) {
      throw new BadRequestError('当前已是第一阶段，无法回退');
    }

    const previousStage = currentEntry[0];
    const previousStatus = getStatusForStage(previousStage);

    await WorkOrderStageLog.destroy({
      where: {
        workOrderId: idNum,
        stage: workOrder.currentStage,
      },
      transaction,
    });

    await WorkOrderStageLog.update(
      {
        completedAt: undefined,
      },
      {
        where: {
          workOrderId: idNum,
          stage: previousStage,
        },
        transaction,
      }
    );

    await (workOrder as any).update(
      {
        currentStage: previousStage,
        status: previousStatus,
      },
      { transaction }
    );

    await transaction.commit();

    const updatedWorkOrder = await WorkOrder.findByPk(idNum, {
      include: [
        { model: WorkOrderStageLog, as: 'stages', order: [['id', 'ASC']] },
      ],
    });

    ResponseUtil.success(res, updatedWorkOrder, `阶段已回退至：${previousStage}`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const recordMaterialLoss = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { workOrderId } = req.params;
    const workOrderIdNum = Number(workOrderId);
    const { lossItems, reason } = req.body;

    const workOrder = await WorkOrder.findByPk(workOrderIdNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法记录损耗');
    }

    const lossResults = [];
    
    for (const item of lossItems) {
      const { materialId, lossQuantity, remarks } = item;
      
      if (!materialId || !lossQuantity || lossQuantity <= 0) {
        throw new BadRequestError('原料ID和损耗数量不能为空且数量必须大于0');
      }

      const workOrderMaterial = await WorkOrderMaterial.findOne({
        where: { workOrderId: workOrderIdNum, materialId },
        include: [{ model: Material, as: 'material' }],
        transaction,
      });

      if (!workOrderMaterial) {
        throw new BadRequestError(`工单中不存在原料ID ${materialId}`);
      }

      const material = workOrderMaterial.material;
      if (!material) {
        throw new NotFoundError(`原料ID ${materialId} 不存在`);
      }

      const usedQuantity = Number(workOrderMaterial.actualQuantity || 0) + Number(lossQuantity);
      if (usedQuantity > Number(workOrderMaterial.quantity)) {
        throw new BadRequestError(
          `原料「${material.name}」总使用量（已用+损耗）不能超过锁定量，已用：${workOrderMaterial.actualQuantity}，损耗：${lossQuantity}，锁定：${workOrderMaterial.quantity}`
        );
      }

      const lossCost = Number(lossQuantity) * Number(workOrderMaterial.unitPrice || 0);

      await (workOrderMaterial as any).update(
        {
          lossQuantity: Number(workOrderMaterial.lossQuantity || 0) + Number(lossQuantity),
          actualQuantity: Number(workOrderMaterial.actualQuantity || 0),
          totalCost: (Number(workOrderMaterial.actualQuantity || 0) + Number(workOrderMaterial.lossQuantity || 0) + Number(lossQuantity)) * Number(workOrderMaterial.unitPrice || 0),
          remarks: remarks ? `${workOrderMaterial.remarks || ''}; ${remarks}` : workOrderMaterial.remarks,
        },
        { transaction }
      );

      const newLockedStock = Number(material.lockedStock) - Number(lossQuantity);
      const newStock = Number(material.stock) - Number(lossQuantity);
      
      await material.update(
        {
          lockedStock: Math.max(0, newLockedStock),
          stock: Math.max(0, newStock),
        },
        { transaction }
      );

      lossResults.push({
        materialId,
        materialName: material.name,
        lossQuantity,
        unit: material.unit,
        unitPrice: workOrderMaterial.unitPrice,
        lossCost,
      });
    }

    await transaction.commit();

    ResponseUtil.success(
      res,
      {
        workOrderId: workOrderIdNum,
        totalLossItems: lossResults.length,
        lossItems: lossResults,
        totalLossCost: lossResults.reduce((sum, item) => sum + item.lossCost, 0),
        reason,
      },
      '损耗记录成功'
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const recordMaterialUsage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { workOrderId } = req.params;
    const workOrderIdNum = Number(workOrderId);
    const { usageItems } = req.body;

    const workOrder = await WorkOrder.findByPk(workOrderIdNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法记录原料使用');
    }

    const usageResults = [];
    
    for (const item of usageItems) {
      const { materialId, actualQuantity, remarks } = item;
      
      if (!materialId || !actualQuantity || actualQuantity <= 0) {
        throw new BadRequestError('原料ID和实际用量不能为空且数量必须大于0');
      }

      const workOrderMaterial = await WorkOrderMaterial.findOne({
        where: { workOrderId: workOrderIdNum, materialId },
        include: [{ model: Material, as: 'material' }],
        transaction,
      });

      if (!workOrderMaterial) {
        throw new BadRequestError(`工单中不存在原料ID ${materialId}`);
      }

      if (!workOrderMaterial.isLocked) {
        throw new BadRequestError(`原料「${workOrderMaterial.material?.name}」未锁定，请先锁定库存`);
      }

      const material = workOrderMaterial.material;
      if (!material) {
        throw new NotFoundError(`原料ID ${materialId} 不存在`);
      }

      const totalUsed = Number(actualQuantity) + Number(workOrderMaterial.lossQuantity || 0);
      if (totalUsed > Number(workOrderMaterial.quantity)) {
        throw new BadRequestError(
          `原料「${material.name}」总使用量不能超过锁定量，锁定：${workOrderMaterial.quantity}，实际：${actualQuantity}，损耗：${workOrderMaterial.lossQuantity || 0}`
        );
      }

      const usageCost = Number(actualQuantity) * Number(workOrderMaterial.unitPrice || 0);

      await (workOrderMaterial as any).update(
        {
          actualQuantity,
          totalCost: (Number(actualQuantity) + Number(workOrderMaterial.lossQuantity || 0)) * Number(workOrderMaterial.unitPrice || 0),
          remarks,
        },
        { transaction }
      );

      usageResults.push({
        materialId,
        materialName: material.name,
        actualQuantity,
        unit: material.unit,
        unitPrice: workOrderMaterial.unitPrice,
        usageCost,
      });
    }

    await transaction.commit();

    ResponseUtil.success(
      res,
      {
        workOrderId,
        totalUsageItems: usageResults.length,
        usageItems: usageResults,
        totalUsageCost: usageResults.reduce((sum, item) => sum + item.usageCost, 0),
      },
      '原料使用记录成功'
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const completeWorkOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const idNum = Number(id);
    const { actualQuantity, notes, bottleCount, autoCalculateCost = true } = req.body;

    const workOrder = await WorkOrder.findByPk(idNum, { 
      include: [
        { model: WorkOrderMaterial, as: 'materials', include: [{ model: Material, as: 'material' }] },
      ],
      transaction,
    });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('工单已完成');
    }

    if (workOrder.currentStage !== WorkOrderStage.WAREHOUSE_STORAGE) {
      throw new BadRequestError('只有在入库封存阶段才能完成工单');
    }

    await WorkOrderStageLog.update(
      {
        completedAt: new Date(),
        quantity: actualQuantity,
        notes,
      },
      {
        where: {
          workOrderId: idNum,
          stage: workOrder.currentStage,
        },
        transaction,
      }
    );

    const costCalculation = {
      totalMaterialCost: 0,
      totalLossCost: 0,
      laborCost: 0,
      storageCost: 0,
      otherCost: 0,
      totalCost: 0,
      unitCost: 0,
      lossRate: 0,
    };

    if (autoCalculateCost && workOrder.materials && workOrder.materials.length > 0) {
      for (const wom of workOrder.materials) {
        const material = wom.material;
        if (material && wom.isLocked) {
          const actualQty = Number(wom.actualQuantity || 0);
          const lossQty = Number(wom.lossQuantity || 0);
          const totalQty = actualQty + lossQty;
          const unitPrice = Number(wom.unitPrice || material.unitPrice || 0);

          costCalculation.totalMaterialCost += actualQty * unitPrice;
          costCalculation.totalLossCost += lossQty * unitPrice;

          const newStock = Number(material.stock) - totalQty;
          const newLockedStock = Number(material.lockedStock) - Number(wom.quantity);
          
          await material.update(
            {
              stock: Math.max(0, newStock),
              lockedStock: Math.max(0, newLockedStock),
            },
            { transaction }
          );

          await (wom as any).update(
            {
              isLocked: false,
              lockedAt: undefined,
              lockedBy: undefined,
              totalCost: totalQty * unitPrice,
            },
            { transaction }
          );
        }
      }

      const finalQuantity = Number(actualQuantity || workOrder.targetQuantity || 0);
      costCalculation.laborCost = finalQuantity * 10;
      costCalculation.storageCost = finalQuantity * 5;
      costCalculation.otherCost = 0;
      costCalculation.totalCost = 
        costCalculation.totalMaterialCost + 
        costCalculation.totalLossCost + 
        costCalculation.laborCost + 
        costCalculation.storageCost + 
        costCalculation.otherCost;
      costCalculation.unitCost = finalQuantity > 0 ? costCalculation.totalCost / finalQuantity : 0;
      
      const totalLockedQty = workOrder.materials.reduce((sum, m) => sum + Number(m.quantity || 0), 0);
      const totalUsedQty = workOrder.materials.reduce((sum, m) => sum + Number(m.actualQuantity || 0) + Number(m.lossQuantity || 0), 0);
      costCalculation.lossRate = totalLockedQty > 0 ? (costCalculation.totalLossCost / (totalUsedQty * (costCalculation.totalCost / totalUsedQty || 1))) * 100 : 0;
    }

    await (workOrder as any).update(
      {
        status: WorkOrderStatus.COMPLETED,
        actualQuantity,
        actualEndDate: new Date(),
      },
      { transaction }
    );

    const wine = await Wine.findByPk(workOrder.wineId, { transaction });
    if (wine) {
      await wine.update(
        {
          currentQuantity: actualQuantity || workOrder.targetQuantity,
          bottleCount,
          status: WineStatus.CELLARING,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const updatedWorkOrder = await WorkOrder.findByPk(idNum, {
      include: [
        { model: Wine, as: 'wine' },
        { model: WorkOrderMaterial, as: 'materials', include: ['material'] },
        { model: WorkOrderStageLog, as: 'stages', order: [['id', 'ASC']] },
      ],
    });

    ResponseUtil.success(
      res,
      {
        workOrder: updatedWorkOrder,
        costCalculation,
      },
      '工单已完成，成本已自动核算'
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const suspendWorkOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const idNum = Number(id);
    const { reason } = req.body;

    const workOrder = await WorkOrder.findByPk(idNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法搁置');
    }

    if (workOrder.status === WorkOrderStatus.SUSPENDED) {
      throw new BadRequestError('工单已处于搁置状态');
    }

    await (workOrder as any).update(
      {
        status: WorkOrderStatus.SUSPENDED,
      },
      { transaction }
    );

    await transaction.commit();
    ResponseUtil.success(res, workOrder, '工单已搁置');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const resumeWorkOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const idNum = Number(id);

    const workOrder = await WorkOrder.findByPk(idNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.SUSPENDED) {
      throw new BadRequestError('只有搁置状态的工单才能恢复');
    }

    const currentStatus = getStatusForStage(workOrder.currentStage);
    await (workOrder as any).update(
      {
        status: currentStatus,
      },
      { transaction }
    );

    await transaction.commit();
    ResponseUtil.success(res, workOrder, '工单已恢复');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteWorkOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const idNum = Number(id);

    const workOrder = await WorkOrder.findByPk(idNum, { transaction });
    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('已完成的工单无法删除');
    }

    await WorkOrderStageLog.destroy({ where: { workOrderId: idNum }, transaction });
    await WorkOrderMaterial.destroy({ where: { workOrderId: idNum }, transaction });
    await workOrder.destroy({ transaction });

    await transaction.commit();
    ResponseUtil.success(res, null, '删除成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getWorkOrderStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, wineId, assignedTo } = req.query;
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }
    if (wineId) where.wineId = wineId;
    if (assignedTo) where.assignedTo = assignedTo;

    const totalCount = await WorkOrder.count({ where });

    const statusCounts = await WorkOrder.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const stageCounts = await WorkOrder.findAll({
      where,
      attributes: ['currentStage', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['currentStage'],
    });

    const overdueCount = await WorkOrder.count({
      where: { ...where, isOverdue: true },
    });

    const thisMonthStart = dayjs().startOf('month').toDate();
    const thisMonthCount = await WorkOrder.count({
      where: { ...where, createdAt: { [Op.gte]: thisMonthStart } },
    });

    const completedCount = await WorkOrder.count({
      where: { ...where, status: WorkOrderStatus.COMPLETED },
    });

    const totalTargetQuantity = await WorkOrder.sum('targetQuantity', { where }) || 0;
    const totalActualQuantity = await WorkOrder.sum('actualQuantity', { where }) || 0;

    const statusMap: any = {};
    statusCounts.forEach((item: any) => {
      statusMap[item.status] = item.dataValues.count;
    });

    const stageMap: any = {};
    stageCounts.forEach((item: any) => {
      stageMap[item.currentStage] = item.dataValues.count;
    });

    ResponseUtil.success(res, {
      total: totalCount,
      thisMonthCount,
      byStatus: {
        pending: statusMap.pending || 0,
        sorting: statusMap.sorting || 0,
        fermenting: statusMap.fermenting || 0,
        aging: statusMap.aging || 0,
        blending: statusMap.blending || 0,
        bottling: statusMap.bottling || 0,
        storing: statusMap.storing || 0,
        completed: completedCount,
        suspended: statusMap.suspended || 0,
      },
      byStage: stageMap,
      quantity: {
        totalTarget: Number(totalTargetQuantity.toFixed(2)),
        totalActual: Number(totalActualQuantity.toFixed(2)),
        completionRate: totalTargetQuantity > 0 
          ? Number(((totalActualQuantity / totalTargetQuantity) * 100).toFixed(2))
          : 0,
      },
      overdue: {
        count: overdueCount,
        rate: totalCount > 0 ? Number(((overdueCount / totalCount) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStageFlow = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stageList = Object.keys(StageFlow).map((stage, index) => ({
      stage,
      order: index + 1,
      nextStage: StageFlow[stage],
      status: getStatusForStage(stage),
    }));

    stageList.push({
      stage: WorkOrderStage.WAREHOUSE_STORAGE,
      order: stageList.length + 1,
      nextStage: '',
      status: getStatusForStage(WorkOrderStage.WAREHOUSE_STORAGE),
    } as any);

    ResponseUtil.success(res, {
      stages: stageList,
      stageFlow: StageFlow,
      stageStatusMap: StageStatusMap,
    });
  } catch (error) {
    next(error);
  }
};

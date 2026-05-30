import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { MaterialConsumption, Material, WorkOrder, MaterialCategory } from '../models';
import { WORK_ORDER_STATUS, MATERIAL_STATUS } from '../config';
import { successResponse, notFoundError, badRequestError, conflictError } from '../utils/response';
import logger from '../utils/logger';
import sequelize from '../config/database';

export const createMaterialConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { workOrderId, materialId, plannedQuantity, actualQuantity, wasteQuantity, unitPrice, remark } = req.body;

    const workOrder = await WorkOrder.findByPk(workOrderId, { transaction: t });
    if (!workOrder) {
      await t.rollback();
      throw notFoundError('工单不存在');
    }

    if ([WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.DELIVERED, WORK_ORDER_STATUS.CANCELLED, WORK_ORDER_STATUS.EXPIRED].includes(workOrder.status as any)) {
      await t.rollback();
      throw badRequestError('该工单状态不允许添加物料消耗');
    }

    const material = await Material.findByPk(materialId, { transaction: t });
    if (!material) {
      await t.rollback();
      throw notFoundError('物料不存在');
    }

    const existingConsumption = await MaterialConsumption.findOne({
      where: { workOrderId, materialId },
      transaction: t,
    });
    if (existingConsumption) {
      await t.rollback();
      throw conflictError('该工单已存在此物料的消耗记录');
    }

    const effectiveUnitPrice = unitPrice || material.unitPrice;

    if (actualQuantity && actualQuantity > 0) {
      if (Number(material.currentStock) < Number(actualQuantity)) {
        await t.rollback();
        throw badRequestError(`物料库存不足，当前库存: ${material.currentStock}`);
      }

      const newStock = Number(material.currentStock) - Number(actualQuantity);
      const newStatus = newStock <= 0
        ? MATERIAL_STATUS.EXHAUSTED
        : newStock <= Number(material.minStock)
          ? MATERIAL_STATUS.LOW
          : material.status;

      await material.update(
        { currentStock: newStock, status: newStatus },
        { transaction: t }
      );
    }

    const effectiveActualQuantity = actualQuantity || 0;
    const effectiveWasteQuantity = wasteQuantity || 0;
    const totalCost = Number((effectiveActualQuantity + effectiveWasteQuantity) * Number(effectiveUnitPrice));

    const consumption = await MaterialConsumption.create(
      {
        workOrderId,
        materialId,
        plannedQuantity,
        actualQuantity: effectiveActualQuantity,
        wasteQuantity: effectiveWasteQuantity,
        unitPrice: effectiveUnitPrice,
        totalCost,
        remark,
        operatedBy: req.user?.id,
      },
      { transaction: t }
    );

    await t.commit();

    logger.info(`创建物料消耗成功: 工单${workOrder.orderNo}, 物料${material.code}, 实际用量${effectiveActualQuantity}`);
    successResponse(res, consumption, '创建成功', 201);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMaterialConsumptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, workOrderId, materialId, startDate, endDate } = req.query;

    const where: any = {};

    if (workOrderId) {
      where.workOrderId = Number(workOrderId);
    }

    if (materialId) {
      where.materialId = Number(materialId);
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

    const { count, rows } = await MaterialConsumption.findAndCountAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'code', 'name', 'unit', 'unitPrice'],
          include: [
            {
              model: MaterialCategory,
              as: 'category',
              attributes: ['id', 'name', 'code'],
            },
          ],
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'orderNo', 'productName', 'customerName', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    successResponse(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const getMaterialConsumptionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const consumption = await MaterialConsumption.findByPk(id, {
      include: [
        {
          model: Material,
          as: 'material',
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'orderNo', 'productName', 'customerName'],
        },
      ],
    });

    if (!consumption) {
      throw notFoundError('物料消耗记录不存在');
    }

    successResponse(res, consumption, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const updateMaterialConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { plannedQuantity, actualQuantity, wasteQuantity, unitPrice, remark } = req.body;

    const consumption = await MaterialConsumption.findByPk(id, { transaction: t });
    if (!consumption) {
      await t.rollback();
      throw notFoundError('物料消耗记录不存在');
    }

    const material = await Material.findByPk(consumption.materialId, { transaction: t });
    if (!material) {
      await t.rollback();
      throw notFoundError('物料不存在');
    }

    if (actualQuantity !== undefined && actualQuantity !== consumption.actualQuantity) {
      const quantityDiff = Number(actualQuantity) - Number(consumption.actualQuantity);
      const newStock = Number(material.currentStock) - quantityDiff;

      if (newStock < 0) {
        await t.rollback();
        throw badRequestError('物料库存不足');
      }

      const newStatus = newStock <= 0
        ? MATERIAL_STATUS.EXHAUSTED
        : newStock <= Number(material.minStock)
          ? MATERIAL_STATUS.LOW
          : material.status;

      await material.update(
        { currentStock: newStock, status: newStatus },
        { transaction: t }
      );
    }

    const effectiveUnitPrice = unitPrice || consumption.unitPrice;
    const effectiveActualQuantity = actualQuantity !== undefined ? actualQuantity : consumption.actualQuantity;
    const effectiveWasteQuantity = wasteQuantity !== undefined ? wasteQuantity : consumption.wasteQuantity;
    const totalCost = Number((effectiveActualQuantity + effectiveWasteQuantity) * Number(effectiveUnitPrice));

    await consumption.update(
      {
        plannedQuantity: plannedQuantity !== undefined ? plannedQuantity : consumption.plannedQuantity,
        actualQuantity: effectiveActualQuantity,
        wasteQuantity: effectiveWasteQuantity,
        unitPrice: effectiveUnitPrice,
        totalCost,
        remark: remark !== undefined ? remark : consumption.remark,
      },
      { transaction: t }
    );

    await t.commit();

    logger.info(`更新物料消耗成功: ID=${id}`);
    successResponse(res, consumption, '更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteMaterialConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const consumption = await MaterialConsumption.findByPk(id, { transaction: t });
    if (!consumption) {
      await t.rollback();
      throw notFoundError('物料消耗记录不存在');
    }

    if (consumption.actualQuantity > 0) {
      const material = await Material.findByPk(consumption.materialId, { transaction: t });
      if (material) {
        const newStock = Number(material.currentStock) + Number(consumption.actualQuantity);
        const newStatus = newStock <= 0
          ? MATERIAL_STATUS.EXHAUSTED
          : newStock <= Number(material.minStock)
            ? MATERIAL_STATUS.LOW
            : MATERIAL_STATUS.SUFFICIENT;

        await material.update(
          { currentStock: newStock, status: newStatus },
          { transaction: t }
        );
      }
    }

    await consumption.destroy({ transaction: t });

    await t.commit();

    logger.info(`删除物料消耗成功: ID=${id}`);
    successResponse(res, null, '删除成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMaterialLedger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, categoryId, workOrderId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    if (workOrderId) {
      where.workOrderId = Number(workOrderId);
    }

    const include: any[] = [
      {
        model: Material,
        as: 'material',
        attributes: ['id', 'code', 'name', 'unit'],
        include: [],
      },
      {
        model: WorkOrder,
        as: 'workOrder',
        attributes: ['id', 'orderNo', 'productName', 'customerName'],
      },
    ];

    if (categoryId) {
      include[0].include.push({
        model: MaterialCategory,
        as: 'category',
        where: { id: Number(categoryId) },
        attributes: ['id', 'name'],
        required: true,
      });
    } else {
      include[0].include.push({
        model: MaterialCategory,
        as: 'category',
        attributes: ['id', 'name'],
      });
    }

    const consumptions = await MaterialConsumption.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    const totalCost = consumptions.reduce((sum: number, item: any) => sum + Number(item.totalCost), 0);
    const totalActualQuantity = consumptions.reduce((sum: number, item: any) => sum + Number(item.actualQuantity), 0);
    const totalWasteQuantity = consumptions.reduce((sum: number, item: any) => sum + Number(item.wasteQuantity), 0);

    const categorySummary = new Map();
    consumptions.forEach((item: any) => {
      const category = item.material?.category;
      if (category) {
        const key = category.id;
        if (!categorySummary.has(key)) {
          categorySummary.set(key, {
            categoryId: category.id,
            categoryName: category.name,
            totalCost: 0,
            totalActualQuantity: 0,
            totalWasteQuantity: 0,
            count: 0,
          });
        }
        const summary = categorySummary.get(key);
        summary.totalCost += Number(item.totalCost);
        summary.totalActualQuantity += Number(item.actualQuantity);
        summary.totalWasteQuantity += Number(item.wasteQuantity);
        summary.count += 1;
      }
    });

    const ledger = {
      period: {
        startDate: startDate ? new Date(startDate as string) : null,
        endDate: endDate ? new Date(endDate as string) : null,
      },
      summary: {
        totalRecords: consumptions.length,
        totalCost,
        totalActualQuantity,
        totalWasteQuantity,
        wasteRate: totalActualQuantity > 0 ? ((totalWasteQuantity / totalActualQuantity) * 100).toFixed(2) + '%' : '0%',
      },
      categorySummaries: Array.from(categorySummary.values()),
      details: consumptions,
    };

    successResponse(res, ledger, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year, month } = req.query;

    const targetYear = year ? Number(year) : new Date().getFullYear();
    const startDate = month
      ? new Date(targetYear, Number(month) - 1, 1)
      : new Date(targetYear, 0, 1);
    const endDate = month
      ? new Date(targetYear, Number(month), 0, 23, 59, 59)
      : new Date(targetYear, 11, 31, 23, 59, 59);

    const where = {
      status: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.DELIVERED],
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };

    const workOrders = await WorkOrder.findAll({
      where,
      include: [
        {
          model: MaterialConsumption,
          as: 'materialConsumptions',
          attributes: ['totalCost'],
        },
      ],
    });

    const totalRevenue = workOrders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);
    const totalMaterialCost = workOrders.reduce((sum: number, order: any) => {
      return sum + order.materialConsumptions.reduce((s: number, c: any) => s + Number(c.totalCost), 0);
    }, 0);

    const grossProfit = totalRevenue - totalMaterialCost;
    const grossProfitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : '0';

    const revenue = {
      period: {
        year: targetYear,
        month: month ? Number(month) : null,
        startDate,
        endDate,
      },
      totalOrders: workOrders.length,
      totalRevenue,
      totalMaterialCost,
      grossProfit,
      grossProfitMargin: `${grossProfitMargin}%`,
    };

    successResponse(res, revenue, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderCost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workOrderId } = req.params;

    const workOrder = await WorkOrder.findByPk(workOrderId, {
      include: [
        {
          model: MaterialConsumption,
          as: 'materialConsumptions',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'code', 'name', 'unit'],
            },
          ],
        },
      ],
    });

    if (!workOrder) {
      throw notFoundError('工单不存在');
    }

    const totalMaterialCost = workOrder.materialConsumptions?.reduce((sum: number, item: any) => sum + Number(item.totalCost), 0) || 0;
    const totalActualQuantity = workOrder.materialConsumptions?.reduce((sum: number, item: any) => sum + Number(item.actualQuantity), 0) || 0;
    const totalWasteQuantity = workOrder.materialConsumptions?.reduce((sum: number, item: any) => sum + Number(item.wasteQuantity), 0) || 0;

    const costDetail = {
      workOrderId: workOrder.id,
      orderNo: workOrder.orderNo,
      productName: workOrder.productName,
      totalPrice: workOrder.totalPrice,
      materialCost: {
        totalMaterialCost,
        totalActualQuantity,
        totalWasteQuantity,
        details: workOrder.materialConsumptions,
      },
      grossProfit: Number(workOrder.totalPrice) - totalMaterialCost,
      grossProfitMargin: Number(workOrder.totalPrice) > 0
        ? (((Number(workOrder.totalPrice) - totalMaterialCost) / Number(workOrder.totalPrice)) * 100).toFixed(2) + '%'
        : '0%',
    };

    successResponse(res, costDetail, '获取成功');
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import CostSettlement from '../models/CostSettlement';
import CostDetail from '../models/CostDetail';
import WorkOrder from '../models/WorkOrder';
import WorkOrderMaterial from '../models/WorkOrderMaterial';
import Wine from '../models/Wine';
import Material from '../models/Material';
import ResponseUtil from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../database';
import dayjs from 'dayjs';
import { WorkOrderStatus } from '../constants';

export const getCostSettlementList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      wineId,
      workOrderId,
      startDate,
      endDate,
      minTotalCost,
      maxTotalCost,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const where: any = {};
    
    if (wineId) where.wineId = wineId;
    if (workOrderId) where.workOrderId = workOrderId;
    if (startDate || endDate) {
      where.settlementDate = {};
      if (startDate) where.settlementDate[Op.gte] = new Date(startDate as string);
      if (endDate) where.settlementDate[Op.lte] = new Date(endDate as string);
    }
    if (minTotalCost || maxTotalCost) {
      where.totalCost = {};
      if (minTotalCost) where.totalCost[Op.gte] = Number(minTotalCost);
      if (maxTotalCost) where.totalCost[Op.lte] = Number(maxTotalCost);
    }

    const order: any[] = [];
    if (sortBy && sortOrder) {
      order.push([sortBy as string, sortOrder as string]);
    }

    const { count, rows } = await CostSettlement.findAndCountAll({
      where,
      include: [
        {
          model: Wine,
          as: 'wine',
          attributes: ['id', 'batchNo', 'name', 'vintageYear'],
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'orderNo', 'name', 'status', 'actualQuantity'],
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

export const getCostSettlementById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const settlement = await CostSettlement.findByPk(id, {
      include: [
        {
          model: Wine,
          as: 'wine',
          attributes: ['id', 'batchNo', 'name', 'vintageYear', 'origin'],
        },
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'orderNo', 'name', 'status', 'targetQuantity', 'actualQuantity'],
          include: [
            {
              model: WorkOrderMaterial,
              as: 'materials',
              include: [{ model: Material, as: 'material', attributes: ['id', 'name', 'code', 'unit'] }],
            },
          ],
        },
        {
          model: CostDetail,
          as: 'costDetails',
          order: [['id', 'ASC']],
        },
      ],
    });

    if (!settlement) {
      throw new NotFoundError('结算记录不存在');
    }

    ResponseUtil.success(res, settlement);
  } catch (error) {
    next(error);
  }
};

export const createCostSettlement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { settlementNo, wineId, workOrderId, costDetails, ...settlementData } = req.body;

    const existingSettlement = await CostSettlement.findOne({ where: { settlementNo }, transaction });
    if (existingSettlement) {
      throw new BadRequestError('结算单号已存在');
    }

    const wine = await Wine.findByPk(wineId, { transaction });
    if (!wine) {
      throw new BadRequestError('酒品不存在');
    }

    if (workOrderId) {
      const workOrder = await WorkOrder.findByPk(workOrderId, { transaction });
      if (!workOrder) {
        throw new BadRequestError('工单不存在');
      }

      const existingWorkOrderSettlement = await CostSettlement.findOne({ 
        where: { workOrderId },
        transaction,
      });
      if (existingWorkOrderSettlement) {
        throw new BadRequestError('该工单已存在结算记录');
      }
    }

    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalStorageCost = 0;
    let totalOtherCost = 0;

    if (costDetails && costDetails.length > 0) {
      costDetails.forEach((detail: any) => {
        const costType = detail.costType || 'other';
        const totalPrice = Number(detail.totalPrice) || 0;
        
        switch (costType) {
          case 'material':
            totalMaterialCost += totalPrice;
            break;
          case 'labor':
            totalLaborCost += totalPrice;
            break;
          case 'storage':
            totalStorageCost += totalPrice;
            break;
          default:
            totalOtherCost += totalPrice;
        }
      });
    }

    const totalCost = totalMaterialCost + totalLaborCost + totalStorageCost + totalOtherCost;
    const unitCost = settlementData.quantity > 0 ? totalCost / settlementData.quantity : 0;

    const settlement = await CostSettlement.create(
      {
        ...settlementData,
        settlementNo,
        wineId,
        workOrderId,
        materialCost: totalMaterialCost,
        laborCost: totalLaborCost,
        storageCost: totalStorageCost,
        otherCost: totalOtherCost,
        totalCost,
        unitCost,
      },
      { transaction }
    );

    if (costDetails && costDetails.length > 0) {
      const details = costDetails.map((detail: any) => ({
        ...detail,
        settlementId: settlement.id,
      }));
      await CostDetail.bulkCreate(details, { transaction });
    }

    await transaction.commit();

    const createdSettlement = await CostSettlement.findByPk(settlement.id, {
      include: [
        { model: Wine, as: 'wine', attributes: ['id', 'batchNo', 'name'] },
        { model: CostDetail, as: 'costDetails' },
      ],
    });

    ResponseUtil.success(res, createdSettlement, '创建成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const autoGenerateSettlement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { workOrderId } = req.params;
    const workOrderIdNum = Number(workOrderId);

    const workOrder = await WorkOrder.findByPk(workOrderIdNum, {
      include: [
        { model: Wine, as: 'wine' },
        { 
          model: WorkOrderMaterial, 
          as: 'materials',
          include: [{ model: Material, as: 'material' }],
        },
      ],
      transaction,
    });

    if (!workOrder) {
      throw new NotFoundError('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestError('工单未完成，无法生成结算');
    }

    const existingSettlement = await CostSettlement.findOne({ 
      where: { workOrderId: workOrderIdNum },
      transaction,
    });
    if (existingSettlement) {
      throw new BadRequestError('该工单已生成结算记录');
    }

    let totalMaterialCost = 0;
    const costDetails: Array<{
      costType: string;
      materialId?: number;
      materialName?: string;
      quantity?: number;
      unit?: string;
      unitPrice?: number;
      totalPrice: number;
      description: string;
      settlementId?: number;
    }> = [];

    if (workOrder.materials && workOrder.materials.length > 0) {
      for (const material of workOrder.materials) {
        const unitPrice = Number(material.unitPrice || material.material?.unitPrice || 0);
        const quantity = Number(material.quantity || 0);
        const totalPrice = unitPrice * quantity;
        totalMaterialCost += totalPrice;

        costDetails.push({
          costType: 'material',
          materialId: material.materialId,
          materialName: material.material?.name,
          quantity: material.quantity,
          unit: material.material?.unit,
          unitPrice,
          totalPrice,
          description: `原料消耗：${material.material?.name || material.materialId}`,
        });
      }
    }

    const targetQuantity = Number(workOrder.actualQuantity || workOrder.targetQuantity || 0);
    const laborCost = targetQuantity * 10;
    const storageCost = targetQuantity * 5;
    const otherCost = 0;
    const totalCost = totalMaterialCost + laborCost + storageCost + otherCost;
    const unitCost = targetQuantity > 0 ? totalCost / targetQuantity : 0;

    costDetails.push({
      costType: 'labor',
      totalPrice: laborCost,
      description: '人工成本：酿造、调配、灌装等人工费用',
    });
    costDetails.push({
      costType: 'storage',
      totalPrice: storageCost,
      description: '仓储成本：恒温窖藏、库存管理等费用',
    });

    const settlementNo = `CS${dayjs().format('YYYYMMDDHHmmss')}`;

    const settlement = await CostSettlement.create(
      {
        settlementNo,
        wineId: workOrder.wineId,
        workOrderId: workOrderIdNum,
        materialCost: totalMaterialCost,
        laborCost,
        storageCost,
        otherCost,
        totalCost,
        unitCost,
        quantity: targetQuantity,
        settlementDate: new Date(),
        remarks: `自动生成：工单「${workOrder.name}」成本结算`,
      },
      { transaction }
    );

    const detailsToCreate = costDetails.map(detail => ({
      ...detail,
      settlementId: settlement.id,
    }));
    await CostDetail.bulkCreate(detailsToCreate, { transaction });

    await transaction.commit();

    const createdSettlement = await CostSettlement.findByPk(settlement.id, {
      include: [
        { model: Wine, as: 'wine', attributes: ['id', 'batchNo', 'name'] },
        { model: CostDetail, as: 'costDetails' },
      ],
    });

    ResponseUtil.success(res, createdSettlement, '自动生成结算成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateCostSettlement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { costDetails, ...updateData } = req.body;

    const settlement = await CostSettlement.findByPk(id, { transaction });
    if (!settlement) {
      throw new NotFoundError('结算记录不存在');
    }

    if (costDetails && costDetails.length > 0) {
      await CostDetail.destroy({ where: { settlementId: id }, transaction });
      
      let totalMaterialCost = 0;
      let totalLaborCost = 0;
      let totalStorageCost = 0;
      let totalOtherCost = 0;

      const details = costDetails.map((detail: any) => {
        const costType = detail.costType || 'other';
        const totalPrice = Number(detail.totalPrice) || 0;
        
        switch (costType) {
          case 'material':
            totalMaterialCost += totalPrice;
            break;
          case 'labor':
            totalLaborCost += totalPrice;
            break;
          case 'storage':
            totalStorageCost += totalPrice;
            break;
          default:
            totalOtherCost += totalPrice;
        }

        return {
          ...detail,
          settlementId: id,
        };
      });

      await CostDetail.bulkCreate(details, { transaction });

      const totalCost = totalMaterialCost + totalLaborCost + totalStorageCost + totalOtherCost;
      const quantity = updateData.quantity || settlement.quantity || 1;
      const unitCost = totalCost / quantity;

      await settlement.update(
        {
          ...updateData,
          materialCost: totalMaterialCost,
          laborCost: totalLaborCost,
          storageCost: totalStorageCost,
          otherCost: totalOtherCost,
          totalCost,
          unitCost,
        },
        { transaction }
      );
    } else {
      await settlement.update(updateData, { transaction });
    }

    await transaction.commit();

    const updatedSettlement = await CostSettlement.findByPk(id, {
      include: [
        { model: Wine, as: 'wine', attributes: ['id', 'batchNo', 'name'] },
        { model: CostDetail, as: 'costDetails' },
      ],
    });

    ResponseUtil.success(res, updatedSettlement, '更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteCostSettlement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const settlement = await CostSettlement.findByPk(id, { transaction });
    if (!settlement) {
      throw new NotFoundError('结算记录不存在');
    }

    await CostDetail.destroy({ where: { settlementId: id }, transaction });
    await settlement.destroy({ transaction });

    await transaction.commit();
    ResponseUtil.success(res, null, '删除成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getCostStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, wineId, periodType = 'month' } = req.query;
    const where: any = {};
    
    if (startDate || endDate) {
      where.settlementDate = {};
      if (startDate) where.settlementDate[Op.gte] = new Date(startDate as string);
      if (endDate) where.settlementDate[Op.lte] = new Date(endDate as string);
    }
    if (wineId) where.wineId = wineId;

    const totalSettlements = await CostSettlement.count({ where });

    const [totalCostSum = 0, materialCostSum = 0, laborCostSum = 0, storageCostSum = 0, otherCostSum = 0] = await Promise.all([
      CostSettlement.sum('totalCost', { where }),
      CostSettlement.sum('materialCost', { where }),
      CostSettlement.sum('laborCost', { where }),
      CostSettlement.sum('storageCost', { where }),
      CostSettlement.sum('otherCost', { where }),
    ]);

    const totalQuantitySum = await CostSettlement.sum('quantity', { where }) || 0;
    const avgUnitCost = totalQuantitySum > 0 ? totalCostSum / totalQuantitySum : 0;

    const costTrend = await CostSettlement.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('settlementDate'), '%Y-%m'), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      ],
      where,
      group: ['period'],
      order: [['period', 'DESC']],
      limit: 12,
    });

    const costByType = {
      material: Number(materialCostSum.toFixed(2)),
      labor: Number(laborCostSum.toFixed(2)),
      storage: Number(storageCostSum.toFixed(2)),
      other: Number(otherCostSum.toFixed(2)),
    };

    ResponseUtil.success(res, {
      summary: {
        totalSettlements,
        totalCost: Number(totalCostSum.toFixed(2)),
        totalQuantity: Number(totalQuantitySum.toFixed(2)),
        avgUnitCost: Number(avgUnitCost.toFixed(2)),
      },
      costByType,
      costDistribution: {
        materialPercent: totalCostSum > 0 ? Number(((materialCostSum / totalCostSum) * 100).toFixed(2)) : 0,
        laborPercent: totalCostSum > 0 ? Number(((laborCostSum / totalCostSum) * 100).toFixed(2)) : 0,
        storagePercent: totalCostSum > 0 ? Number(((storageCostSum / totalCostSum) * 100).toFixed(2)) : 0,
        otherPercent: totalCostSum > 0 ? Number(((otherCostSum / totalCostSum) * 100).toFixed(2)) : 0,
      },
      trend: costTrend.map((item: any) => ({
        period: item.getDataValue('period'),
        count: item.getDataValue('count'),
        totalCost: Number(item.getDataValue('totalCost').toFixed(2)),
        totalQuantity: Number(item.getDataValue('totalQuantity').toFixed(2)),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getWineCostAnalysis = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { wineId } = req.params;

    const wine = await Wine.findByPk(wineId);
    if (!wine) {
      throw new NotFoundError('酒品不存在');
    }

    const settlements = await CostSettlement.findAll({
      where: { wineId },
      include: [
        {
          model: WorkOrder,
          as: 'workOrder',
          attributes: ['id', 'orderNo', 'name'],
        },
        { model: CostDetail, as: 'costDetails' },
      ],
      order: [['settlementDate', 'DESC']],
    });

    const totalCost = settlements.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
    const totalQuantity = settlements.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
    const avgUnitCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    ResponseUtil.success(res, {
      wine: {
        id: wine.id,
        batchNo: wine.batchNo,
        name: wine.name,
        vintageYear: wine.vintageYear,
      },
      summary: {
        settlementCount: settlements.length,
        totalCost: Number(totalCost.toFixed(2)),
        totalQuantity: Number(totalQuantity.toFixed(2)),
        avgUnitCost: Number(avgUnitCost.toFixed(2)),
      },
      settlements: settlements.map((s: any) => ({
        id: s.id,
        settlementNo: s.settlementNo,
        workOrder: s.workOrder,
        settlementDate: s.settlementDate,
        totalCost: Number(s.totalCost.toFixed(2)),
        unitCost: Number(s.unitCost.toFixed(2)),
        quantity: Number(s.quantity.toFixed(2)),
        detailCount: s.costDetails?.length || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

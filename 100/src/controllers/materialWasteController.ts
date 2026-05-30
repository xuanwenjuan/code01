import { Request, Response } from 'express';
import { MaterialWaste, MaterialStock, WorkOrder, sequelize } from '../models';
import { success, badRequest, notFound } from '../utils/response';
import { generateWasteNo } from '../utils/batchNo';
import { MaterialStatus, UserRole } from '../types';

export async function reportWaste(req: Request, res: Response) {
  const { workOrderId, materialStockId, quantity, wasteReason, wasteType, remark } = req.body;

  const order = await WorkOrder.findByPk(workOrderId);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  const stock = await MaterialStock.findByPk(materialStockId);
  if (!stock) {
    return res.status(404).json(notFound('原料库存不存在'));
  }

  if (Number(stock.quantity) < Number(quantity)) {
    return res.status(400).json(badRequest('库存数量不足'));
  }

  const t = await sequelize.transaction();

  try {
    const wasteNo = generateWasteNo();
    const totalCost = Number(quantity) * Number(stock.unitPrice);

    const waste = await MaterialWaste.create({
      wasteNo,
      workOrderId,
      materialStockId,
      categoryId: stock.categoryId,
      materialName: stock.name,
      quantity,
      unit: stock.unit,
      unitPrice: stock.unitPrice,
      totalCost,
      wasteReason,
      wasteType,
      reportedById: req.user!.userId,
      isVerified: false,
      remark
    }, { transaction: t });

    const newQuantity = Number(stock.quantity) - Number(quantity);
    await stock.update({
      quantity: newQuantity,
      status: newQuantity <= 0 ? MaterialStatus.NEED_RESTOCK : stock.status
    }, { transaction: t });

    await t.commit();
    res.json(success(waste, '损耗上报成功，等待审核'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function verifyWaste(req: Request, res: Response) {
  const { id } = req.params;
  const { passed, remark } = req.body;

  const waste = await MaterialWaste.findByPk(id);
  if (!waste) {
    return res.status(404).json(notFound('损耗记录不存在'));
  }

  if (waste.isVerified) {
    return res.status(400).json(badRequest('该损耗记录已审核'));
  }

  await waste.update({
    isVerified: passed,
    verifiedById: req.user!.userId,
    verifiedAt: new Date(),
    remark: remark ? `${waste.remark || ''}; 审核备注: ${remark}` : waste.remark
  });

  res.json(success(null, passed ? '损耗审核通过' : '损耗审核驳回'));
}

export async function getWasteList(req: Request, res: Response) {
  const { workOrderId, isVerified, wasteType, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (workOrderId) where.workOrderId = workOrderId;
  if (isVerified !== undefined) where.isVerified = isVerified;
  if (wasteType) where.wasteType = wasteType;

  const { count, rows } = await MaterialWaste.findAndCountAll({
    where,
    include: [
      { model: MaterialStock, attributes: ['name', 'batchNo'] },
      { model: WorkOrder, attributes: ['orderNo', 'bookName'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
}

export async function getWasteDetail(req: Request, res: Response) {
  const { id } = req.params;

  const waste = await MaterialWaste.findByPk(id, {
    include: [
      { model: MaterialStock },
      { model: WorkOrder }
    ]
  });

  if (!waste) {
    return res.status(404).json(notFound('损耗记录不存在'));
  }

  res.json(success(waste));
}

export async function getWasteStatistics(req: Request, res: Response) {
  const { workOrderId, startDate, endDate } = req.query;

  const where: any = { isVerified: true };
  if (workOrderId) where.workOrderId = workOrderId;
  if (startDate && endDate) {
    where.createdAt = { [require('sequelize').Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
  }

  const stats = await MaterialWaste.findAll({
    attributes: [
      'wasteType',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost']
    ],
    where,
    group: ['wasteType']
  });

  const totalStats = await MaterialWaste.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost']
    ],
    where
  });

  res.json(success({ stats, total: totalStats[0] }));
}

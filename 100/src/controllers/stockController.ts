import { Request, Response } from 'express';
import { MaterialStock, MaterialCategory, sequelize } from '../models';
import { success, badRequest, notFound } from '../utils/response';
import { generateBatchNo } from '../utils/batchNo';
import { MaterialStatus, CategoryStatus, MaterialGrade } from '../types';
import { Op } from 'sequelize';
import dayjs from 'dayjs';

async function isCategoryOrParentSealed(categoryId: number): Promise<boolean> {
  const category = await MaterialCategory.findByPk(categoryId);
  if (!category) return true;

  if (category.status === CategoryStatus.SEALED) {
    return true;
  }

  if (category.parentId) {
    return isCategoryOrParentSealed(category.parentId);
  }

  return false;
}

export async function createStock(req: Request, res: Response) {
  const {
    categoryId, name, origin, weight, grade, storageYears,
    quantity, unit, unitPrice, expireDate, location, remark
  } = req.body;

  const category = await MaterialCategory.findByPk(categoryId);
  if (!category) {
    return res.status(400).json(badRequest('物料类目不存在'));
  }

  const isSealed = await isCategoryOrParentSealed(categoryId);
  if (isSealed) {
    return res.status(400).json(badRequest('该类目或其父级类目已停供封存，无法入库'));
  }

  let status = MaterialStatus.SUFFICIENT;
  if (expireDate && dayjs(expireDate).isBefore(dayjs())) {
    status = MaterialStatus.EXPIRED;
  } else if (Number(quantity) <= 0) {
    status = MaterialStatus.NEED_RESTOCK;
  }

  const batchNo = generateBatchNo();

  const stock = await MaterialStock.create({
    batchNo,
    categoryId,
    name,
    origin,
    weight,
    grade: grade || MaterialGrade.STANDARD,
    storageYears: storageYears || 0,
    quantity,
    unit,
    unitPrice,
    status,
    expireDate,
    location,
    remark,
    operatorId: req.user?.userId
  });

  res.json(success(stock, '入库成功'));
}

export async function updateStock(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;

  const stock = await MaterialStock.findByPk(id);
  if (!stock) {
    return res.status(404).json(notFound('库存记录不存在'));
  }

  if (data.categoryId && data.categoryId !== stock.categoryId) {
    const category = await MaterialCategory.findByPk(data.categoryId);
    if (!category) {
      return res.status(400).json(badRequest('物料类目不存在'));
    }

    const isSealed = await isCategoryOrParentSealed(data.categoryId);
    if (isSealed) {
      return res.status(400).json(badRequest('目标类目或其父级类目已停供封存，无法变更类目'));
    }
  }

  let status = stock.status;
  if (data.quantity !== undefined) {
    if (Number(data.quantity) <= 0) {
      status = MaterialStatus.NEED_RESTOCK;
    } else if (stock.expireDate && dayjs(stock.expireDate).isBefore(dayjs())) {
      status = MaterialStatus.EXPIRED;
    } else {
      status = MaterialStatus.SUFFICIENT;
    }
  }

  if (data.expireDate !== undefined && dayjs(data.expireDate).isBefore(dayjs())) {
    status = MaterialStatus.EXPIRED;
  }

  await stock.update({
    ...data,
    status,
    operatorId: req.user?.userId
  });

  res.json(success(stock, '更新成功'));
}

export async function deleteStock(req: Request, res: Response) {
  const { id } = req.params;

  const count = await MaterialStock.count({ where: { id } });
  if (count === 0) {
    return res.status(404).json(notFound('库存记录不存在'));
  }

  await MaterialStock.destroy({ where: { id } });
  res.json(success(null, '删除成功'));
}

export async function getStockList(req: Request, res: Response) {
  const {
    status, categoryId, grade, keyword, origin,
    minQuantity, maxQuantity, startDate, endDate,
    page = 1, pageSize = 10
  } = req.query;

  const where: any = {};

  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (grade) where.grade = grade;
  if (origin) where.origin = { [Op.like]: `%${origin}%` };

  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { batchNo: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (minQuantity !== undefined || maxQuantity !== undefined) {
    where.quantity = {};
    if (minQuantity !== undefined) where.quantity[Op.gte] = Number(minQuantity);
    if (maxQuantity !== undefined) where.quantity[Op.lte] = Number(maxQuantity);
  }

  if (startDate && endDate) {
    where.createdAt = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
  }

  const { count, rows } = await MaterialStock.findAndCountAll({
    where,
    include: [{ model: MaterialCategory, attributes: ['name', 'code', 'status'] }],
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

export async function getStockDetail(req: Request, res: Response) {
  const { id } = req.params;

  const stock = await MaterialStock.findByPk(id, {
    include: [{ model: MaterialCategory, attributes: ['name', 'code', 'status'] }]
  });

  if (!stock) {
    return res.status(404).json(notFound('库存记录不存在'));
  }

  res.json(success(stock));
}

export async function getExpiringStocks(req: Request, res: Response) {
  const { days = 30 } = req.query;
  const warningDate = dayjs().add(Number(days), 'day').toDate();
  const today = dayjs().toDate();

  const stocks = await MaterialStock.findAll({
    where: {
      expireDate: { [Op.between]: [today, warningDate] },
      status: { [Op.ne]: MaterialStatus.EXPIRED }
    },
    include: [{ model: MaterialCategory, attributes: ['name', 'code'] }],
    order: [['expireDate', 'ASC']]
  });

  res.json(success({
    list: stocks,
    warningDays: Number(days),
    expiringCount: stocks.length
  }));
}

export async function updateStockStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, remark } = req.body;

  const stock = await MaterialStock.findByPk(id);
  if (!stock) {
    return res.status(404).json(notFound('库存记录不存在'));
  }

  if (status === MaterialStatus.EXPIRED) {
    const category = await MaterialCategory.findByPk(stock.categoryId);
    if (category && category.status === CategoryStatus.SEALED) {
      return res.status(400).json(badRequest('该类目已停供封存，请先启用类目'));
    }
  }

  await stock.update({ status, operatorId: req.user?.userId });
  res.json(success(null, '状态更新成功'));
}

export async function getStockStatistics(req: Request, res: Response) {
  const stats = await MaterialStock.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.literal('quantity * unitPrice')), 'totalValue']
    ],
    group: ['status']
  });

  const gradeStats = await MaterialStock.findAll({
    attributes: [
      'grade',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.literal('quantity * unitPrice')), 'totalValue']
    ],
    group: ['grade']
  });

  const categoryStats = await MaterialStock.findAll({
    attributes: [
      'categoryId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
    ],
    include: [{ model: MaterialCategory, attributes: ['name', 'code'] }],
    group: ['categoryId']
  });

  const totalStats = await MaterialStock.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.literal('quantity * unitPrice')), 'totalValue']
    ]
  });

  res.json(success({
    statusBreakdown: stats,
    gradeBreakdown: gradeStats,
    categoryBreakdown: categoryStats,
    summary: totalStats[0]
  }));
}

export async function stockIn(req: Request, res: Response) {
  const { id } = req.params;
  const { quantity, remark } = req.body;

  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json(badRequest('入库数量必须大于0'));
  }

  const stock = await MaterialStock.findByPk(id);
  if (!stock) {
    return res.status(404).json(notFound('库存记录不存在'));
  }

  const isSealed = await isCategoryOrParentSealed(stock.categoryId);
  if (isSealed) {
    return res.status(400).json(badRequest('该类目或其父级类目已停供封存，无法入库'));
  }

  const newQuantity = Number(stock.quantity) + Number(quantity);
  let status = stock.status;

  if (newQuantity > 0 && stock.status === MaterialStatus.NEED_RESTOCK) {
    status = MaterialStatus.SUFFICIENT;
  }

  await stock.update({
    quantity: newQuantity,
    status,
    operatorId: req.user?.userId
  });

  res.json(success({
    beforeQuantity: stock.quantity,
    inQuantity: quantity,
    afterQuantity: newQuantity
  }, '入库成功'));
}

export async function stockOut(req: Request, res: Response) {
  const { id } = req.params;
  const { quantity, remark } = req.body;

  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json(badRequest('出库数量必须大于0'));
  }

  const stock = await MaterialStock.findByPk(id);
  if (!stock) {
    return res.status(404).json(notFound('库存记录不存在'));
  }

  if (Number(stock.quantity) < Number(quantity)) {
    return res.status(400).json(badRequest('库存不足'));
  }

  const newQuantity = Number(stock.quantity) - Number(quantity);
  let status = stock.status;

  if (newQuantity <= 0) {
    status = MaterialStatus.NEED_RESTOCK;
  }

  await stock.update({
    quantity: newQuantity,
    status,
    operatorId: req.user?.userId
  });

  res.json(success({
    beforeQuantity: stock.quantity,
    outQuantity: quantity,
    afterQuantity: newQuantity
  }, '出库成功'));
}

export async function batchUpdateStatus(req: Request, res: Response) {
  const { ids, status, remark } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(badRequest('请选择要更新的库存记录'));
  }

  const t = await sequelize.transaction();

  try {
    await MaterialStock.update(
      { status, operatorId: req.user?.userId },
      { where: { id: { [Op.in]: ids } }, transaction: t }
    );

    await t.commit();
    res.json(success({ updatedCount: ids.length }, '批量更新成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Ingredient, StockLoss, Supplier } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole, StockStatus } from '../types';

export const createIngredient = async (req: Request, res: Response) => {
  const { name, category, unit, currentStock, safetyStock, warningThreshold, unitPrice, supplierId, storeId, batchNo, productionDate, expiryDate, alertDaysBeforeExpiry } = req.body;

  if (!name || !unit || unitPrice === undefined) {
    throw new BadRequestException('缺少必填参数');
  }

  if (supplierId) {
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      throw new BadRequestException('供应商不存在');
    }
  }

  const ingredient = await Ingredient.create({
    name,
    category,
    unit,
    currentStock: currentStock || 0,
    safetyStock: safetyStock || 0,
    warningThreshold: warningThreshold || safetyStock * 0.5,
    unitPrice,
    supplierId,
    status: StockStatus.IN_STOCK,
    storeId,
    batchNo,
    productionDate,
    expiryDate,
    alertDaysBeforeExpiry: alertDaysBeforeExpiry || 7
  });

  res.status(201).json(ResponseUtil.created(ingredient, '原料创建成功'));
};

export const updateIngredient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, unit, currentStock, safetyStock, warningThreshold, unitPrice, supplierId, status, storeId, batchNo, productionDate, expiryDate, alertDaysBeforeExpiry } = req.body;

  const ingredient = await Ingredient.findByPk(id);
  if (!ingredient) {
    throw new NotFoundException('原料不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && ingredient.storeId && ingredient.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此原料');
  }

  if (supplierId) {
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      throw new BadRequestException('供应商不存在');
    }
  }

  await ingredient.update({
    name: name || ingredient.name,
    category: category !== undefined ? category : ingredient.category,
    unit: unit || ingredient.unit,
    currentStock: currentStock !== undefined ? currentStock : ingredient.currentStock,
    safetyStock: safetyStock !== undefined ? safetyStock : ingredient.safetyStock,
    warningThreshold: warningThreshold !== undefined ? warningThreshold : ingredient.warningThreshold,
    unitPrice: unitPrice !== undefined ? unitPrice : ingredient.unitPrice,
    supplierId: supplierId !== undefined ? supplierId : ingredient.supplierId,
    status: status || ingredient.status,
    storeId: storeId !== undefined ? storeId : ingredient.storeId,
    batchNo: batchNo !== undefined ? batchNo : ingredient.batchNo,
    productionDate: productionDate !== undefined ? productionDate : ingredient.productionDate,
    expiryDate: expiryDate !== undefined ? expiryDate : ingredient.expiryDate,
    alertDaysBeforeExpiry: alertDaysBeforeExpiry !== undefined ? alertDaysBeforeExpiry : ingredient.alertDaysBeforeExpiry
  });

  res.json(ResponseUtil.success(ingredient, '原料更新成功'));
};

export const updateStock = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, operatorName, batchNo, productionDate, expiryDate } = req.body;

  if (quantity === undefined) {
    throw new BadRequestException('请指定库存数量');
  }

  const ingredient = await Ingredient.findByPk(id);
  if (!ingredient) {
    throw new NotFoundException('原料不存在');
  }

  const newStock = Number(ingredient.currentStock) + Number(quantity);
  let newStatus = ingredient.status;

  if (newStock <= 0) {
    newStatus = StockStatus.OUT_OF_STOCK;
  } else if (newStock <= Number(ingredient.warningThreshold)) {
    newStatus = StockStatus.LOW_STOCK;
  } else {
    newStatus = StockStatus.IN_STOCK;
  }

  const updateData: any = {
    currentStock: newStock,
    status: newStatus
  };
  
  if (batchNo) updateData.batchNo = batchNo;
  if (productionDate) updateData.productionDate = productionDate;
  if (expiryDate) updateData.expiryDate = expiryDate;

  await ingredient.update(updateData);

  res.json(ResponseUtil.success(ingredient, '库存更新成功'));
};

export const recordLoss = async (req: Request, res: Response) => {
  const { ingredientId, quantity, unit, lossType, reason, operatorName, storeId } = req.body;

  if (!ingredientId || !quantity || !lossType) {
    throw new BadRequestException('缺少必填参数');
  }

  const ingredient = await Ingredient.findByPk(ingredientId);
  if (!ingredient) {
    throw new BadRequestException('原料不存在');
  }

  const stockLoss = await StockLoss.create({
    ingredientId,
    ingredientName: ingredient.name,
    quantity,
    unit: unit || ingredient.unit,
    lossType,
    reason,
    operatorId: req.user?.userId,
    operatorName: operatorName || req.user?.username,
    storeId: storeId || ingredient.storeId
  });

  const newStock = Number(ingredient.currentStock) - Number(quantity);
  await ingredient.update({ currentStock: Math.max(0, newStock) });

  res.status(201).json(ResponseUtil.created(stockLoss, '损耗记录成功'));
};

export const deleteIngredient = async (req: Request, res: Response) => {
  const { id } = req.params;

  const ingredient = await Ingredient.findByPk(id);
  if (!ingredient) {
    throw new NotFoundException('原料不存在');
  }

  await ingredient.destroy();

  res.json(ResponseUtil.success(null, '原料删除成功'));
};

export const getIngredient = async (req: Request, res: Response) => {
  const { id } = req.params;

  const ingredient = await Ingredient.findByPk(id, {
    include: [{ model: Supplier, as: 'supplier' }]
  });

  if (!ingredient) {
    throw new NotFoundException('原料不存在');
  }

  res.json(ResponseUtil.success(ingredient));
};

export const getIngredientList = async (req: Request, res: Response) => {
  const { category, status, keyword, page = 1, pageSize = 10, storeId, minStock, maxStock, expiringWithinDays } = req.query;

  const where: any = {};
  
  if (category) {
    where.category = category;
  }
  if (status) {
    where.status = status;
  }
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }
  if (storeId) {
    where.storeId = storeId;
  }
  
  if (minStock !== undefined) {
    where.currentStock = where.currentStock || {};
    where.currentStock[Op.gte] = Number(minStock);
  }
  if (maxStock !== undefined) {
    where.currentStock = where.currentStock || {};
    where.currentStock[Op.lte] = Number(maxStock);
  }
  
  if (expiringWithinDays) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(expiringWithinDays));
    where.expiryDate = { [Op.lte]: expiryDate };
  }

  const { count, rows } = await Ingredient.findAndCountAll({
    where,
    include: [{ model: Supplier, as: 'supplier' }],
    order: [['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.pagination(rows, count, Number(page), Number(pageSize)));
};

export const getLowStockAlert = async (req: Request, res: Response) => {
  const { storeId, includeExpired } = req.query;

  const where: any = {
    [Op.or]: [
      { status: { [Op.in]: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] } },
      { currentStock: { [Op.lte]: Sequelize.col('warningThreshold') } }
    ]
  };
  
  if (storeId) {
    where.storeId = storeId;
  }

  const lowStockItems = await Ingredient.findAll({
    where,
    include: [{ model: Supplier, as: 'supplier' }],
    order: [['currentStock', 'ASC']]
  });

  res.json(ResponseUtil.success(lowStockItems));
};

export const getExpiryAlert = async (req: Request, res: Response) => {
  const { storeId, days = 7 } = req.query;

  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + Number(days));

  const where: any = {
    expiryDate: {
      [Op.lte]: alertDate
    }
  };

  if (storeId) {
    where.storeId = storeId;
  }

  const expiringItems = await Ingredient.findAll({
    where,
    include: [{ model: Supplier, as: 'supplier' }],
    order: [['expiryDate', 'ASC']]
  });

  const result = expiringItems.map(item => {
    const daysRemaining = Math.ceil((new Date(item.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      ...item.toJSON(),
      daysRemaining,
      alertType: daysRemaining <= 0 ? 'expired' : daysRemaining <= 3 ? 'urgent' : 'warning'
    };
  });

  res.json(ResponseUtil.success(result));
};

export const getStockStatusSummary = async (req: Request, res: Response) => {
  const { storeId } = req.query;

  const where: any = {};
  if (storeId) {
    where.storeId = storeId;
  }

  const totalItems = await Ingredient.count({ where });
  const inStock = await Ingredient.count({ where: { ...where, status: StockStatus.IN_STOCK } });
  const lowStock = await Ingredient.count({ where: { ...where, status: StockStatus.LOW_STOCK } });
  const outOfStock = await Ingredient.count({ where: { ...where, status: StockStatus.OUT_OF_STOCK } });

  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + 7);
  const expiringSoon = await Ingredient.count({
    where: {
      ...where,
      expiryDate: { [Op.lte]: alertDate }
    }
  });

  const totalValue = await Ingredient.sum('unitPrice', { where });
  const avgStock = await Ingredient.avg('currentStock', { where });

  res.json(ResponseUtil.success({
    totalItems,
    inStock,
    lowStock,
    outOfStock,
    expiringSoon,
    totalValue: Number(totalValue) || 0,
    avgStock: Number(avgStock) || 0,
    alertCount: lowStock + outOfStock + expiringSoon
  }));
};

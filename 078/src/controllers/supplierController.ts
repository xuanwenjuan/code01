import { Response } from 'express';
import { Op, Transaction, fn, col } from 'sequelize';
import sequelize from '../config/database';
import Supplier from '../models/Supplier';
import BenefitProduct from '../models/BenefitProduct';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const getSupplierList = async (req: AuthRequest, res: Response) => {
  const { 
    name, 
    status, 
    contactPerson, 
    phone,
    minScore,
    maxScore,
    qualificationExpireStart,
    qualificationExpireEnd,
    supplyCategory,
    coverageArea,
    page = 1, 
    pageSize = 10 
  } = req.query;

  const where: any = {};
  
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (contactPerson) {
    where.contactPerson = { [Op.like]: `%${contactPerson}%` };
  }
  if (phone) {
    where.contactPhone = { [Op.like]: `%${phone}%` };
  }
  if (status !== undefined && status !== '') {
    where.status = status;
  }
  if (minScore !== undefined && minScore !== '') {
    where.performanceScore = { ...where.performanceScore, [Op.gte]: Number(minScore) };
  }
  if (maxScore !== undefined && maxScore !== '') {
    where.performanceScore = { ...where.performanceScore, [Op.lte]: Number(maxScore) };
  }
  if (qualificationExpireStart && qualificationExpireEnd) {
    where.qualificationExpireDate = {
      [Op.between]: [new Date(qualificationExpireStart as string), new Date(qualificationExpireEnd as string)]
    };
  }
  if (supplyCategory) {
    where.supplyCategories = {
      [Op.like]: `%${supplyCategory}%`
    };
  }
  if (coverageArea) {
    where.coverageAreas = {
      [Op.like]: `%${coverageArea}%`
    };
  }

  const { count, rows } = await Supplier.findAndCountAll({
    where,
    order: [['sort', 'ASC'], ['id', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  const listWithParsedData = rows.map(supplier => {
    const supplierData = supplier.toJSON();
    try {
      supplierData.supplyCategories = supplier.supplyCategories ? JSON.parse(supplier.supplyCategories) : [];
      supplierData.coverageAreas = supplier.coverageAreas ? JSON.parse(supplier.coverageAreas) : [];
    } catch {
      supplierData.supplyCategories = [];
      supplierData.coverageAreas = [];
    }
    return supplierData;
  });

  res.json(ResponseUtil.success({
    list: listWithParsedData,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const getSupplierById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const supplier = await Supplier.findByPk(id, {
    include: [{
      model: BenefitProduct,
      as: 'products',
      attributes: ['id', 'name', 'code', 'price', 'stock', 'status']
    }]
  });

  if (!supplier) {
    throw new AppError('供应商不存在', 404);
  }

  const supplierData = supplier.toJSON();
  try {
    supplierData.supplyCategories = supplier.supplyCategories ? JSON.parse(supplier.supplyCategories) : [];
    supplierData.coverageAreas = supplier.coverageAreas ? JSON.parse(supplier.coverageAreas) : [];
  } catch {
    supplierData.supplyCategories = [];
    supplierData.coverageAreas = [];
  }
  if (supplier.qualificationExpireDate) {
    const today = new Date();
    const expireDate = new Date(supplier.qualificationExpireDate);
    const daysUntilExpire = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    supplierData.daysUntilExpire = daysUntilExpire;
    supplierData.isExpiringSoon = daysUntilExpire > 0 && daysUntilExpire <= 30;
    supplierData.isExpired = daysUntilExpire < 0;
  }

  res.json(ResponseUtil.success(supplierData));
};

export const createSupplier = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { code, supplyCategories, coverageAreas } = req.body;

    const existingSupplier = await Supplier.findOne({ 
      where: { code },
      transaction: t
    });
    if (existingSupplier) {
      await t.rollback();
      throw new AppError('供应商编码已存在', 400);
    }

    const supplierData = {
      ...req.body,
      supplyCategories: supplyCategories ? JSON.stringify(supplyCategories) : null,
      coverageAreas: coverageAreas ? JSON.stringify(coverageAreas) : null
    };

    const supplier = await Supplier.create(supplierData, { transaction: t });
    await t.commit();

    logger.info(`供应商创建成功: ID=${supplier.id}, 名称=${supplier.name}, 创建人=${req.user?.username}`);
    res.json(ResponseUtil.success(supplier, '创建成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { code, supplyCategories, coverageAreas } = req.body;

    const supplier = await Supplier.findByPk(id, { transaction: t });
    if (!supplier) {
      await t.rollback();
      throw new AppError('供应商不存在', 404);
    }

    if (code) {
      const existingSupplier = await Supplier.findOne({
        where: { code, id: { [Op.ne]: id } },
        transaction: t
      });
      if (existingSupplier) {
        await t.rollback();
        throw new AppError('供应商编码已存在', 400);
      }
    }

    const updateData: any = { ...req.body };
    if (supplyCategories !== undefined) {
      updateData.supplyCategories = supplyCategories ? JSON.stringify(supplyCategories) : null;
    }
    if (coverageAreas !== undefined) {
      updateData.coverageAreas = coverageAreas ? JSON.stringify(coverageAreas) : null;
    }

    await supplier.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`供应商更新成功: ID=${id}, 名称=${supplier.name}, 操作人=${req.user?.username}`);
    res.json(ResponseUtil.success(supplier, '更新成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id, { transaction: t });
    if (!supplier) {
      await t.rollback();
      throw new AppError('供应商不存在', 404);
    }

    const productCount = await BenefitProduct.count({ 
      where: { supplierId: id },
      transaction: t
    });
    if (productCount > 0) {
      await t.rollback();
      throw new AppError(`该供应商下还有 ${productCount} 个商品，不能删除`, 400);
    }

    await supplier.destroy({ transaction: t });
    await t.commit();

    logger.info(`供应商删除成功: ID=${id}, 名称=${supplier.name}, 操作人=${req.user?.username}`);
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getExpiringSuppliers = async (req: AuthRequest, res: Response) => {
  const { days = 30 } = req.query;
  
  const today = new Date();
  const expireDate = new Date(today.getTime() + Number(days) * 24 * 60 * 60 * 1000);

  const suppliers = await Supplier.findAll({
    where: {
      qualificationExpireDate: {
        [Op.between]: [today, expireDate]
      },
      status: 1
    },
    order: [['qualificationExpireDate', 'ASC']]
  });

  const suppliersWithDays = suppliers.map(supplier => {
    const supplierData = supplier.toJSON();
    const expireDate = new Date(supplier.qualificationExpireDate!);
    supplierData.daysUntilExpire = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return supplierData;
  });

  res.json(ResponseUtil.success(suppliersWithDays));
};

export const updatePerformanceScore = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { score, reason } = req.body;

  if (score < 0 || score > 5) {
    throw new AppError('评分必须在0-5之间', 400);
  }

  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    throw new AppError('供应商不存在', 404);
  }

  await supplier.update({ performanceScore: score });
  
  logger.info(`供应商评分更新: ID=${id}, 名称=${supplier.name}, 新评分=${score}, 原因=${reason}, 操作人=${req.user?.username}`);
  res.json(ResponseUtil.success(null, '评分更新成功'));
};

export const toggleSupplierStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    throw new AppError('供应商不存在', 404);
  }

  await supplier.update({ status });

  logger.info(`供应商状态变更: ID=${id}, 名称=${supplier.name}, 新状态=${status}, 操作人=${req.user?.username}`);
  res.json(ResponseUtil.success(null, status === 1 ? '已启用' : '已禁用'));
};

export const getSupplierStatistics = async (req: AuthRequest, res: Response) => {
  const totalCount = await Supplier.count();
  const activeCount = await Supplier.count({ where: { status: 1 } });
  const expiredCount = await Supplier.count({
    where: {
      qualificationExpireDate: { [Op.lt]: new Date() },
      status: 1
    }
  });
  const expiringCount = await Supplier.count({
    where: {
      qualificationExpireDate: {
        [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      },
      status: 1
    }
  });

  const scoreStats = await Supplier.findAll({
    attributes: [
      [fn('AVG', col('performanceScore')), 'avgScore'],
      [fn('MIN', col('performanceScore')), 'minScore'],
      [fn('MAX', col('performanceScore')), 'maxScore']
    ],
    where: { status: 1 },
    raw: true
  }) as any[];

  res.json(ResponseUtil.success({
    totalCount,
    activeCount,
    inactiveCount: totalCount - activeCount,
    expiredCount,
    expiringCount,
    avgScore: Number(scoreStats[0]?.avgScore || 0).toFixed(1),
    minScore: scoreStats[0]?.minScore || 0,
    maxScore: scoreStats[0]?.maxScore || 0
  }));
};

import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { Material, MaterialCategory, MaterialConsumption } from '../models';
import { MATERIAL_STATUS } from '../config';
import { successResponse, notFoundError, conflictError, badRequestError } from '../utils/response';
import logger from '../utils/logger';
import sequelize from '../config/database';

const calculateStatus = (currentStock: number, minStock: number): string => {
  if (currentStock <= 0) {
    return MATERIAL_STATUS.EXHAUSTED;
  }
  if (currentStock <= minStock) {
    return MATERIAL_STATUS.LOW;
  }
  return MATERIAL_STATUS.SUFFICIENT;
};

export const createMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      code,
      name,
      categoryId,
      specification,
      unit,
      origin,
      grade,
      batchNumber,
      warehouseLocation,
      unitPrice,
      currentStock,
      minStock,
      maxStock,
      isPurchasable,
      description,
      imageUrl,
    } = req.body;

    const existingMaterial = await Material.findOne({ where: { code } });
    if (existingMaterial) {
      throw conflictError('物料编号已存在');
    }

    const category = await MaterialCategory.findByPk(categoryId);
    if (!category) {
      throw notFoundError('物料类目不存在');
    }

    const purchasableCheck = await MaterialCategory.checkCategoryChainPurchasable(categoryId);
    if (!purchasableCheck.isPurchasable) {
      throw badRequestError(`所属类目「${purchasableCheck.blockedCategory}」已停采，不允许新增物料`);
    }

    const initialStock = currentStock || 0;
    const initialMinStock = minStock || 0;
    const initialAvailableStock = initialStock;
    let status = MATERIAL_STATUS.SUFFICIENT;
    if (initialAvailableStock <= 0) {
      status = MATERIAL_STATUS.EXHAUSTED;
    } else if (initialAvailableStock <= initialMinStock) {
      status = MATERIAL_STATUS.LOW;
    }

    const material = await Material.create({
      code,
      name,
      categoryId,
      specification,
      unit,
      origin,
      grade,
      batchNumber,
      warehouseLocation,
      unitPrice: unitPrice || 0,
      currentStock: initialStock,
      lockedStock: 0,
      availableStock: initialAvailableStock,
      minStock: initialMinStock,
      maxStock,
      status,
      isPurchasable: isPurchasable !== undefined ? isPurchasable : true,
      description,
      imageUrl,
      createdBy: req.user?.id,
    });

    logger.info(`创建物料成功: ${code} - ${name}`);
    successResponse(res, material, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryId,
      origin,
      grade,
      status,
      isPurchasable,
      minStockMin,
      minStockMax,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { code: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { specification: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (origin) {
      where.origin = { [Op.like]: `%${origin}%` };
    }

    if (grade) {
      where.grade = grade;
    }

    if (status) {
      where.status = status;
    }

    if (isPurchasable !== undefined) {
      where.isPurchasable = isPurchasable === 'true';
    }

    if (minStockMin !== undefined || minStockMax !== undefined) {
      where.availableStock = {};
      if (minStockMin !== undefined) {
        where.availableStock[Op.gte] = Number(minStockMin);
      }
      if (minStockMax !== undefined) {
        where.availableStock[Op.lte] = Number(minStockMax);
      }
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [[sortBy as string, sortOrder as string]],
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

export const getMaterialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'category',
        },
      ],
    });

    if (!material) {
      throw notFoundError('物料不存在');
    }

    successResponse(res, material, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      categoryId,
      specification,
      unit,
      origin,
      grade,
      batchNumber,
      warehouseLocation,
      unitPrice,
      currentStock,
      minStock,
      maxStock,
      isPurchasable,
      description,
      imageUrl,
    } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      throw notFoundError('物料不存在');
    }

    if (code && code !== material.code) {
      const existingMaterial = await Material.findOne({
        where: { code, id: { [Op.ne]: Number(id) } },
      });
      if (existingMaterial) {
        throw conflictError('物料编号已存在');
      }
    }

    if (categoryId && categoryId !== material.categoryId) {
      const category = await MaterialCategory.findByPk(categoryId);
      if (!category) {
        throw notFoundError('物料类目不存在');
      }
    }

    let newStatus = material.status;
    if (currentStock !== undefined || minStock !== undefined) {
      const newCurrentStock = currentStock !== undefined ? currentStock : material.currentStock;
      const newMinStock = minStock !== undefined ? minStock : material.minStock;
      newStatus = calculateStatus(newCurrentStock, newMinStock);
    }

    await material.update({
      code: code || material.code,
      name: name || material.name,
      categoryId: categoryId || material.categoryId,
      specification: specification !== undefined ? specification : material.specification,
      unit: unit || material.unit,
      origin: origin !== undefined ? origin : material.origin,
      grade: grade !== undefined ? grade : material.grade,
      batchNumber: batchNumber !== undefined ? batchNumber : material.batchNumber,
      warehouseLocation: warehouseLocation !== undefined ? warehouseLocation : material.warehouseLocation,
      unitPrice: unitPrice !== undefined ? unitPrice : material.unitPrice,
      currentStock: currentStock !== undefined ? currentStock : material.currentStock,
      minStock: minStock !== undefined ? minStock : material.minStock,
      maxStock: maxStock !== undefined ? maxStock : material.maxStock,
      status: newStatus,
      isPurchasable: isPurchasable !== undefined ? isPurchasable : material.isPurchasable,
      description: description !== undefined ? description : material.description,
      imageUrl: imageUrl !== undefined ? imageUrl : material.imageUrl,
    });

    logger.info(`更新物料成功: ${material.code}`);
    successResponse(res, material, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { quantity, type, remark, operator } = req.body;

    const material = await Material.findByPk(id, {
      transaction: t,
      include: [{ model: MaterialCategory, as: 'category' }],
    });
    if (!material) {
      await t.rollback();
      throw notFoundError('物料不存在');
    }

    if (type === 'in') {
      const purchasableCheck = await MaterialCategory.checkCategoryChainPurchasable(material.categoryId);
      if (!purchasableCheck.isPurchasable) {
        await t.rollback();
        throw badRequestError(`所属类目「${purchasableCheck.blockedCategory}」已停采，不允许入库`);
      }

      if (!material.isPurchasable) {
        await t.rollback();
        throw badRequestError('该物料已停采，不允许入库');
      }
    }

    let newCurrentStock: number;
    if (type === 'in') {
      newCurrentStock = Number(material.currentStock) + Number(quantity);
    } else {
      if (Number(material.currentStock) < Number(quantity)) {
        await t.rollback();
        throw badRequestError('库存不足');
      }
      newCurrentStock = Number(material.currentStock) - Number(quantity);
    }

    const newStatus = calculateStatus(newCurrentStock, material.minStock);

    await material.update(
      { currentStock: newCurrentStock, status: newStatus },
      { transaction: t }
    );

    await t.commit();

    logger.info(`物料库存更新成功: ${material.code}, ${type === 'in' ? '+' : '-'}${quantity}${remark ? ` - ${remark}` : ''}`);
    successResponse(res, material, '库存更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const batchUpdateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { items } = req.body;

    const results: any[] = [];
    for (const item of items) {
      const material = await Material.findByPk(item.materialId, {
        transaction: t,
        include: [{ model: MaterialCategory, as: 'category' }],
      });

      if (!material) {
        await t.rollback();
        throw notFoundError(`物料ID ${item.materialId} 不存在`);
      }

      if (item.type === 'in') {
        const purchasableCheck = await MaterialCategory.checkCategoryChainPurchasable(material.categoryId);
        if (!purchasableCheck.isPurchasable) {
          await t.rollback();
          throw badRequestError(`物料「${material.name}」所属类目「${purchasableCheck.blockedCategory}」已停采，不允许入库`);
        }

        if (!material.isPurchasable) {
          await t.rollback();
          throw badRequestError(`物料「${material.name}」已停采，不允许入库`);
        }
      }

      let newCurrentStock: number;
      if (item.type === 'in') {
        newCurrentStock = Number(material.currentStock) + Number(item.quantity);
      } else {
        if (Number(material.currentStock) < Number(item.quantity)) {
          await t.rollback();
          throw badRequestError(`物料「${material.name}」库存不足`);
        }
        newCurrentStock = Number(material.currentStock) - Number(item.quantity);
      }

      const newStatus = calculateStatus(newCurrentStock, material.minStock);

      await material.update(
        { currentStock: newCurrentStock, status: newStatus },
        { transaction: t }
      );

      results.push({
        materialId: material.id,
        code: material.code,
        name: material.name,
        type: item.type,
        quantity: item.quantity,
        newStock: newCurrentStock,
      });
    }

    await t.commit();

    logger.info(`批量库存更新成功: 共${results.length}条记录`);
    successResponse(res, { results }, '批量库存更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    if (!material) {
      throw notFoundError('物料不存在');
    }

    const consumptionCount = await MaterialConsumption.count({ where: { materialId: Number(id) } });
    if (consumptionCount > 0) {
      throw conflictError('该物料已有消耗记录，无法删除');
    }

    await material.destroy();

    logger.info(`删除物料成功: ${material.code}`);
    successResponse(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getLowStockMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, pageSize = 999, categoryId } = req.query;

    const where: any = {
      status: { [Op.in]: [MATERIAL_STATUS.LOW, MATERIAL_STATUS.EXHAUSTED] },
    };

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['currentStock', 'ASC']],
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

export const getMaterialStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categoryStats = await Material.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('currentStock')), 'totalStock'],
        [sequelize.fn('SUM', sequelize.fn('*', sequelize.col('currentStock'), sequelize.col('unitPrice'))), 'totalValue'],
      ],
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      group: ['categoryId'],
    });

    const statusStats = await Material.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('currentStock')), 'totalStock'],
      ],
      group: ['status'],
    });

    const totalMaterials = await Material.count();
    const totalStockValue = await Material.sum(sequelize.literal('currentStock * unitPrice'));

    const statistics = {
      totalMaterials,
      totalStockValue: totalStockValue || 0,
      categoryStats,
      statusStats,
    };

    successResponse(res, statistics, '获取成功');
  } catch (error) {
    next(error);
  }
};

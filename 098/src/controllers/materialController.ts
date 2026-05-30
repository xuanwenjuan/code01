import { Request, Response, NextFunction } from 'express';
import { Material, MaterialUsage, sequelize, Area, User } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole, MaterialType } from '../types';
import { Op, Transaction } from 'sequelize';
import { createOperationLog } from '../services/operationLogService';

export const getMaterials = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const {
      page = 1,
      pageSize = 10,
      type,
      isActive,
      lowStock,
      keyword
    } = req.query;

    const where: any = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (lowStock === 'true') {
      where[Op.and] = sequelize.literal('quantity <= threshold');
    }

    if (keyword) {
      where[Op.or] = [
        { code: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { specification: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      distinct: true
    });

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'query', '查询物资列表', 'success', duration, undefined, { count });

    ResponseUtil.successWithPagination(res, rows, Number(page), Number(pageSize), count);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'query', '查询物资列表失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getMaterialById = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id, {
      include: [
        {
          association: 'usages',
          limit: 20,
          order: [['createdAt', 'DESC']],
          include: [{ association: 'user', attributes: ['id', 'username', 'realName'] }]
        }
      ]
    });

    if (!material) {
      throw new NotFoundException('物资不存在');
    }

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'query', `查询物资详情: ${material.name}`, 'success', duration);

    ResponseUtil.success(res, material);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'query', '查询物资详情失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const createMaterial = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PURCHASER) {
      throw new ForbiddenException('您没有权限创建物资');
    }

    const data = req.body;

    const existingCode = await Material.findOne({
      where: { code: data.code },
      transaction
    });
    if (existingCode) {
      throw new BadRequestException('物资编码已存在');
    }

    if (data.quantity === undefined) data.quantity = 0;
    if (data.unitPrice === undefined) data.unitPrice = 0;
    data.totalValue = data.quantity * data.unitPrice;

    const material = await Material.create(data, { transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'create', `创建物资: ${material.name}`, 'success', duration);

    ResponseUtil.created(res, material);
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'create', '创建物资失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const updateMaterial = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PURCHASER) {
      throw new ForbiddenException('您没有权限更新物资');
    }

    const { id } = req.params;
    const data = req.body;

    const material = await Material.findByPk(id, { transaction });
    if (!material) {
      throw new NotFoundException('物资不存在');
    }

    if (data.code && data.code !== material.code) {
      const existingCode = await Material.findOne({
        where: { code: data.code, id: { [Op.ne]: id } },
        transaction
      });
      if (existingCode) {
        throw new BadRequestException('物资编码已存在');
      }
    }

    const newQuantity = data.quantity !== undefined ? data.quantity : material.quantity;
    const newUnitPrice = data.unitPrice !== undefined ? data.unitPrice : material.unitPrice;
    data.totalValue = newQuantity * newUnitPrice;

    await material.update(data, { transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'update', `更新物资: ${material.name}`, 'success', duration);

    ResponseUtil.success(res, material);
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'update', '更新物资失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const deleteMaterial = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    if (req.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('您没有权限删除物资');
    }

    const { id } = req.params;

    const material = await Material.findByPk(id, { transaction });
    if (!material) {
      throw new NotFoundException('物资不存在');
    }

    const usageCount = await MaterialUsage.count({
      where: { materialId: id },
      transaction
    });
    if (usageCount > 0) {
      throw new BadRequestException('该物资已有领用记录，无法删除');
    }

    await material.destroy({ transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'delete', `删除物资: ${material.name}`, 'success', duration);

    ResponseUtil.noContent(res, '物资删除成功');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'delete', '删除物资失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const useMaterial = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { areaId, workOrderId, items } = req.body;

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (areaId && areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能领用所在片区的物资');
      }
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER && req.user.areaId) {
      if (areaId && areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能领用所在片区的物资');
      }
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('请选择要领用的物资');
    }

    const usageRecords = [];

    for (const item of items) {
      const material = await Material.findByPk(item.materialId, { transaction });
      if (!material) {
        throw new BadRequestException(`物资ID ${item.materialId} 不存在`);
      }
      if (!material.isActive) {
        throw new BadRequestException(`物资 ${material.name} 已停用`);
      }
      if (material.quantity < item.quantity) {
        throw new BadRequestException(`物资 ${material.name} 库存不足，当前库存: ${material.quantity}，需要: ${item.quantity}`);
      }

      const newQuantity = material.quantity - item.quantity;
      await material.update({
        quantity: newQuantity,
        totalValue: newQuantity * material.unitPrice
      }, { transaction });

      const usage = await MaterialUsage.create({
        materialId: item.materialId,
        workOrderId: workOrderId || null,
        areaId: areaId || req.user?.areaId || null,
        quantity: item.quantity,
        unitPrice: material.unitPrice,
        totalPrice: item.quantity * material.unitPrice,
        usedBy: req.user?.userId,
        remark: item.remark || '物资领用'
      }, { transaction });

      usageRecords.push({
        ...usage.toJSON(),
        materialName: material.name,
        materialCode: material.code
      });
    }

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'use', `领用物资: ${usageRecords.length} 项`, 'success', duration);

    ResponseUtil.success(res, { records: usageRecords }, '物资领用成功');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'use', '领用物资失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getMaterialUsage = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const {
      page = 1,
      pageSize = 10,
      materialId,
      areaId,
      usedBy,
      startDate,
      endDate,
      workOrderId
    } = req.query;

    const where: any = {};

    if (materialId) where.materialId = materialId;
    if (areaId) where.areaId = areaId;
    if (usedBy) where.usedBy = usedBy;
    if (workOrderId) where.workOrderId = workOrderId;

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER) {
      where.usedBy = req.user.userId;
    }

    const { count, rows } = await MaterialUsage.findAndCountAll({
      where,
      include: [
        { association: 'material', attributes: ['id', 'code', 'name', 'type'] },
        { association: 'area', attributes: ['id', 'name', 'code'] },
        { association: 'user', attributes: ['id', 'username', 'realName'] },
        { association: 'workOrder', attributes: ['id', 'orderNo', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      distinct: true
    });

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'query', '查询物资领用记录', 'success', duration, undefined, { count });

    ResponseUtil.successWithPagination(res, rows, Number(page), Number(pageSize), count);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'query', '查询领用记录失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getMaterialStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { startDate, endDate, areaId } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (areaId) where.areaId = areaId;

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }

    const usages = await MaterialUsage.findAll({
      where,
      include: [{ association: 'material' }]
    });

    const stats: any = {
      totalUsage: 0,
      totalCost: 0,
      byType: {},
      byMaterial: [],
      byArea: []
    };

    const materialMap = new Map();
    const areaMap = new Map();

    usages.forEach(usage => {
      const material = (usage as any).material;
      const type = material?.type || 'unknown';

      stats.totalUsage += usage.quantity;
      stats.totalCost += usage.totalPrice || 0;

      if (!stats.byType[type]) {
        stats.byType[type] = { quantity: 0, cost: 0 };
      }
      stats.byType[type].quantity += usage.quantity;
      stats.byType[type].cost += usage.totalPrice || 0;

      const matKey = material?.id;
      if (!materialMap.has(matKey)) {
        materialMap.set(matKey, {
          materialId: matKey,
          materialName: material?.name,
          materialCode: material?.code,
          quantity: 0,
          cost: 0
        });
      }
      const matStat = materialMap.get(matKey);
      matStat.quantity += usage.quantity;
      matStat.cost += usage.totalPrice || 0;

      const areaKey = usage.areaId;
      if (!areaMap.has(areaKey)) {
        areaMap.set(areaKey, {
          areaId: areaKey,
          quantity: 0,
          cost: 0
        });
      }
      const areaStat = areaMap.get(areaKey);
      areaStat.quantity += usage.quantity;
      areaStat.cost += usage.totalPrice || 0;
    });

    stats.byMaterial = Array.from(materialMap.values());
    stats.byArea = Array.from(areaMap.values());

    const lowStockMaterials = await Material.count({
      where: {
        isActive: true,
        quantity: { [Op.lte]: sequelize.col('threshold') }
      }
    });
    stats.lowStockCount = lowStockMaterials;

    const totalInventory = await Material.sum('totalValue', { where: { isActive: true } });
    stats.totalInventory = totalInventory || 0;

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'statistics', '查询物资统计数据', 'success', duration);

    ResponseUtil.success(res, stats);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'statistics', '查询统计失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const restockMaterial = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PURCHASER) {
      throw new ForbiddenException('您没有权限进行物资入库');
    }

    const { id } = req.params;
    const { quantity, remark, unitPrice } = req.body;

    if (!quantity || quantity <= 0) {
      throw new BadRequestException('入库数量必须大于0');
    }

    const material = await Material.findByPk(id, { transaction });
    if (!material) {
      throw new NotFoundException('物资不存在');
    }

    const newUnitPrice = unitPrice !== undefined ? unitPrice : material.unitPrice;
    const newQuantity = material.quantity + quantity;
    const newTotalValue = newQuantity * newUnitPrice;

    await material.update({
      quantity: newQuantity,
      unitPrice: newUnitPrice,
      totalValue: newTotalValue
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'restock', `物资入库: ${material.name} +${quantity}`, 'success', duration);

    ResponseUtil.success(res, material, '物资入库成功');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'material', 'restock', '物资入库失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

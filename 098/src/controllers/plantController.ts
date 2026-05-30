import { Request, Response, NextFunction } from 'express';
import { Plant, PlantCategory, sequelize, Area, User } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole, PlantHealthStatus } from '../types';
import { Op, Transaction } from 'sequelize';
import { createOperationLog } from '../services/operationLogService';

export const getPlants = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const {
      page = 1,
      pageSize = 10,
      areaId,
      categoryId,
      healthStatus,
      hasPestWarning,
      isActive,
      keyword
    } = req.query;

    const where: any = {};

    if (areaId) where.areaId = areaId;
    if (categoryId) where.categoryId = categoryId;
    if (healthStatus) where.healthStatus = healthStatus;
    if (hasPestWarning !== undefined) where.hasPestWarning = hasPestWarning === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (keyword) {
      where[Op.or] = [
        { code: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }

    const { count, rows } = await Plant.findAndCountAll({
      where,
      include: [
        { association: 'category', attributes: ['id', 'name', 'type'] },
        { association: 'area', attributes: ['id', 'name', 'code'] }
      ],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      distinct: true
    });

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'query', '查询绿植列表', 'success', duration, undefined, { count });

    ResponseUtil.successWithPagination(res, rows, Number(page), Number(pageSize), count);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'query', '查询绿植列表失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getPlantById = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;

    const plant = await Plant.findByPk(id, {
      include: [
        { association: 'category', attributes: ['id', 'name', 'type'] },
        { association: 'area', attributes: ['id', 'name', 'code'] },
        { association: 'maintenanceRecords', limit: 10, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!plant) {
      throw new NotFoundException('绿植不存在');
    }

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'query', `查询绿植详情: ${plant.name}`, 'success', duration);

    ResponseUtil.success(res, plant);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'query', '查询绿植详情失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const createPlant = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();
  
  try {
    const { categoryId, areaId, ...data } = req.body;

    const category = await PlantCategory.findByPk(categoryId, { transaction });
    if (!category) {
      throw new BadRequestException('绿植分类不存在');
    }
    if (!category.isActive) {
      throw new BadRequestException('该分类已停用，无法创建绿植');
    }

    if (areaId) {
      const area = await Area.findByPk(areaId, { transaction });
      if (!area) {
        throw new BadRequestException('片区不存在');
      }
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (areaId && areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
      data.areaId = req.user.areaId;
    }

    const existingCode = await Plant.findOne({
      where: { code: data.code },
      transaction
    });
    if (existingCode) {
      throw new BadRequestException('绿植编码已存在');
    }

    const plant = await Plant.create(
      { ...data, categoryId, areaId },
      { transaction }
    );

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'create', `创建绿植: ${plant.name}`, 'success', duration);

    ResponseUtil.created(res, plant);
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'create', '创建绿植失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const updatePlant = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { categoryId, areaId, ...data } = req.body;

    const plant = await Plant.findByPk(id, { transaction });
    if (!plant) {
      throw new NotFoundException('绿植不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
      if (areaId && areaId !== req.user.areaId) {
        throw new ForbiddenException('不能将绿植移动到其他片区');
      }
    }

    if (categoryId) {
      const category = await PlantCategory.findByPk(categoryId, { transaction });
      if (!category) {
        throw new BadRequestException('绿植分类不存在');
      }
      if (!category.isActive) {
        throw new BadRequestException('该分类已停用，无法调整到此分类');
      }
    }

    if (areaId) {
      const area = await Area.findByPk(areaId, { transaction });
      if (!area) {
        throw new BadRequestException('片区不存在');
      }
    }

    if (data.code && data.code !== plant.code) {
      const existingCode = await Plant.findOne({
        where: { code: data.code, id: { [Op.ne]: id } },
        transaction
      });
      if (existingCode) {
        throw new BadRequestException('绿植编码已存在');
      }
    }

    await plant.update({ ...data, categoryId, areaId }, { transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'update', `更新绿植: ${plant.name}`, 'success', duration);

    ResponseUtil.success(res, plant);
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'update', '更新绿植失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const deletePlant = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const plant = await Plant.findByPk(id, { transaction });
    if (!plant) {
      throw new NotFoundException('绿植不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能删除所在片区的绿植');
      }
    }

    await plant.destroy({ transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'delete', `删除绿植: ${plant.name}`, 'success', duration);

    ResponseUtil.noContent(res, '绿植删除成功');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'delete', '删除绿植失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const updateHealthStatus = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { healthStatus } = req.body;

    const plant = await Plant.findByPk(id, { transaction });
    if (!plant) {
      throw new NotFoundException('绿植不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
    }

    await plant.update({ healthStatus }, { transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'update', `更新绿植健康状态: ${plant.name} -> ${healthStatus}`, 'success', duration);

    ResponseUtil.success(res, plant, '健康状态更新成功');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'update', '更新健康状态失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const togglePestWarning = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const plant = await Plant.findByPk(id, { transaction });
    if (!plant) {
      throw new NotFoundException('绿植不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
    }

    const newStatus = !plant.hasPestWarning;
    await plant.update({ hasPestWarning: newStatus }, { transaction });
    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'update', `${newStatus ? '开启' : '关闭'}绿植病虫害预警: ${plant.name}`, 'success', duration);

    ResponseUtil.success(res, plant, newStatus ? '病虫害预警已开启' : '病虫害预警已关闭');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'update', '切换病虫害预警失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const recordMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { type, description, duration, nextMaintenanceDate } = req.body;

    const plant = await Plant.findByPk(id, { transaction });
    if (!plant) {
      throw new NotFoundException('绿植不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER && req.user.areaId) {
      if (plant.areaId && plant.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能管理所在片区的绿植');
      }
    }

    const updateData: any = {
      lastMaintenanceDate: new Date()
    };
    
    if (nextMaintenanceDate) {
      updateData.nextMaintenanceDate = nextMaintenanceDate;
    }

    await plant.update(updateData, { transaction });
    await transaction.commit();

    const durationTime = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'maintenance', `记录绿植养护: ${plant.name}`, 'success', durationTime);

    ResponseUtil.success(res, plant, '养护记录已保存');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'maintenance', '记录养护失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getPlantStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const where: any = { isActive: true };

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }

    const total = await Plant.count({ where });
    const byHealthStatus = await Plant.findAll({
      where,
      attributes: ['healthStatus', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['healthStatus']
    });
    const byArea = await Plant.findAll({
      where,
      include: [{ association: 'area', attributes: ['id', 'name'] }],
      attributes: ['areaId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['areaId', 'area.id', 'area.name']
    });
    const pestWarningCount = await Plant.count({
      where: { ...where, hasPestWarning: true }
    });

    const stats = {
      total,
      byHealthStatus: byHealthStatus.map(item => ({
        status: (item as any).healthStatus,
        count: Number((item as any).dataValues.count)
      })),
      byArea: byArea.map(item => ({
        areaId: (item as any).areaId,
        areaName: (item as any).area?.name,
        count: Number((item as any).dataValues.count)
      })),
      pestWarningCount
    };

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'statistics', '查询绿植统计数据', 'success', duration);

    ResponseUtil.success(res, stats);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'plant', 'statistics', '查询统计失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

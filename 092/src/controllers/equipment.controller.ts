import { Request, Response, NextFunction } from 'express';
import sequelize from '../config/database';
import Equipment from '../models/equipment.model';
import Category from '../models/category.model';
import MaintenanceRecord from '../models/maintenance-record.model';
import User from '../models/user.model';
import { ResponseUtil } from '../utils/response.util';
import { NotFoundException, BadRequestException } from '../common/http-exception';
import { EquipmentStatus, CategoryStatus, MaintenanceType } from '../common/enums';
import { EquipmentFilterParams } from '../types';
import { EquipmentScheduleService } from '../services/equipment-schedule.service';
import { OperationLogService } from '../services/operation-log.service';
import { Op } from 'sequelize';

export const getEquipmentList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      name,
      categoryId,
      status,
      assetNo,
      brand,
      model,
      specs,
      minPurchasePrice,
      maxPurchasePrice,
      startPurchaseDate,
      endPurchaseDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query as unknown as EquipmentFilterParams & {
      sortBy?: string;
      sortOrder?: string;
    };

    const where: any = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status) {
      where.status = status;
    }
    if (assetNo) {
      where.assetNo = { [Op.like]: `%${assetNo}%` };
    }
    if (brand) {
      where.brand = { [Op.like]: `%${brand}%` };
    }
    if (model) {
      where.model = { [Op.like]: `%${model}%` };
    }
    if (specs) {
      where.specs = { [Op.like]: `%${specs}%` };
    }
    if (minPurchasePrice) {
      where.purchasePrice = { ...where.purchasePrice, [Op.gte]: Number(minPurchasePrice) };
    }
    if (maxPurchasePrice) {
      where.purchasePrice = { ...where.purchasePrice, [Op.lte]: Number(maxPurchasePrice) };
    }
    if (startPurchaseDate && endPurchaseDate) {
      where.purchaseDate = {
        [Op.between]: [new Date(startPurchaseDate), new Date(endPurchaseDate + ' 23:59:59')],
      };
    }

    const { count, rows } = await Equipment.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'code'] }],
      order: [[sortBy, sortOrder as 'ASC' | 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    res.json(ResponseUtil.page(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'code'] }],
    });

    if (!equipment) {
      return next(new NotFoundException('设备不存在'));
    }

    res.json(ResponseUtil.success(equipment));
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      assetNo,
      name,
      brand,
      model,
      categoryId,
      power,
      specs,
      purchaseDate,
      purchasePrice,
      maintenanceCycle,
      location,
      remarks,
      depreciationRate,
    } = req.body;

    const existingAssetNo = await Equipment.findOne({ where: { assetNo }, transaction });
    if (existingAssetNo) {
      await transaction.rollback();
      return next(new BadRequestException('资产编号已存在'));
    }

    const category = await Category.findByPk(categoryId, { transaction });
    if (!category) {
      await transaction.rollback();
      return next(new BadRequestException('分类不存在'));
    }

    if (category.status === CategoryStatus.DISCONTINUED) {
      await transaction.rollback();
      return next(new BadRequestException('该分类已停产，无法新增设备'));
    }

    const currentValue = purchasePrice * (1 - (depreciationRate || 0.05));

    const equipment = await Equipment.create(
      {
        assetNo,
        name,
        brand,
        model,
        categoryId,
        power,
        specs,
        purchaseDate,
        purchasePrice,
        maintenanceCycle: maintenanceCycle || 90,
        status: EquipmentStatus.IN_STOCK,
        location,
        remarks,
        depreciationRate: depreciationRate || 0.05,
        currentValue,
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'equipment',
        operation: 'create',
        recordId: equipment.id,
        afterData: equipment.toJSON(),
        changes: ['创建设备'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.created(equipment));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      assetNo,
      name,
      brand,
      model,
      categoryId,
      power,
      specs,
      purchaseDate,
      purchasePrice,
      maintenanceCycle,
      status,
      location,
      remarks,
      depreciationRate,
    } = req.body;

    const equipment = await Equipment.findByPk(id, { transaction });
    if (!equipment) {
      await transaction.rollback();
      return next(new NotFoundException('设备不存在'));
    }

    const beforeData = equipment.toJSON();

    if (assetNo && assetNo !== equipment.assetNo) {
      const existingAssetNo = await Equipment.findOne({ where: { assetNo }, transaction });
      if (existingAssetNo) {
        await transaction.rollback();
        return next(new BadRequestException('资产编号已存在'));
      }
    }

    if (categoryId && categoryId !== equipment.categoryId) {
      const category = await Category.findByPk(categoryId, { transaction });
      if (!category) {
        await transaction.rollback();
        return next(new BadRequestException('分类不存在'));
      }
      if (category.status === CategoryStatus.DISCONTINUED) {
        await transaction.rollback();
        return next(new BadRequestException('该分类已停产，无法移动设备到此分类'));
      }
    }

    const currentValue = purchasePrice
      ? purchasePrice * (1 - (depreciationRate || equipment.depreciationRate))
      : equipment.currentValue;

    await equipment.update(
      {
        assetNo,
        name,
        brand,
        model,
        categoryId,
        power,
        specs,
        purchaseDate,
        purchasePrice,
        maintenanceCycle,
        status,
        location,
        remarks,
        depreciationRate,
        currentValue,
      },
      { transaction }
    );

    const changes: string[] = [];
    Object.keys(req.body).forEach((key) => {
      if (key !== 'id' && beforeData[key] !== req.body[key]) {
        changes.push(key);
      }
    });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'equipment',
        operation: 'update',
        recordId: equipment.id,
        beforeData,
        afterData: equipment.toJSON(),
        changes,
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(equipment));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteEquipment = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id, { transaction });
    if (!equipment) {
      await transaction.rollback();
      return next(new NotFoundException('设备不存在'));
    }

    if (equipment.status === EquipmentStatus.RENTED) {
      await transaction.rollback();
      return next(new BadRequestException('设备已出租，无法删除'));
    }

    await equipment.destroy({ transaction });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'equipment',
        operation: 'delete',
        recordId: equipment.id,
        beforeData: equipment.toJSON(),
        changes: ['删除设备'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.deleted('设备删除成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getMaintenanceReminder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Number(req.query.days) || 7;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + days);

    const equipments = await Equipment.findAll({
      where: {
        nextMaintenanceDate: {
          [Op.lte]: reminderDate,
        },
        status: { [Op.ne]: EquipmentStatus.SCRAPPED },
      },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['nextMaintenanceDate', 'ASC']],
    });

    res.json(ResponseUtil.success(equipments));
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { equipmentId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const { count, rows } = await MaintenanceRecord.findAndCountAll({
      where: { equipmentId },
      include: [
        { model: Equipment, as: 'equipment', attributes: ['id', 'name', 'assetNo'] },
        { model: User, as: 'performer', attributes: ['id', 'username', 'realName'] },
      ],
      order: [['performedAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    res.json(ResponseUtil.page(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceRecord = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { equipmentId } = req.params;
    const { type, cost, description, performedAt, nextMaintenanceDate, remarks } = req.body;

    const equipment = await Equipment.findByPk(equipmentId, { transaction });
    if (!equipment) {
      await transaction.rollback();
      return next(new NotFoundException('设备不存在'));
    }

    const record = await MaintenanceRecord.create(
      {
        equipmentId,
        type: type || MaintenanceType.ROUTINE,
        cost: cost || 0,
        description,
        performedBy: req.user!.userId,
        performedAt: performedAt || new Date(),
        nextMaintenanceDate,
        remarks,
      },
      { transaction }
    );

    if (nextMaintenanceDate || type === MaintenanceType.ROUTINE) {
      const newNextDate = nextMaintenanceDate || new Date(Date.now() + (equipment.maintenanceCycle * 24 * 60 * 60 * 1000));
      await equipment.update(
        { lastMaintenanceDate: performedAt || new Date(), nextMaintenanceDate: newNextDate, status: EquipmentStatus.IN_STOCK },
        { transaction }
      );
    }

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'maintenance',
        operation: 'maintenance',
        recordId: equipment.id,
        afterData: { equipment: equipment.toJSON(), maintenance: record.toJSON() },
        changes: ['设备维保'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.created(record, '维保记录创建成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const scrapEquipment = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const equipment = await Equipment.findByPk(id, { transaction });
    if (!equipment) {
      await transaction.rollback();
      return next(new NotFoundException('设备不存在'));
    }

    if (equipment.status === EquipmentStatus.RENTED) {
      await transaction.rollback();
      return next(new BadRequestException('设备已出租，无法报废'));
    }

    const beforeData = equipment.toJSON();

    await equipment.update(
      {
        status: EquipmentStatus.SCRAPPED,
        remarks: remarks ? `${equipment.remarks || ''}\n报废备注: ${remarks}` : equipment.remarks,
      },
      { transaction }
    );

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'equipment',
        operation: 'scrap',
        recordId: equipment.id,
        beforeData,
        afterData: equipment.toJSON(),
        changes: ['设备报废'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(equipment, '设备报废成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const checkEquipmentSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { equipmentIds, startTime, endTime, excludeOrderId } = req.body;

    if (!equipmentIds || !Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return next(new BadRequestException('设备ID列表不能为空'));
    }
    if (!startTime || !endTime) {
      return next(new BadRequestException('开始时间和结束时间不能为空'));
    }

    const result = await EquipmentScheduleService.checkScheduleConflict({
      equipmentIds,
      startTime,
      endTime,
      excludeOrderId,
    });

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getEquipmentSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { equipmentId } = req.params;
    const { startDate, endDate } = req.query;

    const schedule = await EquipmentScheduleService.getEquipmentSchedule(
      Number(equipmentId),
      startDate as string,
      endDate as string
    );

    res.json(ResponseUtil.success(schedule));
  } catch (error) {
    next(error);
  }
};

export const getAvailableEquipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, startTime, endTime } = req.query;

    if (!categoryId || !startTime || !endTime) {
      return next(new BadRequestException('分类ID、开始时间和结束时间不能为空'));
    }

    const equipments = await EquipmentScheduleService.getAvailableEquipments(
      Number(categoryId),
      startTime as string,
      endTime as string
    );

    res.json(ResponseUtil.success(equipments));
  } catch (error) {
    next(error);
  }
};

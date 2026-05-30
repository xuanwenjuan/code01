import { Request, Response } from 'express';
import { Op, Transaction, literal } from 'sequelize';
import { ApiResponse } from '../utils/response';
import Equipment from '../database/models/Equipment.model';
import Category from '../database/models/Category.model';
import RentalOrder from '../database/models/RentalOrder.model';
import OperationLog from '../database/models/OperationLog.model';
import { sequelize } from '../database';
import { NotFoundException, BadRequestException, ConflictException } from '../exceptions/http.exception';
import { EquipmentStatus, OrderStatus, LogModule, LogAction } from '../types';
import { generateEquipmentNo } from '../utils/orderNo';
import type { IEquipmentFilterDto, ICreateEquipmentDto, IUpdateEquipmentDto, IBatchUpdateStatusDto, AuthRequest } from '../types';

const logOperation = async (req: Request, module: LogModule, operation: string, result: string = 'success') => {
  try {
    const authReq = req as AuthRequest;
    await OperationLog.create({
      userId: authReq.user?.id,
      username: authReq.user?.username,
      module,
      operation,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.socket.remoteAddress,
      params: JSON.stringify({ body: req.body, params: req.params, query: req.query }),
      result,
      status: 1
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
};

export const createEquipment = async (req: Request, res: Response) => {
  const dto: ICreateEquipmentDto = req.body;

  if (!dto.name || !dto.name.trim()) {
    throw new BadRequestException('设备名称不能为空');
  }
  if (dto.name.length > 100) {
    throw new BadRequestException('设备名称不能超过100个字符');
  }
  if (!dto.categoryId) {
    throw new BadRequestException('请选择设备类目');
  }
  if (!dto.model || !dto.model.trim()) {
    throw new BadRequestException('设备型号不能为空');
  }
  if (!dto.purchaseCost || dto.purchaseCost <= 0) {
    throw new BadRequestException('采购成本必须大于0');
  }
  if (!dto.dailyPrice && !dto.monthlyPrice) {
    throw new BadRequestException('日租价格和月租价格至少设置一个');
  }
  if (dto.dailyPrice !== undefined && dto.dailyPrice < 0) {
    throw new BadRequestException('日租价格不能小于0');
  }
  if (dto.monthlyPrice !== undefined && dto.monthlyPrice < 0) {
    throw new BadRequestException('月租价格不能小于0');
  }
  if (!dto.deposit || dto.deposit < 0) {
    throw new BadRequestException('押金不能小于0');
  }

  const category = await Category.findByPk(dto.categoryId);
  if (!category) {
    throw new BadRequestException('设备类目不存在');
  }

  const equipmentNo = generateEquipmentNo();

  const equipment = await sequelize.transaction(async (t: Transaction) => {
    const newEquipment = await Equipment.create({
      equipmentNo,
      name: dto.name.trim(),
      categoryId: dto.categoryId,
      model: dto.model.trim(),
      specification: dto.specification,
      configuration: dto.configuration,
      purchaseCost: dto.purchaseCost,
      purchaseDate: dto.purchaseDate || new Date(),
      dailyPrice: dto.dailyPrice || 0,
      monthlyPrice: dto.monthlyPrice || 0,
      deposit: dto.deposit,
      status: EquipmentStatus.IN_STOCK,
      location: dto.location,
      maintenanceCycle: dto.maintenanceCycle,
      remark: dto.remark
    }, { transaction: t });

    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.CREATE}_${newEquipment.id}`);
    
    return newEquipment;
  });

  res.json(ApiResponse.success(equipment, '设备创建成功'));
};

export const updateEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dto: IUpdateEquipmentDto = req.body;

  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) {
    throw new BadRequestException('无效的设备ID');
  }

  const equipment = await Equipment.findByPk(equipmentId);
  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  if (dto.categoryId !== undefined) {
    const category = await Category.findByPk(dto.categoryId);
    if (!category) {
      throw new BadRequestException('设备类目不存在');
    }
  }

  if (dto.purchaseCost !== undefined && dto.purchaseCost <= 0) {
    throw new BadRequestException('采购成本必须大于0');
  }

  if (dto.dailyPrice !== undefined && dto.dailyPrice < 0) {
    throw new BadRequestException('日租价格不能小于0');
  }

  if (dto.monthlyPrice !== undefined && dto.monthlyPrice < 0) {
    throw new BadRequestException('月租价格不能小于0');
  }

  if (dto.deposit !== undefined && dto.deposit < 0) {
    throw new BadRequestException('押金不能小于0');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await equipment.update(dto, { transaction: t });
    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.UPDATE}_${equipmentId}`);
  });

  res.json(ApiResponse.success(equipment, '设备更新成功'));
};

export const deleteEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) {
    throw new BadRequestException('无效的设备ID');
  }

  const equipment = await Equipment.findByPk(equipmentId);
  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  if (equipment.status === EquipmentStatus.RENTED || equipment.status === EquipmentStatus.LOCKED) {
    throw new ConflictException('设备已出租或锁定，无法删除');
  }

  const activeOrderCount = await RentalOrder.count({
    where: {
      equipmentId,
      status: {
        [Op.in]: [
          OrderStatus.PENDING_PAYMENT,
          OrderStatus.PAID,
          OrderStatus.DELIVERED,
          OrderStatus.IN_USE,
          OrderStatus.OVERDUE
        ]
      }
    }
  });

  if (activeOrderCount > 0) {
    throw new ConflictException('该设备存在进行中的订单，无法删除');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await equipment.destroy({ transaction: t });
    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.DELETE}_${equipmentId}`);
  });

  res.json(ApiResponse.success(null, '设备删除成功'));
};

export const getEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) {
    throw new BadRequestException('无效的设备ID');
  }

  const equipment = await Equipment.findByPk(equipmentId, {
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'level', 'icon']
    }]
  });

  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  res.json(ApiResponse.success(equipment));
};

export const getEquipmentList = async (req: Request, res: Response) => {
  const filter: IEquipmentFilterDto = req.query as any;

  const page = filter.page || 1;
  const pageSize = filter.pageSize || 10;

  if (page < 1) {
    throw new BadRequestException('页码必须大于0');
  }
  if (pageSize < 1 || pageSize > 100) {
    throw new BadRequestException('每页数量必须在1-100之间');
  }

  const where: any = {};

  if (filter.keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filter.keyword}%` } },
      { equipmentNo: { [Op.like]: `%${filter.keyword}%` } },
      { model: { [Op.like]: `%${filter.keyword}%` } },
      { specification: { [Op.like]: `%${filter.keyword}%` } },
      { configuration: { [Op.like]: `%${filter.keyword}%` } }
    ];
  } else {
    if (filter.name) {
      where.name = { [Op.like]: `%${filter.name}%` };
    }
    if (filter.equipmentNo) {
      where.equipmentNo = { [Op.like]: `%${filter.equipmentNo}%` };
    }
  }

  if (filter.categoryId) {
    where.categoryId = filter.categoryId;
  }

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.minDailyPrice !== undefined) {
    where.dailyPrice = { [Op.gte]: filter.minDailyPrice };
  }
  if (filter.maxDailyPrice !== undefined) {
    where.dailyPrice = { ...where.dailyPrice, [Op.lte]: filter.maxDailyPrice };
  }

  if (filter.minMonthlyPrice !== undefined) {
    where.monthlyPrice = { [Op.gte]: filter.minMonthlyPrice };
  }
  if (filter.maxMonthlyPrice !== undefined) {
    where.monthlyPrice = { ...where.monthlyPrice, [Op.lte]: filter.maxMonthlyPrice };
  }

  const { count, rows } = await Equipment.findAndCountAll({
    where,
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name']
    }],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  res.json(ApiResponse.successPage(rows, count, page, pageSize));
};

export const getEquipmentMaintenanceReminder = async (req: Request, res: Response) => {
  const { days = 7 } = req.query;

  const remindDays = parseInt(days as string);
  if (isNaN(remindDays) || remindDays <= 0) {
    throw new BadRequestException('无效的提醒天数');
  }

  const today = new Date();
  const remindDate = new Date(today.getTime() + remindDays * 24 * 60 * 60 * 1000);

  const equipments = await Equipment.findAll({
    where: {
      nextMaintenanceDate: {
        [Op.between]: [today, remindDate]
      },
      status: { [Op.ne]: EquipmentStatus.SCRAPPED }
    },
    include: [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name']
    }],
    order: [['nextMaintenanceDate', 'ASC']]
  });

  res.json(ApiResponse.success(equipments));
};

export const updateEquipmentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) {
    throw new BadRequestException('无效的设备ID');
  }

  if (!Object.values(EquipmentStatus).includes(status)) {
    throw new BadRequestException('无效的设备状态');
  }

  const equipment = await Equipment.findByPk(equipmentId);
  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  const oldStatus = equipment.status;

  if (status === EquipmentStatus.SCRAPPED) {
    const rentingCount = await RentalOrder.count({
      where: {
        equipmentId,
        status: {
          [Op.in]: [
            OrderStatus.PAID,
            OrderStatus.DELIVERED,
            OrderStatus.IN_USE,
            OrderStatus.OVERDUE
          ]
        }
      }
    });
    if (rentingCount > 0) {
      throw new ConflictException('该设备存在进行中的订单，无法报废');
    }
  }

  if (status === EquipmentStatus.RENTED) {
    throw new BadRequestException('请通过订单流程出租设备');
  }

  if (status === EquipmentStatus.IN_STOCK && oldStatus === EquipmentStatus.RENTED) {
    throw new BadRequestException('请通过订单归还流程收回设备');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await equipment.update({
      status,
      remark: remark || equipment.remark
    }, { transaction: t });

    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.STATUS_CHANGE}_${equipmentId}_${oldStatus}_to_${status}`);
  });

  res.json(ApiResponse.success(equipment, '设备状态更新成功'));
};

export const batchUpdateStatus = async (req: Request, res: Response) => {
  const dto: IBatchUpdateStatusDto & { status: EquipmentStatus } = req.body;

  if (!Array.isArray(dto.ids) || dto.ids.length === 0) {
    throw new BadRequestException('请选择要操作的设备');
  }

  if (!Object.values(EquipmentStatus).includes(dto.status)) {
    throw new BadRequestException('无效的设备状态');
  }

  if (dto.status === EquipmentStatus.RENTED) {
    throw new BadRequestException('批量操作不支持出租状态');
  }

  await sequelize.transaction(async (t: Transaction) => {
    if (dto.status === EquipmentStatus.SCRAPPED) {
      const rentingCount = await RentalOrder.count({
        where: {
          equipmentId: { [Op.in]: dto.ids },
          status: {
            [Op.in]: [
              OrderStatus.PAID,
              OrderStatus.DELIVERED,
              OrderStatus.IN_USE,
              OrderStatus.OVERDUE
            ]
          }
        },
        transaction: t
      });
      if (rentingCount > 0) {
        throw new ConflictException('选中设备中存在进行中的订单，无法批量报废');
      }
    }

    await Equipment.update(
      { status: dto.status },
      { where: { id: { [Op.in]: dto.ids } }, transaction: t }
    );

    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.STATUS_CHANGE}_BATCH_${dto.ids.join(',')}`);
  });

  res.json(ApiResponse.success(null, '批量更新设备状态成功'));
};

export const lockEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { remark } = req.body;

  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) {
    throw new BadRequestException('无效的设备ID');
  }

  const equipment = await Equipment.findByPk(equipmentId);
  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  if (equipment.status !== EquipmentStatus.IN_STOCK) {
    throw new ConflictException('只有在库设备才能锁定');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await equipment.update({
      status: EquipmentStatus.LOCKED,
      remark: remark || equipment.remark
    }, { transaction: t });

    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.LOCK}_${equipmentId}`);
  });

  res.json(ApiResponse.success(equipment, '设备锁定成功'));
};

export const unlockEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { remark } = req.body;

  const equipmentId = parseInt(id);
  if (isNaN(equipmentId)) {
    throw new BadRequestException('无效的设备ID');
  }

  const equipment = await Equipment.findByPk(equipmentId);
  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  if (equipment.status !== EquipmentStatus.LOCKED) {
    throw new ConflictException('只有锁定状态的设备才能解锁');
  }

  await sequelize.transaction(async (t: Transaction) => {
    await equipment.update({
      status: EquipmentStatus.IN_STOCK,
      remark: remark || equipment.remark
    }, { transaction: t });

    await logOperation(req, LogModule.EQUIPMENT, `${LogAction.UNLOCK}_${equipmentId}`);
  });

  res.json(ApiResponse.success(equipment, '设备解锁成功'));
};

export const getEquipmentStats = async (req: Request, res: Response) => {
  const stats = await Equipment.findAll({
    attributes: [
      'status',
      [literal('COUNT(*)'), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const total = await Equipment.count();
  const inStock = await Equipment.count({ where: { status: EquipmentStatus.IN_STOCK } });
  const locked = await Equipment.count({ where: { status: EquipmentStatus.LOCKED } });
  const rented = await Equipment.count({ where: { status: EquipmentStatus.RENTED } });
  const maintenance = await Equipment.count({ where: { status: EquipmentStatus.MAINTENANCE } });
  const scrapped = await Equipment.count({ where: { status: EquipmentStatus.SCRAPPED } });

  res.json(ApiResponse.success({
    total,
    byStatus: {
      inStock,
      locked,
      rented,
      maintenance,
      scrapped
    },
    details: stats
  }));
};

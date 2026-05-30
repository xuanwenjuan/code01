import { Request, Response, NextFunction } from 'express';
import { WorkOrder, Plant, Area, User, sequelize, WorkOrderLog, Material, MaterialUsage } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole, WorkOrderStatus } from '../types';
import { Op } from 'sequelize';
import { createOperationLog } from '../services/operationLogService';
import dayjs from 'dayjs';

const generateOrderNo = async (): Promise<string> => {
  const dateStr = dayjs().format('YYYYMMDD');
  const count = await WorkOrder.count({
    where: {
      orderNo: { [Op.like]: `WO${dateStr}%` }
    }
  });
  return `WO${dateStr}${String(count + 1).padStart(4, '0')}`;
};

export const getWorkOrders = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const {
      page = 1,
      pageSize = 10,
      areaId,
      assignedTo,
      status,
      type,
      priority,
      startDate,
      endDate,
      keyword
    } = req.query;

    const where: any = {};

    if (areaId) where.areaId = areaId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER) {
      where[Op.or] = [
        { assignedTo: req.user.userId },
        { status: WorkOrderStatus.PENDING }
      ];
    }

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      include: [
        { association: 'plant', attributes: ['id', 'code', 'name', 'location'] },
        { association: 'area', attributes: ['id', 'name', 'code'] },
        { association: 'assignee', attributes: ['id', 'username', 'realName', 'phone'] },
        { association: 'creator', attributes: ['id', 'username', 'realName'] }
      ],
      order: [
        ['priority', 'DESC'],
        ['dueDate', 'ASC'],
        ['createdAt', 'DESC']
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      distinct: true
    });

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'query', '查询工单列表', 'success', duration, undefined, { count });

    ResponseUtil.successWithPagination(res, rows, Number(page), Number(pageSize), count);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'query', '查询工单列表失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getWorkOrderById = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        { association: 'plant' },
        { association: 'area' },
        { association: 'assignee', attributes: ['id', 'username', 'realName', 'phone'] },
        { association: 'creator', attributes: ['id', 'username', 'realName'] },
        { association: 'logs', limit: 20, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'query', `查询工单详情: ${workOrder.orderNo}`, 'success', duration);

    ResponseUtil.success(res, workOrder);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'query', '查询工单详情失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const createWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { plantId, areaId, materials, ...data } = req.body;

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (areaId && areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能在所在片区创建工单');
      }
      data.areaId = req.user.areaId;
    }

    if (plantId) {
      const plant = await Plant.findByPk(plantId, { transaction });
      if (!plant) {
        throw new BadRequestException('绿植不存在');
      }
      if (!data.areaId) {
        data.areaId = plant.areaId;
      }
    }

    if (data.areaId) {
      const area = await Area.findByPk(data.areaId, { transaction });
      if (!area) {
        throw new BadRequestException('片区不存在');
      }
    }

    let assignee: any = null;
    if (data.assignedTo) {
      assignee = await User.findByPk(data.assignedTo, { transaction });
      if (!assignee) {
        throw new BadRequestException('指派的养护员不存在');
      }
      if (assignee.role !== UserRole.MAINTENANCE_WORKER) {
        throw new BadRequestException('只能指派养护员执行工单');
      }

      const overlappingOrders = await WorkOrder.count({
        where: {
          assignedTo: data.assignedTo,
          status: {
            [Op.in]: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.ACCEPTED, WorkOrderStatus.IN_PROGRESS]
          },
          dueDate: {
            [Op.gte]: dayjs().subtract(1, 'day').toDate()
          }
        },
        transaction
      });

      if (overlappingOrders >= 3) {
        throw new BadRequestException('该养护员当前已有3个进行中的工单，请选择其他人员');
      }

      data.status = WorkOrderStatus.ASSIGNED;
    } else {
      data.status = WorkOrderStatus.PENDING;
    }

    data.orderNo = await generateOrderNo();
    data.createdBy = req.user?.userId;

    const workOrder = await WorkOrder.create(
      { ...data, plantId, areaId: data.areaId },
      { transaction }
    );

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: 'create',
      oldStatus: null,
      newStatus: workOrder.status,
      remark: '工单已创建'
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'create', `创建工单: ${workOrder.orderNo}`, 'success', duration);

    ResponseUtil.created(res, workOrder);
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'create', '创建工单失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const assignWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { assignedTo, remark } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (workOrder.areaId && workOrder.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能指派所在片区的工单');
      }
    }

    if (![WorkOrderStatus.PENDING, WorkOrderStatus.ASSIGNED].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许指派');
    }

    const assignee = await User.findByPk(assignedTo, { transaction });
    if (!assignee) {
      throw new BadRequestException('养护员不存在');
    }
    if (assignee.role !== UserRole.MAINTENANCE_WORKER) {
      throw new BadRequestException('只能指派养护员执行工单');
    }

    const overlappingOrders = await WorkOrder.count({
      where: {
        assignedTo,
        id: { [Op.ne]: id },
        status: {
          [Op.in]: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.ACCEPTED, WorkOrderStatus.IN_PROGRESS]
        },
        dueDate: {
          [Op.gte]: dayjs().subtract(1, 'day').toDate()
        }
      },
      transaction
    });

    if (overlappingOrders >= 3) {
      throw new BadRequestException('该养护员当前已有3个进行中的工单，请选择其他人员');
    }

    const oldStatus = workOrder.status;
    await workOrder.update({
      assignedTo,
      status: WorkOrderStatus.ASSIGNED,
      assignedAt: new Date()
    }, { transaction });

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: 'assign',
      oldStatus,
      newStatus: WorkOrderStatus.ASSIGNED,
      remark: remark || `工单已指派给 ${assignee.realName}`
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'assign', `指派工单: ${workOrder.orderNo} -> ${assignee.realName}`, 'success', duration);

    ResponseUtil.success(res, workOrder, '工单已指派');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'assign', '指派工单失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const acceptWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.assignedTo !== req.user?.userId) {
      throw new ForbiddenException('您只能接指派给自己的工单');
    }

    if (workOrder.status !== WorkOrderStatus.ASSIGNED) {
      throw new BadRequestException('当前工单状态不允许接单');
    }

    const oldStatus = workOrder.status;
    await workOrder.update({
      status: WorkOrderStatus.ACCEPTED,
      acceptedAt: new Date()
    }, { transaction });

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: 'accept',
      oldStatus,
      newStatus: WorkOrderStatus.ACCEPTED,
      remark: '养护员已接单'
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'accept', `接单: ${workOrder.orderNo}`, 'success', duration);

    ResponseUtil.success(res, workOrder, '接单成功');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'accept', '接单失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const startWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.assignedTo !== req.user?.userId) {
      throw new ForbiddenException('您只能开始自己的工单');
    }

    if (![WorkOrderStatus.ACCEPTED, WorkOrderStatus.IN_PROGRESS].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许开始作业');
    }

    const oldStatus = workOrder.status;
    await workOrder.update({
      status: WorkOrderStatus.IN_PROGRESS,
      startedAt: new Date()
    }, { transaction });

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: 'start',
      oldStatus,
      newStatus: WorkOrderStatus.IN_PROGRESS,
      remark: '开始作业'
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'start', `开始作业: ${workOrder.orderNo}`, 'success', duration);

    ResponseUtil.success(res, workOrder, '作业已开始');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'start', '开始作业失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const completeWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { completionReport, actualDuration, usedMaterials } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.assignedTo !== req.user?.userId) {
      throw new ForbiddenException('您只能完成自己的工单');
    }

    if (![WorkOrderStatus.IN_PROGRESS].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许完工');
    }

    if (usedMaterials && usedMaterials.length > 0) {
      for (const item of usedMaterials) {
        const material = await Material.findByPk(item.materialId, { transaction });
        if (!material) {
          throw new BadRequestException(`物资ID ${item.materialId} 不存在`);
        }
        if (material.quantity < item.quantity) {
          throw new BadRequestException(`物资 ${material.name} 库存不足，当前库存: ${material.quantity}`);
        }

        await material.update({
          quantity: material.quantity - item.quantity,
          totalValue: (material.quantity - item.quantity) * material.unitPrice
        }, { transaction });

        await MaterialUsage.create({
          materialId: item.materialId,
          workOrderId: workOrder.id,
          areaId: workOrder.areaId,
          quantity: item.quantity,
          unitPrice: material.unitPrice,
          totalPrice: item.quantity * material.unitPrice,
          usedBy: req.user?.userId,
          remark: item.remark || '工单完成领用'
        }, { transaction });
      }
    }

    const oldStatus = workOrder.status;
    await workOrder.update({
      status: WorkOrderStatus.COMPLETED,
      completionReport,
      actualDuration,
      completedAt: new Date()
    }, { transaction });

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: 'complete',
      oldStatus,
      newStatus: WorkOrderStatus.COMPLETED,
      remark: completionReport
    }, { transaction });

    if (workOrder.plantId) {
      const plant = await Plant.findByPk(workOrder.plantId, { transaction });
      if (plant) {
        const nextMaintenanceDate = dayjs().add(plant.maintenanceCycle, 'day').toDate();
        await plant.update({
          lastMaintenanceDate: new Date(),
          nextMaintenanceDate,
          healthStatus: PlantHealthStatus.GOOD
        }, { transaction });
      }
    }

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'complete', `完工: ${workOrder.orderNo}`, 'success', duration);

    ResponseUtil.success(res, workOrder, '工单已完成，待核验');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'complete', '完工失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const verifyWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { verified, remark } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (workOrder.areaId && workOrder.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能核验所在片区的工单');
      }
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('当前工单状态不允许核验');
    }

    const oldStatus = workOrder.status;
    const newStatus = verified ? WorkOrderStatus.VERIFIED : WorkOrderStatus.IN_PROGRESS;

    await workOrder.update({
      status: newStatus,
      verifiedAt: verified ? new Date() : null,
      verifiedBy: verified ? req.user?.userId : null
    }, { transaction });

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: verified ? 'verify_pass' : 'verify_reject',
      oldStatus,
      newStatus,
      remark: remark || (verified ? '核验通过' : '核验不通过，请重新作业')
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'verify', `核验工单: ${workOrder.orderNo} - ${verified ? '通过' : '不通过'}`, 'success', duration);

    ResponseUtil.success(res, workOrder, verified ? '核验通过，工单已完成' : '核验不通过，请重新作业');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'verify', '核验失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const cancelWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      if (workOrder.areaId && workOrder.areaId !== req.user.areaId) {
        throw new ForbiddenException('您只能取消所在片区的工单');
      }
    }

    if ([WorkOrderStatus.COMPLETED, WorkOrderStatus.VERIFIED, WorkOrderStatus.CANCELLED].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许取消');
    }

    const oldStatus = workOrder.status;
    await workOrder.update({
      status: WorkOrderStatus.CANCELLED,
      cancelledAt: new Date()
    }, { transaction });

    await WorkOrderLog.create({
      workOrderId: workOrder.id,
      operatorId: req.user?.userId,
      operatorName: req.user?.username,
      action: 'cancel',
      oldStatus,
      newStatus: WorkOrderStatus.CANCELLED,
      remark: reason || '工单已取消'
    }, { transaction });

    await transaction.commit();

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'cancel', `取消工单: ${workOrder.orderNo}`, 'success', duration);

    ResponseUtil.success(res, workOrder, '工单已取消');
  } catch (error) {
    await transaction.rollback();
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'cancel', '取消工单失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

export const getWorkOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const where: any = {};

    if (req.user?.role === UserRole.AREA_MANAGER && req.user.areaId) {
      where.areaId = req.user.areaId;
    }
    if (req.user?.role === UserRole.MAINTENANCE_WORKER) {
      where.assignedTo = req.user.userId;
    }

    const total = await WorkOrder.count({ where });
    const byStatus = await WorkOrder.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });
    const byPriority = await WorkOrder.findAll({
      where,
      attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['priority']
    });
    const byType = await WorkOrder.findAll({
      where,
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['type']
    });

    const overdue = await WorkOrder.count({
      where: {
        ...where,
        status: { [Op.ne]: WorkOrderStatus.CANCELLED },
        dueDate: { [Op.lt]: new Date() }
      }
    });

    const stats = {
      total,
      byStatus: byStatus.map(item => ({
        status: (item as any).status,
        count: Number((item as any).dataValues.count)
      })),
      byPriority: byPriority.map(item => ({
        priority: (item as any).priority,
        count: Number((item as any).dataValues.count)
      })),
      byType: byType.map(item => ({
        type: (item as any).type,
        count: Number((item as any).dataValues.count)
      })),
      overdue
    };

    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'statistics', '查询工单统计数据', 'success', duration);

    ResponseUtil.success(res, stats);
  } catch (error) {
    const duration = Date.now() - startTime;
    await createOperationLog(req, 'workOrder', 'statistics', '查询统计失败', 'error', duration, (error as Error).message);
    next(error);
  }
};

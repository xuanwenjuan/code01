import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { WorkOrder, User, MaterialConsumption, Material, WorkOrderProcess } from '../models';
import { WORK_ORDER_STATUS, ROLES } from '../config';
import { successResponse, notFoundError, badRequestError, forbiddenError, conflictError } from '../utils/response';
import logger from '../utils/logger';
import sequelize from '../config/database';

const STATUS_TRANSITION_RULES: Record<string, string[]> = {
  [WORK_ORDER_STATUS.PENDING_DEPOSIT]: [WORK_ORDER_STATUS.CONFIRMED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.CONFIRMED]: [WORK_ORDER_STATUS.DESIGN_FINALIZED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.DESIGN_FINALIZED]: [WORK_ORDER_STATUS.MATERIAL_COLLECTED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.MATERIAL_COLLECTED]: [WORK_ORDER_STATUS.IN_PRODUCTION, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.IN_PRODUCTION]: [WORK_ORDER_STATUS.QUALITY_INSPECTION, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.QUALITY_INSPECTION]: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.IN_PRODUCTION, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.COMPLETED]: [WORK_ORDER_STATUS.DELIVERED],
  [WORK_ORDER_STATUS.DELIVERED]: [],
  [WORK_ORDER_STATUS.CANCELLED]: [],
  [WORK_ORDER_STATUS.EXPIRED]: [],
};

const ROLE_STATUS_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: Object.values(WORK_ORDER_STATUS),
  [ROLES.OPERATION]: [
    WORK_ORDER_STATUS.CONFIRMED,
    WORK_ORDER_STATUS.DESIGN_FINALIZED,
    WORK_ORDER_STATUS.MATERIAL_COLLECTED,
    WORK_ORDER_STATUS.DELIVERED,
    WORK_ORDER_STATUS.CANCELLED,
  ],
  [ROLES.ARTISAN]: [
    WORK_ORDER_STATUS.IN_PRODUCTION,
    WORK_ORDER_STATUS.QUALITY_INSPECTION,
    WORK_ORDER_STATUS.COMPLETED,
  ],
  [ROLES.MATERIAL_ADMIN]: [WORK_ORDER_STATUS.MATERIAL_COLLECTED],
  [ROLES.FINANCE]: [WORK_ORDER_STATUS.CONFIRMED],
};

const canTransition = (currentStatus: string, targetStatus: string, userRole: string): boolean => {
  const allowedTransitions = STATUS_TRANSITION_RULES[currentStatus];
  if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
    return false;
  }

  const roleAllowedStatuses = ROLE_STATUS_PERMISSIONS[userRole];
  if (!roleAllowedStatuses || !roleAllowedStatuses.includes(targetStatus)) {
    return false;
  }

  return true;
};

const generateOrderNo = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const time = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `WO${year}${month}${day}${time}${random}`;
};

const createDefaultProcesses = async (workOrderId: number): Promise<void> => {
  const processes = [
    { workOrderId, processName: '木胎制作', processOrder: 1 },
    { workOrderId, processName: '裱布刮灰', processOrder: 2 },
    { workOrderId, processName: '反复上漆', processOrder: 3 },
    { workOrderId, processName: '打磨抛光', processOrder: 4 },
    { workOrderId, processName: '装饰纹样', processOrder: 5 },
    { workOrderId, processName: '推光揩清', processOrder: 6 },
  ];

  await WorkOrderProcess.bulkCreate(processes);
};

export const createWorkOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      productName,
      patternDesign,
      patternImage,
      quantity,
      unitPrice,
      depositAmount,
      deadline,
      artisanId,
      remark,
    } = req.body;

    if (artisanId) {
      const artisan = await User.findOne({ where: { id: artisanId, role: ROLES.ARTISAN } });
      if (!artisan) {
        await t.rollback();
        throw notFoundError('指定的匠人不存在');
      }
    }

    const orderNo = generateOrderNo();
    const totalPrice = (quantity || 1) * (unitPrice || 0);

    const workOrder = await WorkOrder.create(
      {
        orderNo,
        customerName,
        customerPhone,
        customerAddress,
        productName,
        patternDesign,
        patternImage,
        quantity: quantity || 1,
        unitPrice: unitPrice || 0,
        totalPrice,
        depositAmount: depositAmount || 0,
        isDepositPaid: false,
        deadline,
        status: WORK_ORDER_STATUS.PENDING_DEPOSIT,
        artisanId,
        remark,
        createdBy: req.user?.id,
      },
      { transaction: t }
    );

    await createDefaultProcesses(workOrder.id);

    await t.commit();

    logger.info(`创建工单成功: ${orderNo} - ${productName} (创建人: ${req.user?.username})`);
    successResponse(res, workOrder, '创建成功', 201);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getWorkOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      status,
      artisanId,
      startDate,
      endDate,
    } = req.query;

    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { customerName: { [Op.like]: `%${keyword}%` } },
        { customerPhone: { [Op.like]: `%${keyword}%` } },
        { productName: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (artisanId) {
      where.artisanId = Number(artisanId);
    }

    if (req.user?.role === ROLES.ARTISAN) {
      where.artisanId = req.user.id;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'artisan',
          attributes: ['id', 'username', 'realName', 'phone'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName'],
        },
      ],
      order: [['id', 'DESC']],
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

export const getWorkOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        {
          model: User,
          as: 'artisan',
          attributes: ['id', 'username', 'realName', 'phone', 'avatar'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName'],
        },
        {
          model: MaterialConsumption,
          as: 'materialConsumptions',
          include: [
            {
              model: Material,
              as: 'material',
              attributes: ['id', 'code', 'name', 'unit', 'unitPrice'],
            },
            {
              model: User,
              as: 'operator',
              attributes: ['id', 'username', 'realName'],
            },
          ],
        },
        {
          model: WorkOrderProcess,
          as: 'processes',
          include: [
            {
              model: User,
              as: 'inspector',
              attributes: ['id', 'username', 'realName'],
            },
          ],
          order: [['processOrder', 'ASC']],
        },
      ],
    });

    if (!workOrder) {
      throw notFoundError('工单不存在');
    }

    if (req.user?.role === ROLES.ARTISAN && workOrder.artisanId !== req.user.id) {
      throw forbiddenError('您无权查看此工单');
    }

    successResponse(res, workOrder, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      throw notFoundError('工单不存在');
    }

    if ([WORK_ORDER_STATUS.CANCELLED, WORK_ORDER_STATUS.EXPIRED, WORK_ORDER_STATUS.DELIVERED].includes(workOrder.status as any)) {
      throw badRequestError('该工单状态不允许修改');
    }

    if (updateData.artisanId && updateData.artisanId !== workOrder.artisanId) {
      const artisan = await User.findOne({ where: { id: updateData.artisanId, role: ROLES.ARTISAN } });
      if (!artisan) {
        throw notFoundError('指定的匠人不存在');
      }
    }

    if (updateData.isDepositPaid === true && !workOrder.isDepositPaid) {
      updateData.status = WORK_ORDER_STATUS.CONFIRMED;
    }

    if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
      const newQuantity = updateData.quantity !== undefined ? updateData.quantity : workOrder.quantity;
      const newUnitPrice = updateData.unitPrice !== undefined ? updateData.unitPrice : workOrder.unitPrice;
      updateData.totalPrice = newQuantity * newUnitPrice;
    }

    await workOrder.update(updateData);

    logger.info(`更新工单成功: ${workOrder.orderNo} (操作人: ${req.user?.username})`);
    successResponse(res, workOrder, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, remark, cancelledReason } = req.body;
    const userRole = req.user?.role as string;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      await t.rollback();
      throw notFoundError('工单不存在');
    }

    if (!canTransition(workOrder.status, status, userRole)) {
      await t.rollback();
      throw badRequestError(`不允许将工单状态从「${workOrder.status}」变更为「${status}」`);
    }

    const updateData: any = { status, remark };

    if (status === WORK_ORDER_STATUS.CANCELLED) {
      updateData.cancelledReason = cancelledReason;
      updateData.cancelledAt = new Date();
    }

    if (status === WORK_ORDER_STATUS.CONFIRMED) {
      updateData.isDepositPaid = true;
    }

    if (status === WORK_ORDER_STATUS.DESIGN_FINALIZED) {
      await lockWorkOrderMaterials(workOrder.id, t);
    }

    if (status === WORK_ORDER_STATUS.COMPLETED) {
      updateData.completedAt = new Date();
      await calculateWorkOrderCost(workOrder.id, t);
    }

    if (status === WORK_ORDER_STATUS.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    await workOrder.update(updateData, { transaction: t });

    await t.commit();

    logger.info(`工单状态更新成功: ${workOrder.orderNo} ${workOrder.status} -> ${status} (操作人: ${req.user?.username})`);
    successResponse(res, workOrder, '状态更新成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const lockWorkOrderMaterials = async (workOrderId: number, t: Transaction): Promise<void> => {
  const consumptions = await MaterialConsumption.findAll({
    where: { workOrderId },
    transaction: t,
  });

  for (const consumption of consumptions) {
    await Material.lockStock(consumption.materialId, consumption.plannedQuantity, t);
  }
};

const calculateWorkOrderCost = async (workOrderId: number, t: Transaction): Promise<void> => {
  const consumptions = await MaterialConsumption.findAll({
    where: { workOrderId },
    include: [{ model: Material, as: 'material' }],
    transaction: t,
  });

  for (const consumption of consumptions) {
    const totalCost = Number(consumption.actualQuantity) * Number(consumption.unitPrice);
    await consumption.update({ totalCost }, { transaction: t });
    await Material.consumeStock(consumption.materialId, consumption.actualQuantity, t);
  }
};

export const deleteWorkOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      throw notFoundError('工单不存在');
    }

    if (![WORK_ORDER_STATUS.PENDING_DEPOSIT, WORK_ORDER_STATUS.CANCELLED, WORK_ORDER_STATUS.EXPIRED].includes(workOrder.status as any)) {
      throw badRequestError('该工单状态不允许删除');
    }

    const consumptionCount = await MaterialConsumption.count({ where: { workOrderId: Number(id) } });
    if (consumptionCount > 0) {
      throw conflictError('该工单已有物料消耗记录，无法删除');
    }

    await workOrder.destroy();

    logger.info(`删除工单成功: ${workOrder.orderNo} (操作人: ${req.user?.username})`);
    successResponse(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    if (req.user?.role === ROLES.ARTISAN) {
      where.artisanId = req.user.id;
    }

    const statusCounts = await WorkOrder.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const totalRevenue = await WorkOrder.sum('totalPrice', {
      where: {
        ...where,
        status: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.DELIVERED],
      },
    });

    const totalOrders = await WorkOrder.count({ where });

    const statistics = {
      totalOrders,
      totalRevenue: totalRevenue || 0,
      statusBreakdown: statusCounts.map((item: any) => ({
        status: item.status,
        count: Number(item.dataValues.count),
      })),
    };

    successResponse(res, statistics, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const payDeposit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { depositAmount } = req.body;

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      throw notFoundError('工单不存在');
    }

    if (workOrder.status !== WORK_ORDER_STATUS.PENDING_DEPOSIT) {
      throw badRequestError('该工单状态不允许支付定金');
    }

    if (workOrder.isDepositPaid) {
      throw badRequestError('该工单已支付定金');
    }

    await workOrder.update({
      depositAmount,
      isDepositPaid: true,
      status: WORK_ORDER_STATUS.CONFIRMED,
    });

    logger.info(`工单定金支付成功: ${workOrder.orderNo} 金额: ${depositAmount} (操作人: ${req.user?.username})`);
    successResponse(res, workOrder, '支付成功');
  } catch (error) {
    next(error);
  }
};

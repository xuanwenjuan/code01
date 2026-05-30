import { Request, Response } from 'express';
import {
  WorkOrder, WorkOrderTrace, WorkOrderMaterial, MaterialStock,
  MaterialLock, MaterialWaste, CostLedger, sequelize
} from '../models';
import { success, badRequest, notFound, forbidden } from '../utils/response';
import { generateOrderNo, generateLedgerNo } from '../utils/batchNo';
import { WorkOrderStatus, UserRole, MaterialLockStatus } from '../types';
import { Op } from 'sequelize';
import dayjs from 'dayjs';

const statusTransitionRules: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [WorkOrderStatus.TYPESETTING, WorkOrderStatus.SUSPENDED],
  [WorkOrderStatus.TYPESETTING]: [WorkOrderStatus.ENGRAVING, WorkOrderStatus.SUSPENDED],
  [WorkOrderStatus.ENGRAVING]: [WorkOrderStatus.PRINTING, WorkOrderStatus.SUSPENDED],
  [WorkOrderStatus.PRINTING]: [WorkOrderStatus.BINDING, WorkOrderStatus.SUSPENDED],
  [WorkOrderStatus.BINDING]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.SUSPENDED],
  [WorkOrderStatus.COMPLETED]: [],
  [WorkOrderStatus.SUSPENDED]: [WorkOrderStatus.PENDING, WorkOrderStatus.TYPESETTING, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.CANCELLED]: []
};

function canTransitionStatus(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return statusTransitionRules[from]?.includes(to) ?? false;
}

async function createTrace(workOrderId: number, fromStatus: WorkOrderStatus | null, toStatus: WorkOrderStatus,
  action: string, operatorId: number, remark?: string, transaction?: any) {
  await WorkOrderTrace.create({
    workOrderId,
    fromStatus,
    toStatus,
    action,
    remark,
    operatorId
  }, { transaction });
}

async function calculateOrderCost(workOrderId: number, transaction: any) {
  const materials = await WorkOrderMaterial.findAll({
    where: { workOrderId },
    transaction
  });
  const materialCost = materials.reduce((sum, m) => sum + Number(m.totalPrice), 0);

  const wastes = await MaterialWaste.findAll({
    where: { workOrderId, isVerified: true },
    transaction
  });
  const wasteCost = wastes.reduce((sum, w) => sum + Number(w.totalCost), 0);

  const order = await WorkOrder.findByPk(workOrderId, { transaction });
  const laborCost = order ? Number(order.quantity) * 50 : 0;

  return {
    materialCost,
    wasteCost,
    laborCost,
    totalCost: materialCost + wasteCost + laborCost
  };
}

export async function createOrder(req: Request, res: Response) {
  const { bookName, bookCode, edition, quantity, priority, deadline, remark, typesetterId, engraverId } = req.body;

  const orderNo = generateOrderNo();

  const order = await WorkOrder.create({
    orderNo,
    bookName,
    bookCode,
    edition,
    quantity,
    status: WorkOrderStatus.PENDING,
    priority: priority || 1,
    deadline,
    remark,
    typesetterId,
    engraverId,
    creatorId: req.user?.userId
  });

  await createTrace(order.id, null, WorkOrderStatus.PENDING, '创建工单', req.user!.userId, remark);

  res.json(success(order, '创建成功'));
}

export async function updateOrder(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;

  const order = await WorkOrder.findByPk(id);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  if (order.status === WorkOrderStatus.COMPLETED || order.status === WorkOrderStatus.CANCELLED) {
    return res.status(400).json(badRequest('已完成或已取消的工单无法修改'));
  }

  await order.update(data);
  res.json(success(order, '更新成功'));
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, remark } = req.body;

  const order = await WorkOrder.findByPk(id);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  if (order.status === WorkOrderStatus.COMPLETED || order.status === WorkOrderStatus.CANCELLED) {
    return res.status(400).json(badRequest('已完成或已取消的工单无法修改状态'));
  }

  if (!canTransitionStatus(order.status, status)) {
    return res.status(400).json(badRequest(`无法从 ${order.status} 状态流转到 ${status}`));
  }

  const t = await sequelize.transaction();

  try {
    const actionMap: Record<string, string> = {
      [WorkOrderStatus.TYPESETTING]: '开始排版',
      [WorkOrderStatus.ENGRAVING]: '开始雕刻',
      [WorkOrderStatus.PRINTING]: '开始印刷',
      [WorkOrderStatus.BINDING]: '开始装订',
      [WorkOrderStatus.COMPLETED]: '完成工单',
      [WorkOrderStatus.SUSPENDED]: '搁置工单',
      [WorkOrderStatus.CANCELLED]: '取消工单'
    };

    await order.update({ status }, { transaction: t });

    await createTrace(order.id, order.status, status, actionMap[status] || '状态变更',
      req.user!.userId, remark, t);

    if (status === WorkOrderStatus.COMPLETED) {
      await order.update({ completedAt: new Date() }, { transaction: t });

      const cost = await calculateOrderCost(order.id, t);

      await CostLedger.create({
        ledgerNo: generateLedgerNo(),
        workOrderId: order.id,
        bookName: order.bookName,
        materialCost: cost.materialCost,
        wasteCost: cost.wasteCost,
        laborCost: cost.laborCost,
        totalCost: cost.totalCost,
        statisticsDate: new Date(),
        operatorId: req.user!.userId
      }, { transaction: t });

      await MaterialLock.update(
        { status: MaterialLockStatus.CONSUMED },
        { where: { workOrderId: order.id, status: MaterialLockStatus.LOCKED }, transaction: t }
      );
    }

    if (status === WorkOrderStatus.CANCELLED) {
      await MaterialLock.update(
        { status: MaterialLockStatus.RELEASED, releasedAt: new Date() },
        { where: { workOrderId: order.id, status: MaterialLockStatus.LOCKED }, transaction: t }
      );
    }

    await t.commit();
    res.json(success({
      fromStatus: order.status,
      toStatus: status,
      cost: status === WorkOrderStatus.COMPLETED ? await calculateOrderCost(order.id, undefined) : undefined
    }, '状态更新成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function completeOrder(req: Request, res: Response) {
  const { id } = req.params;
  const { remark } = req.body;

  const order = await WorkOrder.findByPk(id);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  if (order.status === WorkOrderStatus.COMPLETED) {
    return res.status(400).json(badRequest('工单已完成'));
  }

  const t = await sequelize.transaction();

  try {
    const previousStatus = order.status;

    await order.update({
      status: WorkOrderStatus.COMPLETED,
      completedAt: new Date()
    }, { transaction: t });

    await createTrace(order.id, previousStatus, WorkOrderStatus.COMPLETED,
      '完成工单', req.user!.userId, remark, t);

    const cost = await calculateOrderCost(order.id, t);

    await CostLedger.create({
      ledgerNo: generateLedgerNo(),
      workOrderId: order.id,
      bookName: order.bookName,
      materialCost: cost.materialCost,
      wasteCost: cost.wasteCost,
      laborCost: cost.laborCost,
      totalCost: cost.totalCost,
      statisticsDate: new Date(),
      operatorId: req.user!.userId
    }, { transaction: t });

    await MaterialLock.update(
      { status: MaterialLockStatus.CONSUMED },
      { where: { workOrderId: order.id, status: MaterialLockStatus.LOCKED }, transaction: t }
    );

    await t.commit();
    res.json(success({
      orderId: order.id,
      status: WorkOrderStatus.COMPLETED,
      cost
    }, '工单完成，成本汇总已生成'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function assignWorker(req: Request, res: Response) {
  const { id } = req.params;
  const { typesetterId, engraverId, printerId, binderId } = req.body;

  const order = await WorkOrder.findByPk(id);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  if (order.status === WorkOrderStatus.COMPLETED || order.status === WorkOrderStatus.CANCELLED) {
    return res.status(400).json(badRequest('已完成或已取消的工单无法分配人员'));
  }

  await order.update({ typesetterId, engraverId, printerId, binderId });

  await createTrace(order.id, order.status, order.status, '分配工作人员', req.user!.userId);

  res.json(success(null, '分配成功'));
}

export async function getOrderList(req: Request, res: Response) {
  const { status, priority, keyword, page = 1, pageSize = 10, mine = 'false' } = req.query;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }
  if (keyword) {
    where[Op.or] = [
      { bookName: { [Op.like]: `%${keyword}%` } },
      { orderNo: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (mine === 'true' && req.user) {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole === UserRole.TYPESETTER) {
      where.typesetterId = userId;
    } else if (userRole === UserRole.ENGRAVER) {
      where.engraverId = userId;
    } else {
      where.creatorId = userId;
    }
  }

  const { count, rows } = await WorkOrder.findAndCountAll({
    where,
    include: [
      { model: WorkOrderTrace, limit: 1, order: [['createdAt', 'DESC']] }
    ],
    order: [['priority', 'DESC'], ['createdAt', 'DESC']],
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

export async function getOrderDetail(req: Request, res: Response) {
  const { id } = req.params;

  const order = await WorkOrder.findByPk(id, {
    include: [
      { model: WorkOrderTrace, order: [['createdAt', 'ASC']] },
      { model: WorkOrderMaterial },
      { model: MaterialLock }
    ]
  });

  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  const cost = await calculateOrderCost(order.id, undefined);

  res.json(success({ ...order.toJSON(), cost }));
}

export async function getOrderTraces(req: Request, res: Response) {
  const { id } = req.params;

  const traces = await WorkOrderTrace.findAll({
    where: { workOrderId: id },
    order: [['createdAt', 'ASC']]
  });

  res.json(success(traces));
}

export async function addOrderMaterial(req: Request, res: Response) {
  const { id } = req.params;
  const { materialStockId, quantity, unit } = req.body;

  const order = await WorkOrder.findByPk(id);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  if (order.status === WorkOrderStatus.COMPLETED || order.status === WorkOrderStatus.CANCELLED) {
    return res.status(400).json(badRequest('已完成或已取消的工单无法添加物料'));
  }

  const stock = await MaterialStock.findByPk(materialStockId);
  if (!stock) {
    return res.status(400).json(badRequest('物料库存不存在'));
  }

  if (Number(stock.quantity) < Number(quantity)) {
    return res.status(400).json(badRequest('库存数量不足'));
  }

  const t = await sequelize.transaction();

  try {
    const totalPrice = Number(quantity) * Number(stock.unitPrice);

    await WorkOrderMaterial.create({
      workOrderId: id,
      materialStockId,
      categoryId: stock.categoryId,
      materialName: stock.name,
      quantity,
      unit: unit || stock.unit,
      unitPrice: stock.unitPrice,
      totalPrice,
      operatorId: req.user?.userId
    }, { transaction: t });

    await stock.update({
      quantity: Number(stock.quantity) - Number(quantity)
    }, { transaction: t });

    await createTrace(order.id, order.status, order.status,
      `使用物料: ${stock.name} x ${quantity}`, req.user!.userId, '', t);

    await t.commit();
    res.json(success(null, '用料添加成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function getOrderMaterials(req: Request, res: Response) {
  const { id } = req.params;

  const materials = await WorkOrderMaterial.findAll({
    where: { workOrderId: id },
    include: [{ model: MaterialStock }],
    order: [['createdAt', 'DESC']]
  });

  const totalCost = materials.reduce((sum, m) => sum + Number(m.totalPrice), 0);

  res.json(success({
    list: materials,
    totalCost,
    totalCount: materials.length
  }));
}

export async function getOrderStatistics(req: Request, res: Response) {
  const stats = await WorkOrder.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const total = await WorkOrder.count();

  const today = dayjs().startOf('day').toDate();
  const todayCreated = await WorkOrder.count({
    where: { createdAt: { [Op.gte]: today } }
  });

  const todayCompleted = await WorkOrder.count({
    where: { completedAt: { [Op.gte]: today } }
  });

  res.json(success({
    stats,
    total,
    todayCreated,
    todayCompleted
  }));
}

export async function getMyOrders(req: Request, res: Response) {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  let where: any = {};
  let orConditions: any[] = [];

  switch (userRole) {
    case UserRole.TYPESETTER:
      orConditions.push({ typesetterId: userId });
      break;
    case UserRole.ENGRAVER:
      orConditions.push({ engraverId: userId });
      break;
    case UserRole.ADMIN:
    case UserRole.MATERIAL_ADMIN:
      break;
    default:
      orConditions.push({ creatorId: userId });
  }

  if (orConditions.length > 0) {
    where[Op.or] = orConditions;
  }

  const orders = await WorkOrder.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 100
  });

  res.json(success(orders));
}

export async function suspendTimeoutOrders(req: Request, res: Response) {
  const threeDaysAgo = dayjs().subtract(3, 'day').toDate();

  const pendingOrders = await WorkOrder.findAll({
    where: {
      status: WorkOrderStatus.PENDING,
      createdAt: { [Op.lte]: threeDaysAgo }
    }
  });

  const t = await sequelize.transaction();

  try {
    for (const order of pendingOrders) {
      await order.update({ status: WorkOrderStatus.SUSPENDED }, { transaction: t });
      await createTrace(order.id, WorkOrderStatus.PENDING, WorkOrderStatus.SUSPENDED,
        '系统自动搁置', 0, '超过3天未处理', t);
    }

    await t.commit();
    res.json(success({ suspendedCount: pendingOrders.length }, '超时工单自动搁置完成'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function batchUpdateOrderStatus(req: Request, res: Response) {
  const { ids, status, remark } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(badRequest('请选择要更新的工单'));
  }

  const t = await sequelize.transaction();

  try {
    const orders = await WorkOrder.findAll({ where: { id: { [Op.in]: ids } }, transaction: t });

    for (const order of orders) {
      if (order.status !== WorkOrderStatus.COMPLETED &&
          order.status !== WorkOrderStatus.CANCELLED &&
          canTransitionStatus(order.status, status)) {
        await order.update({ status }, { transaction: t });
        await createTrace(order.id, order.status, status, '批量状态更新',
          req.user!.userId, remark, t);
      }
    }

    await t.commit();
    res.json(success({ updatedCount: orders.length }, '批量更新成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

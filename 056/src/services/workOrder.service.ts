import { Transaction, FindOptions, Op } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrder, Equipment, User } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { WorkOrderStatus, EquipmentStatus, UserRole } from '../types';
import CodeGenerator from '../utils/generator';
import logger from '../utils/logger';

interface WorkOrderCreateData {
  title: string;
  equipmentId: number;
  type: 'repair' | 'maintenance' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  faultDescription?: string;
  reportedBy: number;
}

interface WorkOrderUpdateData {
  title?: string;
  type?: 'repair' | 'maintenance' | 'emergency';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  faultDescription?: string;
}

interface AssignData {
  assignedTo: number;
}

interface CompleteData {
  maintenanceContent: string;
  maintenanceResult: string;
  partsUsed?: string;
  laborHours?: number;
}

interface AcceptData {
  acceptedBy: number;
  acceptedRemark?: string;
}

interface CloseData {
  closedBy: number;
  closedRemark?: string;
}

interface StatusStatisticsItem {
  status: WorkOrderStatus;
  count: number;
}

interface TypeStatisticsItem {
  type: string;
  count: number;
}

interface FindAllParams {
  title?: string;
  orderNo?: string;
  equipmentId?: number;
  assignedTo?: number;
  reportedBy?: number;
  status?: WorkOrderStatus;
  type?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export class WorkOrderService {
  private validateStatusTransition(
    currentStatus: WorkOrderStatus,
    nextStatus: WorkOrderStatus
  ): boolean {
    const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      [WorkOrderStatus.PENDING]: [WorkOrderStatus.ASSIGNED],
      [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.IN_PROGRESS],
      [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED],
      [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.ACCEPTED],
      [WorkOrderStatus.ACCEPTED]: [WorkOrderStatus.CLOSED],
      [WorkOrderStatus.CLOSED]: [],
    };
    return validTransitions[currentStatus].includes(nextStatus);
  }

  private async validateAssigneeAssignment(
    order: WorkOrder,
    userId: number,
    userRole: UserRole
  ): Promise<void> {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
      return;
    }

    if (order.assignedTo && order.assignedTo !== userId) {
      throw new ForbiddenError('只有指派的维修人员才能执行此操作');
    }
  }

  async create(data: WorkOrderCreateData): Promise<WorkOrder> {
    const equipment = await Equipment.findByPk(data.equipmentId);
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    const orderNo = CodeGenerator.generateOrderNo();

    const order = await WorkOrder.create({
      ...data,
      orderNo,
      status: WorkOrderStatus.PENDING,
      reportedAt: new Date(),
    });

    logger.info(`创建维保工单成功: ${orderNo}`);
    return order;
  }

  async assign(id: number, data: AssignData, assignerRole: UserRole): Promise<WorkOrder> {
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      throw new NotFoundError('工单不存在');
    }

    if (!this.validateStatusTransition(order.status, WorkOrderStatus.ASSIGNED)) {
      throw new BadRequestError(`当前状态 ${order.status} 无法指派`);
    }

    if (assignerRole !== UserRole.ADMIN && assignerRole !== UserRole.MANAGER) {
      throw new ForbiddenError('只有管理员或经理才能派单');
    }

    const assignee = await User.findByPk(data.assignedTo);
    if (!assignee) {
      throw new NotFoundError('维修人员不存在');
    }

    const updatedOrder = await order.update({
      assignedTo: data.assignedTo,
      assignedAt: new Date(),
      status: WorkOrderStatus.ASSIGNED,
    });

    logger.info(`指派维保工单成功: ${order.orderNo}`);
    return updatedOrder;
  }

  async start(id: number, userId: number, userRole: UserRole): Promise<WorkOrder> {
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      throw new NotFoundError('工单不存在');
    }

    if (!this.validateStatusTransition(order.status, WorkOrderStatus.IN_PROGRESS)) {
      throw new BadRequestError(`当前状态 ${order.status} 无法开始维修`);
    }

    this.validateAssigneeAssignment(order, userId, userRole);

    const updatedOrder = await order.update({
      status: WorkOrderStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    logger.info(`开始维修工单成功: ${order.orderNo}`);
    return updatedOrder;
  }

  async complete(
    id: number,
    data: CompleteData,
    userId: number,
    userRole: UserRole
  ): Promise<WorkOrder> {
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      throw new NotFoundError('工单不存在');
    }

    if (!this.validateStatusTransition(order.status, WorkOrderStatus.COMPLETED)) {
      throw new BadRequestError(`当前状态 ${order.status} 无法完成维修`);
    }

    this.validateAssigneeAssignment(order, userId, userRole);

    const updatedOrder = await order.update({
      ...data,
      status: WorkOrderStatus.COMPLETED,
      completedAt: new Date(),
    });

    logger.info(`完成维修工单成功: ${order.orderNo}`);
    return updatedOrder;
  }

  async accept(
    id: number,
    data: AcceptData,
    userRole: UserRole
  ): Promise<WorkOrder> {
    const t: Transaction = await sequelize.transaction();

    try {
      const order = await WorkOrder.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('工单不存在');
      }

      if (!this.validateStatusTransition(order.status, WorkOrderStatus.ACCEPTED)) {
        throw new BadRequestError(`当前状态 ${order.status} 无法验收`);
      }

      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new ForbiddenError('只有管理员或经理才能验收');
      }

      const updatedOrder = await order.update(
        {
          ...data,
          status: WorkOrderStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        { transaction: t }
      );

      await Equipment.update(
        { status: EquipmentStatus.NORMAL },
        { where: { id: order.equipmentId }, transaction: t }
      );

      await t.commit();
      logger.info(`验收维保工单成功: ${order.orderNo}`);
      return updatedOrder;
    } catch (error) {
      await t.rollback();
      logger.error(`验收维保工单失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async close(
    id: number,
    data: CloseData,
    userRole: UserRole
  ): Promise<WorkOrder> {
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      throw new NotFoundError('工单不存在');
    }

    if (!this.validateStatusTransition(order.status, WorkOrderStatus.CLOSED)) {
      throw new BadRequestError(`当前状态 ${order.status} 无法关闭`);
    }

    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      throw new ForbiddenError('只有管理员或经理才能关闭工单');
    }

    const updatedOrder = await order.update({
      ...data,
      status: WorkOrderStatus.CLOSED,
      closedAt: new Date(),
    });

    logger.info(`关闭维保工单成功: ${order.orderNo}`);
    return updatedOrder;
  }

  async update(id: number, data: WorkOrderUpdateData): Promise<WorkOrder> {
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      throw new NotFoundError('工单不存在');
    }

    if (order.status === WorkOrderStatus.CLOSED) {
      throw new BadRequestError('已关闭的工单不能修改');
    }

    await order.update(data);
    logger.info(`更新维保工单成功: ${order.orderNo}`);
    return order;
  }

  async delete(id: number): Promise<void> {
    const order = await WorkOrder.findByPk(id);
    if (!order) {
      throw new NotFoundError('工单不存在');
    }

    if (order.status !== WorkOrderStatus.PENDING) {
      throw new BadRequestError('只能删除待处理的工单');
    }

    await order.destroy();
    logger.info(`删除维保工单成功: ${order.orderNo}`);
  }

  async findById(id: number): Promise<WorkOrder> {
    const order = await WorkOrder.findByPk(id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'reporter', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'accepter', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'closer', attributes: ['id', 'username', 'realName'] },
      ],
    });
    if (!order) {
      throw new NotFoundError('工单不存在');
    }
    return order;
  }

  async findAll(params: FindAllParams): Promise<{
    list: WorkOrder[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      title,
      orderNo,
      equipmentId,
      assignedTo,
      reportedBy,
      status,
      type,
      priority,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = params;

    const where: Record<string, unknown> = {};

    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }

    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (reportedBy) {
      where.reportedBy = reportedBy;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (startDate && endDate) {
      where.reportedAt = { [Op.between]: [startDate, endDate] };
    }

    const options: FindOptions = {
      where,
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'reporter', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'realName'] },
      ],
      order: [['reportedAt', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await WorkOrder.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async getMyOrders(
    userId: number,
    params: {
      status?: WorkOrderStatus;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    list: WorkOrder[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { status, page = 1, pageSize = 10 } = params;
    const where: Record<string, unknown> = { assignedTo: userId };

    if (status) {
      where.status = status;
    }

    const options: FindOptions = {
      where,
      include: [{ model: Equipment, as: 'equipment' }],
      order: [['reportedAt', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await WorkOrder.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async getStatistics(): Promise<StatusStatisticsItem[]> {
    const result = await WorkOrder.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    return result.map((item) => ({
      status: item.getDataValue('status') as WorkOrderStatus,
      count: Number(item.getDataValue('count')),
    }));
  }

  async getStatisticsByType(): Promise<TypeStatisticsItem[]> {
    const result = await WorkOrder.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['type'],
    });

    return result.map((item) => ({
      type: item.getDataValue('type') as string,
      count: Number(item.getDataValue('count')),
    }));
  }
}

export default new WorkOrderService();

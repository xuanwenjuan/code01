import { Op, Transaction, WhereOptions } from 'sequelize';
import { Order, Worker, User, ServiceCategory, Settlement, OrderStatusHistory, sequelize } from '../models';
import { OrderStatus, PaymentStatus, SettlementStatus, WorkerStatus } from '../types';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '../exceptions/HttpException';

export interface CreateOrderDto {
  userId: string;
  serviceCategoryId: string;
  serviceAddress: string;
  serviceCity: string;
  scheduledDate: Date;
  scheduledTime?: string;
  contactName: string;
  contactPhone: string;
  description?: string;
  serviceFee: number;
}

export interface AssignOrderDto {
  orderId: string;
  workerId: string;
  assignedBy: string;
}

export interface CancelOrderDto {
  orderId: string;
  cancelReason: string;
}

export interface CompleteOrderDto {
  orderId: string;
  rating?: number;
  review?: string;
}

export interface OrderQueryDto {
  userId?: string;
  workerId?: string;
  status?: OrderStatus;
  serviceArea?: string;
  startDate?: Date;
  endDate?: Date;
}

class OrderService {
  private getValidStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PENDING_ASSIGN, OrderStatus.CANCELLED],
      [OrderStatus.PENDING_ASSIGN]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED, OrderStatus.EXPIRED],
      [OrderStatus.ASSIGNED]: [OrderStatus.WORKER_ON_WAY, OrderStatus.CANCELLED],
      [OrderStatus.WORKER_ON_WAY]: [OrderStatus.IN_SERVICE, OrderStatus.CANCELLED],
      [OrderStatus.IN_SERVICE]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.EXPIRED]: [],
      [OrderStatus.REFUNDING]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: []
    };
    return transitions[currentStatus] || [];
  }

  private async validateStatusTransition(order: Order, newStatus: OrderStatus): Promise<boolean> {
    const validTransitions = this.getValidStatusTransitions(order.status as OrderStatus);
    return validTransitions.includes(newStatus);
  }

  private async recordStatusHistory(
    orderId: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string,
    remark?: string,
    transaction?: Transaction
  ) {
    await OrderStatusHistory.create({
      orderId,
      oldStatus,
      newStatus,
      changedBy,
      remark
    }, { transaction });
  }

  async createOrder(createDto: CreateOrderDto) {
    const serviceCategory = await ServiceCategory.findByPk(createDto.serviceCategoryId);
    if (!serviceCategory) {
      throw new NotFoundException('服务类目不存在');
    }

    const order = await Order.create({
      ...createDto,
      orderNo: this.generateOrderNo(),
      status: OrderStatus.PENDING_PAYMENT,
      paymentStatus: PaymentStatus.UNPAID,
      totalAmount: createDto.serviceFee
    });

    return order;
  }

  async payOrder(orderId: string, userId: string) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权操作该订单');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('订单状态不允许支付');
    }

    const isValidTransition = await this.validateStatusTransition(order, OrderStatus.PENDING_ASSIGN);
    if (!isValidTransition) {
      throw new BadRequestException('订单状态无法变更');
    }

    await sequelize.transaction(async (t: Transaction) => {
      await order.update(
        {
          status: OrderStatus.PENDING_ASSIGN,
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date()
        },
        { transaction: t }
      );

      await this.recordStatusHistory(
        orderId,
        OrderStatus.PENDING_PAYMENT,
        OrderStatus.PENDING_ASSIGN,
        userId,
        '用户支付',
        t
      );
    });

    return order;
  }

  async assignOrder(assignDto: AssignOrderDto) {
    const { orderId, workerId, assignedBy } = assignDto;

    const result = await sequelize.transaction(async (t: Transaction) => {
      const order = await Order.findByPk(orderId, { transaction: t, lock: true });
      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING_ASSIGN) {
        throw new BadRequestException('订单状态不允许派单');
      }

      const worker = await Worker.findByPk(workerId, { transaction: t, lock: true });
      if (!worker) {
        throw new NotFoundException('师傅不存在');
      }

      if (worker.status !== WorkerStatus.ON_DUTY && worker.status !== WorkerStatus.BUSY) {
        throw new BadRequestException('该师傅当前无法接单');
      }

      const isAvailable = await this.checkWorkerAvailabilityInTransaction(workerId, order.scheduledDate, t);
      if (!isAvailable) {
        throw new ConflictException('该师傅在指定时间已有预约，请选择其他师傅或时间');
      }

      await order.update(
        {
          workerId,
          status: OrderStatus.ASSIGNED,
          assignedAt: new Date()
        },
        { transaction: t }
      );

      await this.recordStatusHistory(
        orderId,
        OrderStatus.PENDING_ASSIGN,
        OrderStatus.ASSIGNED,
        assignedBy,
        '调度派单',
        t
      );

      await worker.update(
        { status: WorkerStatus.BUSY },
        { transaction: t }
      );

      return order;
    });

    return result;
  }

  private async checkWorkerAvailabilityInTransaction(workerId: string, scheduledDate: Date | null, transaction: Transaction): Promise<boolean> {
    if (!scheduledDate) {
      return true;
    }

    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Order.count({
      where: {
        workerId,
        status: { [Op.in]: [OrderStatus.ASSIGNED, OrderStatus.WORKER_ON_WAY, OrderStatus.IN_SERVICE] },
        scheduledDate: { [Op.between]: [startOfDay, endOfDay] }
      },
      transaction
    });

    return count === 0;
  }

  async workerAcceptOrder(orderId: string, workerId: string) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.workerId !== workerId) {
      throw new ForbiddenException('无权操作该订单');
    }

    if (order.status !== OrderStatus.ASSIGNED) {
      throw new BadRequestException('订单状态不允许操作');
    }

    const isValidTransition = await this.validateStatusTransition(order, OrderStatus.WORKER_ON_WAY);
    if (!isValidTransition) {
      throw new BadRequestException('订单状态无法变更');
    }

    await sequelize.transaction(async (t: Transaction) => {
      await order.update(
        { status: OrderStatus.WORKER_ON_WAY },
        { transaction: t }
      );

      await this.recordStatusHistory(
        orderId,
        OrderStatus.ASSIGNED,
        OrderStatus.WORKER_ON_WAY,
        workerId,
        '师傅已出发',
        t
      );
    });

    return order;
  }

  async workerStartService(orderId: string, workerId: string) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.workerId !== workerId) {
      throw new ForbiddenException('无权操作该订单');
    }

    if (order.status !== OrderStatus.WORKER_ON_WAY) {
      throw new BadRequestException('订单状态不允许操作');
    }

    const isValidTransition = await this.validateStatusTransition(order, OrderStatus.IN_SERVICE);
    if (!isValidTransition) {
      throw new BadRequestException('订单状态无法变更');
    }

    await sequelize.transaction(async (t: Transaction) => {
      await order.update(
        { status: OrderStatus.IN_SERVICE, serviceStartTime: new Date() },
        { transaction: t }
      );

      await this.recordStatusHistory(
        orderId,
        OrderStatus.WORKER_ON_WAY,
        OrderStatus.IN_SERVICE,
        workerId,
        '师傅开始服务',
        t
      );
    });

    return order;
  }

  async workerCompleteService(orderId: string, workerId: string) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.workerId !== workerId) {
      throw new ForbiddenException('无权操作该订单');
    }

    if (order.status !== OrderStatus.IN_SERVICE) {
      throw new BadRequestException('订单状态不允许操作');
    }

    const isValidTransition = await this.validateStatusTransition(order, OrderStatus.COMPLETED);
    if (!isValidTransition) {
      throw new BadRequestException('订单状态无法变更');
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      await order.update(
        { status: OrderStatus.COMPLETED, serviceEndTime: new Date(), completedAt: new Date() },
        { transaction: t }
      );

      await this.recordStatusHistory(
        orderId,
        OrderStatus.IN_SERVICE,
        OrderStatus.COMPLETED,
        workerId,
        '师傅完成服务',
        t
      );

      const settlement = await this.createSettlementFromOrder(order, t);

      if (order.workerId) {
        await Worker.increment(
          { completedCount: 1, orderCount: 1 },
          { where: { id: order.workerId }, transaction: t }
        );
      }

      if (order.workerId) {
        await this.unlockWorkerScheduleInTransaction(order.workerId, t);
      }

      return { order, settlement };
    });

    return result;
  }

  private async createSettlementFromOrder(order: Order, transaction: Transaction) {
    const commissionRate = 0.15;
    const commissionAmount = Number(order.totalAmount) * commissionRate;
    const workerAmount = Number(order.totalAmount) - commissionAmount;

    const settlement = await Settlement.create({
      orderId: order.id,
      workerId: order.workerId,
      userId: order.userId,
      serviceCategoryId: order.serviceCategoryId,
      totalAmount: order.totalAmount,
      commissionRate,
      commissionAmount,
      workerAmount,
      platformAmount: commissionAmount,
      status: SettlementStatus.PENDING
    }, { transaction });

    return settlement;
  }

  private async unlockWorkerScheduleInTransaction(workerId: string, transaction: Transaction) {
    const activeOrders = await Order.count({
      where: {
        workerId,
        status: { [Op.in]: [OrderStatus.ASSIGNED, OrderStatus.WORKER_ON_WAY, OrderStatus.IN_SERVICE] }
      },
      transaction
    });

    if (activeOrders === 0) {
      await Worker.update(
        { status: WorkerStatus.ON_DUTY },
        { where: { id: workerId }, transaction }
      );
    }
  }

  async customerCancelOrder(orderId: string, userId: string, cancelReason: string) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权操作该订单');
    }

    const canCancelStatuses = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PENDING_ASSIGN,
      OrderStatus.ASSIGNED,
      OrderStatus.WORKER_ON_WAY
    ];

    if (!canCancelStatuses.includes(order.status as OrderStatus)) {
      throw new BadRequestException('订单当前状态不允许取消');
    }

    const isValidTransition = await this.validateStatusTransition(order, OrderStatus.CANCELLED);
    if (!isValidTransition) {
      throw new BadRequestException('订单状态无法变更');
    }

    await sequelize.transaction(async (t: Transaction) => {
      await order.update(
        { status: OrderStatus.CANCELLED, cancelReason, cancelledAt: new Date() },
        { transaction: t }
      );

      await this.recordStatusHistory(
        orderId,
        order.status,
        OrderStatus.CANCELLED,
        userId,
        cancelReason,
        t
      );

      if (order.workerId) {
        await this.unlockWorkerScheduleInTransaction(order.workerId, t);
      }
    });

    return order;
  }

  async getOrderById(orderId: string) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          association: 'worker',
          include: [{ association: 'user', attributes: { exclude: ['password'] } }]
        },
        { association: 'serviceCategory' },
        { association: 'statusHistory', separate: true, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async getOrderList(
    queryDto: OrderQueryDto,
    page: number = 1,
    pageSize: number = 10
  ) {
    const where: WhereOptions = {};

    if (queryDto.userId) {
      where.userId = queryDto.userId;
    }
    if (queryDto.workerId) {
      where.workerId = queryDto.workerId;
    }
    if (queryDto.status) {
      where.status = queryDto.status;
    }
    if (queryDto.serviceArea) {
      where.serviceCity = queryDto.serviceArea;
    }
    if (queryDto.startDate && queryDto.endDate) {
      where.createdAt = {
        [Op.between]: [queryDto.startDate, queryDto.endDate]
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          association: 'worker',
          include: [{ association: 'user', attributes: { exclude: ['password'] } }]
        },
        { association: 'serviceCategory' }
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async processTimeoutOrders() {
    const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000);

    const orders = await Order.findAll({
      where: {
        status: OrderStatus.PENDING_ASSIGN,
        createdAt: { [Op.lte]: timeoutThreshold }
      }
    });

    for (const order of orders) {
      await sequelize.transaction(async (t: Transaction) => {
        await order.update(
          { status: OrderStatus.EXPIRED },
          { transaction: t }
        );

        await this.recordStatusHistory(
          order.id,
          OrderStatus.PENDING_ASSIGN,
          OrderStatus.EXPIRED,
          'system',
          '超时未派单，自动过期',
          t
        );
      });
    }

    return { processedCount: orders.length };
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${timestamp}${random}`;
  }
}

export default new OrderService();

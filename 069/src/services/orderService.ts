import Order, { OrderStatus, OrderAttributes, OrderCreationAttributes } from '../models/Order';
import OrderLog from '../models/OrderLog';
import Branch, { BranchStatus } from '../models/Branch';
import Vehicle, { VehicleStatus } from '../models/Vehicle';
import { NotFoundError, BusinessError } from '../utils/errors';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import dayjs from 'dayjs';

class OrderService {
  private generateOrderNo(): string {
    const now = dayjs();
    const timestamp = now.format('YYYYMMDDHHmmss');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WL${timestamp}${random}`;
  }

  private async addOrderLog(
    orderId: number,
    status: string,
    description: string,
    operatorId?: number,
    operatorName?: string,
    location?: string,
    remark?: string
  ): Promise<void> {
    await OrderLog.create({
      orderId,
      status,
      operatorId,
      operatorName,
      description,
      location,
      remark
    });
  }

  private getStatusDescription(status: OrderStatus): string {
    const descriptions: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: '待揽收',
      [OrderStatus.PICKED_UP]: '已揽收',
      [OrderStatus.IN_TRANSIT]: '干线运输中',
      [OrderStatus.TRANSFERRING]: '中转分拨中',
      [OrderStatus.DELIVERING]: '末端派送中',
      [OrderStatus.DELIVERED]: '已送达',
      [OrderStatus.SIGNED]: '已签收',
      [OrderStatus.ABNORMAL]: '异常',
      [OrderStatus.CANCELLED]: '已取消'
    };
    return descriptions[status];
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED, OrderStatus.ABNORMAL],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.ABNORMAL],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.TRANSFERRING, OrderStatus.DELIVERED, OrderStatus.ABNORMAL],
      [OrderStatus.TRANSFERRING]: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERING, OrderStatus.ABNORMAL],
      [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED, OrderStatus.SIGNED, OrderStatus.ABNORMAL],
      [OrderStatus.DELIVERED]: [OrderStatus.SIGNED, OrderStatus.ABNORMAL],
      [OrderStatus.SIGNED]: [],
      [OrderStatus.ABNORMAL]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
      [OrderStatus.CANCELLED]: []
    };

    return transitions[currentStatus]?.includes(newStatus) || false;
  }

  private validateActiveBranch(branch: Branch, operation: string): void {
    if (branch.status !== BranchStatus.ACTIVE) {
      throw new BusinessError(`${branch.name} 未处于运营状态，${operation}`);
    }
  }

  async createOrder(data: Omit<OrderCreationAttributes, 'orderNo' | 'status'>): Promise<Order> {
    const t = await sequelize.transaction();
    try {
      const orderNo = this.generateOrderNo();

      if (data.shipperBranchId) {
        const branch = await Branch.findByPk(data.shipperBranchId, { transaction: t });
        if (!branch) {
          throw new NotFoundError('发货网点不存在');
        }
        this.validateActiveBranch(branch, '无法创建订单');
      }

      if (data.receiverBranchId) {
        const branch = await Branch.findByPk(data.receiverBranchId, { transaction: t });
        if (!branch) {
          throw new NotFoundError('收货网点不存在');
        }
        this.validateActiveBranch(branch, '无法创建订单');
      }

      if (data.vehicleId) {
        const vehicle = await Vehicle.findByPk(data.vehicleId, { transaction: t });
        if (!vehicle) {
          throw new NotFoundError('车辆不存在');
        }
        if (vehicle.status !== VehicleStatus.IDLE) {
          throw new BusinessError('所选车辆非空闲状态，无法分配');
        }
      }

      const order = await Order.create(
        {
          ...data,
          orderNo,
          status: OrderStatus.PENDING
        },
        { transaction: t }
      );

      await this.addOrderLog(
        order.id,
        order.status,
        '订单创建成功',
        data.operatorId,
        undefined,
        data.shipperAddress
      );

      await t.commit();
      return this.getOrderById(order.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateOrder(id: number, data: Partial<OrderAttributes>): Promise<Order> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BusinessError('订单已开始流转，无法修改');
    }

    await order.update(data);
    return this.getOrderById(id);
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await Order.findByPk(id, {
      include: [
        { model: Branch, as: 'shipperBranch' },
        { model: Branch, as: 'receiverBranch' },
        { model: Branch, as: 'currentBranch' },
        { model: Vehicle, as: 'vehicle' },
        { model: OrderLog, as: 'logs', order: [['createdAt', 'ASC']] }
      ]
    });
    if (!order) {
      throw new NotFoundError('订单不存在');
    }
    return order;
  }

  async getOrderList(params: {
    status?: OrderStatus;
    shipperBranchId?: number;
    receiverBranchId?: number;
    vehicleId?: number;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ list: Order[]; total: number; page: number; pageSize: number }> {
    const {
      status,
      shipperBranchId,
      receiverBranchId,
      vehicleId,
      keyword,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params;

    const where: any = {};

    if (status) where.status = status;
    if (shipperBranchId) where.shipperBranchId = shipperBranchId;
    if (receiverBranchId) where.receiverBranchId = receiverBranchId;
    if (vehicleId) where.vehicleId = vehicleId;

    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { shipperName: { [Op.like]: `%${keyword}%` } },
        { shipperPhone: { [Op.like]: `%${keyword}%` } },
        { receiverName: { [Op.like]: `%${keyword}%` } },
        { receiverPhone: { [Op.like]: `%${keyword}%` } },
        { goodsName: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = dayjs(startDate).startOf('day').toDate();
      if (endDate) where.createdAt[Op.lte] = dayjs(endDate).endOf('day').toDate();
    }

    const order: any[] = [[sortBy, sortOrder], ['id', 'DESC']];

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'shipperBranch' },
        { model: Branch, as: 'receiverBranch' },
        { model: Vehicle, as: 'vehicle' }
      ],
      order,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateOrderStatus(
    id: number,
    status: OrderStatus,
    operatorId?: number,
    operatorName?: string,
    remark?: string
  ): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.SIGNED) {
        throw new BusinessError('订单已完成或已取消，无法修改状态');
      }

      if (order.status !== status) {
        if (!this.validateStatusTransition(order.status, status)) {
          throw new BusinessError(`无法从${this.getStatusDescription(order.status)}状态转换为${this.getStatusDescription(status)}状态`);
        }
      }

      await order.update({ status, operatorId }, { transaction: t });

      const description = this.getStatusDescription(status);

      await this.addOrderLog(
        id,
        status,
        description,
        operatorId,
        operatorName,
        undefined,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async pickupOrder(
    id: number,
    operatorId?: number,
    operatorName?: string,
    remark?: string,
    vehicleId?: number
  ): Promise<Order> {
    const t = await sequelize.transaction();
    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BusinessError('当前订单状态不允许揽收');
      }

      if (vehicleId) {
        const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t });
        if (!vehicle) {
          throw new NotFoundError('车辆不存在');
        }
        if (vehicle.status !== VehicleStatus.IDLE) {
          throw new BusinessError('所选车辆非空闲状态，无法分配');
        }
        await vehicle.update({ status: VehicleStatus.IN_TRANSIT }, { transaction: t });
        await order.update({ vehicleId, status: OrderStatus.PICKED_UP, operatorId }, { transaction: t });
      } else {
        if (order.vehicleId) {
          const vehicle = await Vehicle.findByPk(order.vehicleId, { transaction: t });
          if (vehicle && vehicle.status === VehicleStatus.IDLE) {
            await vehicle.update({ status: VehicleStatus.IN_TRANSIT }, { transaction: t });
          }
        }
        await order.update({ status: OrderStatus.PICKED_UP, operatorId }, { transaction: t });
      }

      await this.addOrderLog(
        id,
        OrderStatus.PICKED_UP,
        '货物已揽收',
        operatorId,
        operatorName,
        undefined,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async startTransit(
    id: number,
    vehicleId: number,
    operatorId?: number,
    operatorName?: string,
    remark?: string
  ): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.PICKED_UP && order.status !== OrderStatus.TRANSFERRING) {
        throw new BusinessError('当前订单状态不允许开始干线运输');
      }

      const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t });
      if (!vehicle) {
        throw new NotFoundError('车辆不存在');
      }

      if (vehicle.status !== VehicleStatus.IDLE) {
        throw new BusinessError('所选车辆非空闲状态，无法分配');
      }

      await vehicle.update({ status: VehicleStatus.IN_TRANSIT }, { transaction: t });

      await order.update(
        {
          status: OrderStatus.IN_TRANSIT,
          vehicleId,
          operatorId
        },
        { transaction: t }
      );

      await this.addOrderLog(
        id,
        OrderStatus.IN_TRANSIT,
        `开始干线运输（车辆：${vehicle.plateNumber}）`,
        operatorId,
        operatorName,
        undefined,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async transferOrder(
    id: number,
    currentBranchId: number,
    operatorId?: number,
    operatorName?: string,
    remark?: string
  ): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.IN_TRANSIT) {
        throw new BusinessError('当前订单状态不允许中转分拨');
      }

      const branch = await Branch.findByPk(currentBranchId, { transaction: t });
      if (!branch) {
        throw new NotFoundError('中转网点不存在');
      }

      this.validateActiveBranch(branch, '无法进行中转分拨');

      await order.update(
        {
          status: OrderStatus.TRANSFERRING,
          currentBranchId,
          operatorId
        },
        { transaction: t }
      );

      await this.addOrderLog(
        id,
        OrderStatus.TRANSFERRING,
        `到达中转网点（${branch.name}），开始分拨`,
        operatorId,
        operatorName,
        branch.name,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async startDelivery(
    id: number,
    operatorId?: number,
    operatorName?: string,
    remark?: string
  ): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.TRANSFERRING && order.status !== OrderStatus.IN_TRANSIT) {
        throw new BusinessError('当前订单状态不允许开始派送');
      }

      await order.update(
        {
          status: OrderStatus.DELIVERING,
          operatorId
        },
        { transaction: t }
      );

      await this.addOrderLog(
        id,
        OrderStatus.DELIVERING,
        '开始末端派送',
        operatorId,
        operatorName,
        undefined,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async signOrder(
    id: number,
    operatorId?: number,
    operatorName?: string,
    remark?: string
  ): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERING) {
        throw new BusinessError('当前订单状态不允许签收');
      }

      if (order.vehicleId) {
        const vehicle = await Vehicle.findByPk(order.vehicleId, { transaction: t });
        if (vehicle && vehicle.status === VehicleStatus.IN_TRANSIT) {
          await vehicle.update({ status: VehicleStatus.IDLE }, { transaction: t });
        }
      }

      await order.update(
        {
          status: OrderStatus.SIGNED,
          operatorId
        },
        { transaction: t }
      );

      await this.addOrderLog(
        id,
        OrderStatus.SIGNED,
        '订单已签收',
        operatorId,
        operatorName,
        undefined,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async markAbnormal(
    id: number,
    remark: string,
    operatorId?: number,
    operatorName?: string
  ): Promise<Order> {
    if (!remark || remark.trim().length === 0) {
      throw new BusinessError('异常原因不能为空');
    }

    return this.updateOrderStatus(
      id,
      OrderStatus.ABNORMAL,
      operatorId,
      operatorName,
      remark
    );
  }

  async resolveAbnormal(
    id: number,
    targetStatus: OrderStatus,
    remark: string,
    operatorId?: number,
    operatorName?: string,
    vehicleId?: number
  ): Promise<Order> {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.ABNORMAL) {
        throw new BusinessError('当前订单不是异常状态');
      }

      if (!this.validateStatusTransition(OrderStatus.ABNORMAL, targetStatus)) {
        throw new BusinessError('不支持的异常处理方式');
      }

      if (targetStatus === OrderStatus.IN_TRANSIT && vehicleId) {
        const vehicle = await Vehicle.findByPk(vehicleId, { transaction: t });
        if (!vehicle) {
          throw new NotFoundError('车辆不存在');
        }
        if (vehicle.status !== VehicleStatus.IDLE) {
          throw new BusinessError('所选车辆非空闲状态，无法分配');
        }
        await vehicle.update({ status: VehicleStatus.IN_TRANSIT }, { transaction: t });
      }

      await order.update(
        {
          status: targetStatus,
          operatorId,
          vehicleId: vehicleId || order.vehicleId
        },
        { transaction: t }
      );

      await this.addOrderLog(
        id,
        targetStatus,
        `异常已处理：${remark}`,
        operatorId,
        operatorName
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancelOrder(
    id: number,
    remark: string,
    operatorId?: number,
    operatorName?: string
  ): Promise<Order> {
    if (!remark || remark.trim().length === 0) {
      throw new BusinessError('取消原因不能为空');
    }

    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.ABNORMAL) {
        throw new BusinessError('当前订单状态不允许取消');
      }

      if (order.vehicleId) {
        const vehicle = await Vehicle.findByPk(order.vehicleId, { transaction: t });
        if (vehicle && vehicle.status === VehicleStatus.IN_TRANSIT) {
          await vehicle.update({ status: VehicleStatus.IDLE }, { transaction: t });
        }
      }

      await order.update(
        {
          status: OrderStatus.CANCELLED,
          operatorId
        },
        { transaction: t }
      );

      await this.addOrderLog(
        id,
        OrderStatus.CANCELLED,
        '订单已取消',
        operatorId,
        operatorName,
        undefined,
        remark
      );

      await t.commit();
      return this.getOrderById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getOrderLogs(id: number): Promise<OrderLog[]> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    return OrderLog.findAll({
      where: { orderId: id },
      order: [['createdAt', 'DESC']]
    });
  }

  async getOrderStatistics(params: {
    startDate?: string;
    endDate?: string;
    branchId?: number;
    vehicleId?: number;
  }): Promise<any> {
    const { startDate, endDate, branchId, vehicleId } = params;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = dayjs(startDate).startOf('day').toDate();
      if (endDate) where.createdAt[Op.lte] = dayjs(endDate).endOf('day').toDate();
    }

    if (branchId) {
      where[Op.or] = [
        { shipperBranchId: branchId },
        { receiverBranchId: branchId }
      ];
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const statistics = {} as any;

    for (const status of Object.values(OrderStatus)) {
      statistics[status] = await Order.count({
        where: { ...where, status }
      });
    }

    statistics.total = await Order.count({ where });

    const amountResult = await Order.findOne({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('freightAmount')), 'totalFreight'],
        [sequelize.fn('SUM', sequelize.col('insuranceAmount')), 'totalInsurance'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount']
      ],
      raw: true
    });

    statistics.totalFreight = amountResult?.totalFreight || 0;
    statistics.totalInsurance = amountResult?.totalInsurance || 0;
    statistics.totalAmount = amountResult?.totalAmount || 0;

    statistics.totalWeight = await Order.sum('goodsWeight', { where }) || 0;

    return statistics;
  }

  async autoTransitionStatus(): Promise<void> {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();

    const ordersToSign = await Order.findAll({
      where: {
        status: OrderStatus.DELIVERED,
        updatedAt: { [Op.lte]: thirtyDaysAgo }
      }
    });

    for (const order of ordersToSign) {
      await this.signOrder(
        order.id,
        undefined,
        'System Auto Sign',
        '系统自动签收（送达30天未签收）'
      );
    }
  }
}

export default new OrderService();

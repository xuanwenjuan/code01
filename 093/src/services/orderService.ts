import { Transaction } from 'sequelize';
import Order from '../models/Order';
import OrderProcessLog from '../models/OrderProcessLog';
import {
  OrderStatus,
  UserRole,
  LockType,
  CompleteOrderParams,
  CostCalculationResult,
} from '../types';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import Category from '../models/Category';
import Material from '../models/Material';
import User from '../models/User';
import MaterialLock from '../models/MaterialLock';
import { CategoryService } from './categoryService';
import { MaterialService } from './materialService';

interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  categoryId: number;
  materialId?: number;
  quantity: number;
  unitPrice: number;
  drawingUrl?: string;
  requirements?: string;
  estimatedDeliveryDate?: Date;
  remark?: string;
}

interface UpdateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  categoryId?: number;
  materialId?: number;
  quantity?: number;
  unitPrice?: number;
  drawingUrl?: string;
  requirements?: string;
  estimatedDeliveryDate?: Date;
  remark?: string;
  assignedTo?: number;
}

interface UpdateStatusRequest {
  status: OrderStatus;
  remark?: string;
  operatorId?: number;
  operatorRole?: UserRole;
}

interface StatusTransition {
  from: OrderStatus[];
  to: OrderStatus;
  allowedRoles: UserRole[];
  description: string;
}

const statusTransitions: StatusTransition[] = [
  {
    from: [OrderStatus.PENDING_PAYMENT],
    to: OrderStatus.PAID,
    allowedRoles: [UserRole.ADMIN, UserRole.DESIGN],
    description: '订单支付',
  },
  {
    from: [OrderStatus.PAID],
    to: OrderStatus.DESIGNING,
    allowedRoles: [UserRole.ADMIN, UserRole.DESIGN],
    description: '开始设计',
  },
  {
    from: [OrderStatus.DESIGNING],
    to: OrderStatus.PRODUCTION_SCHEDULED,
    allowedRoles: [UserRole.ADMIN, UserRole.DESIGN],
    description: '安排生产',
  },
  {
    from: [OrderStatus.PRODUCTION_SCHEDULED],
    to: OrderStatus.CNC_PROCESSING,
    allowedRoles: [UserRole.ADMIN, UserRole.PRODUCTION],
    description: '开始CNC加工',
  },
  {
    from: [OrderStatus.CNC_PROCESSING],
    to: OrderStatus.QUALITY_CHECKING,
    allowedRoles: [UserRole.ADMIN, UserRole.PRODUCTION],
    description: '开始质检',
  },
  {
    from: [OrderStatus.QUALITY_CHECKING],
    to: OrderStatus.POLISHING,
    allowedRoles: [UserRole.ADMIN, UserRole.PRODUCTION],
    description: '开始打磨',
  },
  {
    from: [OrderStatus.POLISHING],
    to: OrderStatus.READY_TO_SHIP,
    allowedRoles: [UserRole.ADMIN, UserRole.PRODUCTION, UserRole.WAREHOUSE],
    description: '准备发货',
  },
  {
    from: [OrderStatus.READY_TO_SHIP],
    to: OrderStatus.SHIPPED,
    allowedRoles: [UserRole.ADMIN, UserRole.WAREHOUSE],
    description: '已发货',
  },
  {
    from: [OrderStatus.SHIPPED],
    to: OrderStatus.DELIVERED,
    allowedRoles: [UserRole.ADMIN, UserRole.WAREHOUSE],
    description: '已送达',
  },
  {
    from: [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.DESIGNING,
      OrderStatus.PRODUCTION_SCHEDULED,
    ],
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.ADMIN, UserRole.DESIGN],
    description: '订单取消',
  },
];

export class OrderService {
  static generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${dateStr}${random}`;
  }

  static getNextStatus(currentStatus: OrderStatus): OrderStatus[] {
    return statusTransitions
      .filter((t) => t.from.includes(currentStatus))
      .map((t) => t.to);
  }

  static validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    operatorRole?: UserRole
  ): { valid: boolean; message: string } {
    if (currentStatus === newStatus) {
      return { valid: false, message: '订单状态未改变' };
    }

    if (currentStatus === OrderStatus.CANCELLED || currentStatus === OrderStatus.CLOSED) {
      return { valid: false, message: '订单已关闭，无法修改状态' };
    }

    const transition = statusTransitions.find(
      (t) => t.from.includes(currentStatus) && t.to === newStatus
    );

    if (!transition) {
      const nextStatuses = this.getNextStatus(currentStatus);
      if (nextStatuses.length === 0) {
        return { valid: false, message: '当前订单状态无法变更' };
      }
      return {
        valid: false,
        message: `状态变更不合法，当前状态可变更为: ${nextStatuses.join(', ')}`,
      };
    }

    if (operatorRole && !transition.allowedRoles.includes(operatorRole)) {
      return {
        valid: false,
        message: `该状态变更需要角色: ${transition.allowedRoles.join(', ')}`,
      };
    }

    return { valid: true, message: transition.description };
  }

  static async create(data: CreateOrderRequest, createdBy?: number): Promise<Order> {
    await CategoryService.validateActiveCategory(data.categoryId);

    if (data.materialId) {
      const material = await Material.findByPk(data.materialId);
      if (!material) {
        throw new BadRequestError('原料不存在');
      }
      if (material.status !== 'available') {
        throw new BadRequestError('原料不可用');
      }
    }

    const orderNo = this.generateOrderNo();
    const totalAmount = data.quantity * data.unitPrice;

    const order = await Order.create({
      ...data,
      orderNo,
      totalAmount,
      status: OrderStatus.PENDING_PAYMENT,
      createdBy,
    });

    await OrderProcessLog.create({
      orderId: order.id,
      newStatus: OrderStatus.PENDING_PAYMENT,
      operatorId: createdBy,
      remark: '订单创建',
    });

    return order;
  }

  static async update(id: number, data: UpdateOrderRequest): Promise<Order> {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.CLOSED) {
      throw new BadRequestError('订单已关闭，无法修改');
    }

    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.DESIGNING
    ) {
      throw new BadRequestError('订单已进入生产流程，无法修改');
    }

    if (data.categoryId) {
      await CategoryService.validateActiveCategory(data.categoryId);
    }

    const updateData: any = { ...data };
    if (data.quantity !== undefined || data.unitPrice !== undefined) {
      const quantity = data.quantity ?? order.quantity;
      const unitPrice = data.unitPrice ?? order.unitPrice;
      updateData.totalAmount = quantity * unitPrice;
    }

    await order.update(updateData);

    return order;
  }

  static async updateStatus(id: number, data: UpdateStatusRequest): Promise<Order> {
    return await sequelize.transaction(async (t: Transaction) => {
      const order = await Order.findByPk(id, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      const validation = this.validateStatusTransition(
        order.status,
        data.status,
        data.operatorRole
      );

      if (!validation.valid) {
        throw new BadRequestError(validation.message);
      }

      const previousStatus = order.status;
      const updateData: any = { status: data.status };

      if (data.status === OrderStatus.PAID) {
        updateData.paidAt = new Date();
      }

      if (data.status === OrderStatus.DELIVERED) {
        updateData.actualDeliveryDate = new Date();
      }

      await order.update(updateData, { transaction: t });

      await OrderProcessLog.create(
        {
          orderId: order.id,
          previousStatus,
          newStatus: data.status,
          operatorId: data.operatorId,
          remark: data.remark || validation.description,
        },
        { transaction: t }
      );

      return order;
    });
  }

  static async getById(id: number): Promise<Order> {
    const order = await Order.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Material, as: 'material' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'realName'] },
        {
          model: OrderProcessLog,
          as: 'processLogs',
          include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    const orderJson = order.toJSON();
    (orderJson as any).nextStatuses = this.getNextStatus(order.status);

    return order as Order & { nextStatuses?: OrderStatus[] };
  }

  static async getList(
    page: number = 1,
    pageSize: number = 10,
    orderNo?: string,
    customerName?: string,
    status?: OrderStatus,
    assignedTo?: number
  ): Promise<{ list: Order[]; total: number }> {
    const where: any = {};
    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }
    if (customerName) {
      where.customerName = { [Op.like]: `%${customerName}%` };
    }
    if (status) {
      where.status = status;
    }
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Category, as: 'category' },
        { model: Material, as: 'material' },
      ],
    });

    return { list: rows, total: count };
  }

  static async cancelOrder(id: number, operatorId?: number, operatorRole?: UserRole): Promise<Order> {
    return await this.updateStatus(id, {
      status: OrderStatus.CANCELLED,
      remark: '订单取消',
      operatorId,
      operatorRole,
    });
  }

  static async closeExpiredOrders(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await Order.findAll({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: { [Op.lte]: twentyFourHoursAgo },
      },
    });

    for (const order of orders) {
      await sequelize.transaction(async (t: Transaction) => {
        await order.update({ status: OrderStatus.CLOSED }, { transaction: t });
        await OrderProcessLog.create(
          {
            orderId: order.id,
            previousStatus: OrderStatus.PENDING_PAYMENT,
            newStatus: OrderStatus.CLOSED,
            remark: '超时未支付自动关闭',
          },
          { transaction: t }
        );
      });
    }

    return orders.length;
  }

  static async scheduleProduction(
    orderId: number,
    materialId: number,
    requiredQuantity: number,
    operatorId?: number,
    remarks?: string
  ): Promise<Order> {
    return await sequelize.transaction(async (t: Transaction) => {
      const order = await Order.findByPk(orderId, { transaction: t });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.DESIGNING && order.status !== OrderStatus.PAID) {
        throw new BadRequestError('当前订单状态不允许排产');
      }

      if (!order.materialId) {
        await order.update({ materialId }, { transaction: t });
      }

      await MaterialService.lockMaterial(
        materialId,
        orderId,
        requiredQuantity,
        LockType.PRODUCTION_SCHEDULE,
        operatorId,
        remarks
      );

      const previousStatus = order.status;
      await order.update(
        {
          status: OrderStatus.PRODUCTION_SCHEDULED,
          scheduledQuantity: (order.scheduledQuantity || 0) + requiredQuantity,
        },
        { transaction: t }
      );

      await OrderProcessLog.create(
        {
          orderId: order.id,
          previousStatus,
          newStatus: OrderStatus.PRODUCTION_SCHEDULED,
          operatorId,
          remark: remarks || '生产排产完成',
        },
        { transaction: t }
      );

      return order;
    });
  }

  static async completeOrder(params: CompleteOrderParams): Promise<CostCalculationResult> {
    return await sequelize.transaction(async (t: Transaction) => {
      const order = await Order.findByPk(params.orderId, {
        include: [{ model: Material, as: 'material' }],
        transaction: t,
      });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      if (order.status !== OrderStatus.POLISHING && order.status !== OrderStatus.CNC_PROCESSING) {
        throw new BadRequestError('当前订单状态不允许完工');
      }

      const activeLocks = await MaterialLock.findAll({
        where: { orderId: params.orderId, isActive: true },
        transaction: t,
      });

      for (const lock of activeLocks) {
        await MaterialService.unlockMaterial(lock.id);
      }

      if (order.materialId && order.material) {
        const material = await Material.findByPk(order.materialId, { transaction: t });
        if (material) {
          const lockedQuantity = Math.max(0, material.lockedQuantity - params.actualMaterialUsed);
          const availableQuantity = material.quantity - lockedQuantity;
          await material.update(
            {
              quantity: Math.max(0, material.quantity - params.actualMaterialUsed),
              lockedQuantity,
              availableQuantity,
              status: availableQuantity > 0 ? OrderStatus.AVAILABLE : material.status,
            },
            { transaction: t }
          );
        }
      }

      const costs = this.calculateProductionCosts(
        order,
        params.actualMaterialUsed,
        params.laborHours,
        params.machineHours,
        params.additionalCosts
      );

      const previousStatus = order.status;
      await order.update(
        {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
          actualMaterialUsed: params.actualMaterialUsed,
          laborHours: params.laborHours,
          machineHours: params.machineHours,
          materialCost: costs.materialCost,
          laborCost: costs.laborCost,
          machineCost: costs.machineCost,
          additionalCosts: costs.additionalCosts,
          totalProductionCost: costs.totalCost,
          materialWastage: costs.materialWastage,
          wastageRate: costs.wastageRate,
        },
        { transaction: t }
      );

      await OrderProcessLog.create(
        {
          orderId: order.id,
          previousStatus,
          newStatus: OrderStatus.COMPLETED,
          operatorId: params.operatorId,
          remark: params.remarks || '订单生产完工',
        },
        { transaction: t }
      );

      return costs;
    });
  }

  private static calculateProductionCosts(
    order: Order & { material?: Material },
    actualMaterialUsed: number,
    laborHours: number,
    machineHours: number,
    additionalCosts: number = 0
  ): CostCalculationResult {
    const unitMaterialCost = order.material?.unitCost || 0;
    const materialCost = actualMaterialUsed * unitMaterialCost;

    const laborHourRate = 50;
    const laborCost = laborHours * laborHourRate;

    const machineHourRate = 80;
    const machineCost = machineHours * machineHourRate;

    const totalCost = materialCost + laborCost + machineCost + additionalCosts;

    const expectedMaterialUsage = order.quantity * 1.05;
    const materialWastage = Math.max(0, actualMaterialUsed - expectedMaterialUsage);
    const wastageRate = expectedMaterialUsage > 0 ? (materialWastage / expectedMaterialUsage) * 100 : 0;

    return {
      materialCost,
      laborCost,
      machineCost,
      additionalCosts,
      totalCost,
      materialWastage,
      wastageRate: Math.round(wastageRate * 100) / 100,
    };
  }

  static async getOrderMaterialLocks(orderId: number): Promise<MaterialLock[]> {
    return await MaterialLock.findAll({
      where: { orderId, isActive: true },
      include: [{ model: Material, as: 'material' }],
      order: [['lockedAt', 'DESC']],
    });
  }

  static async getStatusStatistics(): Promise<any> {
    const statuses = Object.values(OrderStatus);
    const statistics: any = {};

    for (const status of statuses) {
      const count = await Order.count({ where: { status } });
      statistics[status] = count;
    }

    return statistics;
  }
}

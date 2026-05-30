import RentalOrder from '../models/RentalOrder';
import Equipment from '../models/Equipment';
import { OrderStatus, EquipmentStatus, PageResult, OperationModule, OperationType, AdminRole } from '../types';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/errorHandler';
import { OperationLogService } from './OperationLogService';
import { Request } from 'express';
import sequelize from '../config/database';
import { Op, Transaction } from 'sequelize';

export interface CreateOrderParams {
  equipmentId: number;
  storeId: number;
  customerName: string;
  customerPhone: string;
  customerIdCard?: string;
  startDate: Date;
  endDate: Date;
  deposit: number;
  dailyRent: number;
  totalAmount: number;
  remark?: string;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface OutboundParams {
  orderId: number;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface ReturnParams {
  orderId: number;
  returnDate?: Date;
  damageCompensation?: number;
  remark?: string;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface OrderQueryParams {
  page: number;
  pageSize: number;
  orderNo?: string;
  customerName?: string;
  customerPhone?: string;
  equipmentId?: number;
  storeId?: number;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export class RentalOrderService {
  private static readonly statusTransitions: Map<OrderStatus, OrderStatus[]> = new Map([
    [OrderStatus.PENDING, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
    [OrderStatus.CONFIRMED, [OrderStatus.OUTBOUND, OrderStatus.CANCELLED]],
    [OrderStatus.OUTBOUND, [OrderStatus.IN_USE, OrderStatus.CANCELLED]],
    [OrderStatus.IN_USE, [OrderStatus.RETURNED, OrderStatus.OVERDUE]],
    [OrderStatus.OVERDUE, [OrderStatus.RETURNED]],
    [OrderStatus.RETURNED, [OrderStatus.COMPLETED]],
    [OrderStatus.COMPLETED, []],
    [OrderStatus.CANCELLED, []]
  ]);

  private static canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
    const allowedStatuses = this.statusTransitions.get(currentStatus) || [];
    return allowedStatuses.includes(nextStatus);
  }

  private static async validateTransition(order: RentalOrder, nextStatus: OrderStatus): Promise<void> {
    if (!this.canTransition(order.status as OrderStatus, nextStatus)) {
      throw new BadRequestError(`订单状态不允许从 ${order.status} 变更为 ${nextStatus}`);
    }
  }

  static async generateOrderNo(prefix: string = 'RO'): Promise<string> {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    const lastOrder = await RentalOrder.findOne({
      where: { orderNo: { [Op.like]: `${prefix}${dateStr}%` } },
      order: [['orderNo', 'DESC']]
    });

    let sequence = 1;
    if (lastOrder) {
      const match = lastOrder.orderNo.match(/\d{4}$/);
      if (match) {
        sequence = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}${dateStr}${String(sequence).padStart(4, '0')}`;
  }

  static async create(params: CreateOrderParams): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const equipment = await Equipment.findByPk(params.equipmentId, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      if (equipment.status !== EquipmentStatus.IN_STOCK) {
        throw new BadRequestError('装备不在库，无法创建订单');
      }

      const orderNo = await this.generateOrderNo();

      const order = await RentalOrder.create({
        orderNo,
        equipmentId: params.equipmentId,
        storeId: params.storeId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerIdCard: params.customerIdCard,
        startDate: params.startDate,
        endDate: params.endDate,
        deposit: params.deposit,
        dailyRent: params.dailyRent,
        totalAmount: params.totalAmount,
        status: OrderStatus.PENDING,
        createdBy: params.operatorId,
        remark: params.remark
      }, { transaction });

      await equipment.update({ status: EquipmentStatus.RESERVED }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.CREATE,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: params.storeId,
        afterData: order.toJSON(),
        remark: '创建租赁订单',
        req: params.req
      });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: equipment.storeId,
        beforeData: { ...equipment.toJSON(), status: EquipmentStatus.IN_STOCK },
        afterData: { ...equipment.toJSON(), status: EquipmentStatus.RESERVED },
        remark: '创建订单锁定装备',
        req: params.req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async confirm(id: number, operatorId: number, operatorName: string, req?: Request): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const order = await RentalOrder.findByPk(id, { transaction, lock: true });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      const beforeData = order.toJSON();

      await this.validateTransition(order, OrderStatus.CONFIRMED);

      await order.update({ status: OrderStatus.CONFIRMED }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.STATUS_CHANGE,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId,
        operatorName,
        storeId: order.storeId,
        beforeData,
        afterData: order.toJSON(),
        remark: '确认订单',
        req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async outbound(params: OutboundParams): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const order = await RentalOrder.findByPk(params.orderId, { transaction, lock: true });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      await this.validateTransition(order, OrderStatus.OUTBOUND);

      const equipment = await Equipment.findByPk(order.equipmentId, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      if (equipment.status !== EquipmentStatus.RESERVED) {
        throw new BadRequestError('装备状态异常，无法出库');
      }

      const beforeOrderData = order.toJSON();
      const beforeEquipmentData = equipment.toJSON();

      await order.update({ 
        status: OrderStatus.OUTBOUND,
        outboundBy: params.operatorId,
        outboundDate: new Date()
      }, { transaction });

      await equipment.update({ status: EquipmentStatus.RENTED }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.RENTAL_OUTBOUND,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: order.storeId,
        beforeData: beforeOrderData,
        afterData: order.toJSON(),
        remark: '装备出库',
        req: params.req
      });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: equipment.storeId,
        beforeData: beforeEquipmentData,
        afterData: equipment.toJSON(),
        remark: '装备出库',
        req: params.req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async startUse(id: number, operatorId: number, operatorName: string, req?: Request): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const order = await RentalOrder.findByPk(id, { transaction, lock: true });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      const beforeData = order.toJSON();

      await this.validateTransition(order, OrderStatus.IN_USE);

      await order.update({ status: OrderStatus.IN_USE }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.STATUS_CHANGE,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId,
        operatorName,
        storeId: order.storeId,
        beforeData,
        afterData: order.toJSON(),
        remark: '开始使用装备',
        req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async return(params: ReturnParams): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const order = await RentalOrder.findByPk(params.orderId, { transaction, lock: true });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      await this.validateTransition(order, OrderStatus.RETURNED);

      const equipment = await Equipment.findByPk(order.equipmentId, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      const beforeOrderData = order.toJSON();
      const beforeEquipmentData = equipment.toJSON();

      const actualReturnDate = params.returnDate || new Date();
      const rentalDays = Math.ceil((actualReturnDate.getTime() - new Date(order.startDate).getTime()) / (24 * 60 * 60 * 1000));
      const actualTotalAmount = rentalDays * order.dailyRent;

      await order.update({ 
        status: OrderStatus.RETURNED,
        actualReturnDate,
        actualTotalAmount,
        damageCompensation: params.damageCompensation || 0,
        returnBy: params.operatorId,
        remark: params.remark
      }, { transaction });

      await equipment.update({ status: EquipmentStatus.IN_STOCK }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.RENTAL_RETURN,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: order.storeId,
        beforeData: beforeOrderData,
        afterData: order.toJSON(),
        remark: '装备归还',
        req: params.req
      });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: equipment.storeId,
        beforeData: beforeEquipmentData,
        afterData: equipment.toJSON(),
        remark: '装备归还入库',
        req: params.req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async complete(id: number, operatorId: number, operatorName: string, req?: Request): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const order = await RentalOrder.findByPk(id, { transaction, lock: true });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      const beforeData = order.toJSON();

      await this.validateTransition(order, OrderStatus.COMPLETED);

      await order.update({ status: OrderStatus.COMPLETED }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.STATUS_CHANGE,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId,
        operatorName,
        storeId: order.storeId,
        beforeData,
        afterData: order.toJSON(),
        remark: '订单完成结算',
        req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async cancel(id: number, operatorId: number, operatorName: string, req?: Request): Promise<RentalOrder> {
    const transaction = await sequelize.transaction();

    try {
      const order = await RentalOrder.findByPk(id, { transaction, lock: true });
      if (!order) {
        throw new NotFoundError('订单不存在');
      }

      const beforeData = order.toJSON();

      await this.validateTransition(order, OrderStatus.CANCELLED);

      const equipment = await Equipment.findByPk(order.equipmentId, { transaction, lock: true });
      if (equipment && equipment.status === EquipmentStatus.RESERVED) {
        await equipment.update({ status: EquipmentStatus.IN_STOCK }, { transaction });
      }

      await order.update({ status: OrderStatus.CANCELLED }, { transaction });

      await OperationLogService.create({
        module: OperationModule.RENTAL_ORDER,
        type: OperationType.STATUS_CHANGE,
        targetId: order.id,
        targetName: order.orderNo,
        operatorId,
        operatorName,
        storeId: order.storeId,
        beforeData,
        afterData: order.toJSON(),
        remark: '取消订单',
        req
      });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getById(id: number): Promise<RentalOrder | null> {
    return await RentalOrder.findByPk(id, {
      include: [
        { model: Equipment, as: 'equipment' }
      ]
    });
  }

  static async getList(params: OrderQueryParams, userRole?: AdminRole, userStoreId?: number): Promise<PageResult<RentalOrder>> {
    const { page, pageSize, orderNo, customerName, customerPhone, equipmentId, storeId, status, startDate, endDate } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (userRole !== AdminRole.SUPER_ADMIN && userStoreId) {
      where.storeId = userStoreId;
    } else if (storeId) {
      where.storeId = storeId;
    }

    if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
    if (customerName) where.customerName = { [Op.like]: `%${customerName}%` };
    if (customerPhone) where.customerPhone = { [Op.like]: `%${customerPhone}%` };
    if (equipmentId) where.equipmentId = equipmentId;
    if (status) where.status = status;

    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await RentalOrder.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        { model: Equipment, as: 'equipment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getOverdueOrders(): Promise<RentalOrder[]> {
    const now = new Date();
    return await RentalOrder.findAll({
      where: {
        status: { [Op.in]: [OrderStatus.IN_USE, OrderStatus.OUTBOUND] },
        endDate: { [Op.lt]: now }
      },
      include: [{ model: Equipment, as: 'equipment' }],
      order: [['endDate', 'ASC']]
    });
  }

  static async processOverdueOrders(): Promise<number> {
    const transaction = await sequelize.transaction();

    try {
      const now = new Date();
      const overdueOrders = await RentalOrder.findAll({
        where: {
          status: { [Op.in]: [OrderStatus.IN_USE, OrderStatus.OUTBOUND] },
          endDate: { [Op.lt]: now }
        },
        transaction,
        lock: true
      });

      let processedCount = 0;

      for (const order of overdueOrders) {
        if (this.canTransition(order.status as OrderStatus, OrderStatus.OVERDUE)) {
          await order.update({ status: OrderStatus.OVERDUE }, { transaction });
          processedCount++;
        }
      }

      await transaction.commit();
      return processedCount;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getStatistics(params: { storeId?: number; startDate?: Date; endDate?: Date }): Promise<{
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    overdueOrders: number;
    totalRevenue: number;
    totalDamageCompensation: number;
  }> {
    const { storeId, startDate, endDate } = params;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const [totalOrders, completedOrders, cancelledOrders, overdueOrders] = await Promise.all([
      RentalOrder.count({ where }),
      RentalOrder.count({ where: { ...where, status: OrderStatus.COMPLETED } }),
      RentalOrder.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      RentalOrder.count({ where: { ...where, status: OrderStatus.OVERDUE } })
    ]);

    const completedOrdersData = await RentalOrder.findAll({
      where: { ...where, status: OrderStatus.COMPLETED },
      attributes: ['actualTotalAmount', 'damageCompensation']
    });

    const totalRevenue = completedOrdersData.reduce((sum, order) => sum + (order.actualTotalAmount || 0), 0);
    const totalDamageCompensation = completedOrdersData.reduce((sum, order) => sum + (order.damageCompensation || 0), 0);

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      overdueOrders,
      totalRevenue,
      totalDamageCompensation
    };
  }
}

import WorkOrder, { WorkOrderAttributes, WorkOrderStatus, WorkOrderType } from '../models/WorkOrder';
import Collection, { CollectionStatus } from '../models/Collection';
import User from '../models/User';
import { NotFoundException, BusinessException } from '../exceptions/BusinessException';
import { Op } from 'sequelize';
import sequelize from '../config/database';

class WorkOrderService {
  generateOrderNo(): string {
    const date = new Date();
    const prefix = 'WO' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return prefix + random;
  }

  private validateStatusTransition(
    currentStatus: WorkOrderStatus,
    targetStatus: WorkOrderStatus
  ): boolean {
    const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      [WorkOrderStatus.PENDING_INSPECTION]: [
        WorkOrderStatus.INSPECTING,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.INSPECTING]: [
        WorkOrderStatus.PENDING_QUOTATION,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.PENDING_QUOTATION]: [
        WorkOrderStatus.QUOTATION_SENT,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.QUOTATION_SENT]: [
        WorkOrderStatus.QUOTATION_APPROVED,
        WorkOrderStatus.QUOTATION_REJECTED,
        WorkOrderStatus.SUSPENDED,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.QUOTATION_APPROVED]: [
        WorkOrderStatus.IN_REPAIR,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.QUOTATION_REJECTED]: [
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.IN_REPAIR]: [
        WorkOrderStatus.REPAIR_COMPLETED,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.REPAIR_COMPLETED]: [
        WorkOrderStatus.PENDING_DELIVERY,
        WorkOrderStatus.ON_CONSIGN,
        WorkOrderStatus.CANCELLED
      ],
      [WorkOrderStatus.PENDING_DELIVERY]: [
        WorkOrderStatus.DELIVERED,
        WorkOrderStatus.ON_CONSIGN
      ],
      [WorkOrderStatus.DELIVERED]: [],
      [WorkOrderStatus.ON_CONSIGN]: [
        WorkOrderStatus.SOLD
      ],
      [WorkOrderStatus.SOLD]: [],
      [WorkOrderStatus.CANCELLED]: [],
      [WorkOrderStatus.SUSPENDED]: [
        WorkOrderStatus.QUOTATION_SENT,
        WorkOrderStatus.CANCELLED
      ]
    };

    return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
  }

  async createWorkOrder(data: Omit<WorkOrderAttributes, 'id' | 'orderNo' | 'status'> & { createdBy: number }) {
    const collection = await Collection.findByPk(data.collectionId);
    if (!collection) {
      throw new NotFoundException('藏品不存在');
    }

    const orderNo = this.generateOrderNo();
    const t = await sequelize.transaction();

    try {
      const workOrder = await WorkOrder.create({
        ...data,
        orderNo,
        status: WorkOrderStatus.PENDING_INSPECTION
      }, { transaction: t });

      await collection.update(
        { status: CollectionStatus.PENDING_REPAIR },
        { transaction: t }
      );

      await t.commit();
      return workOrder;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateWorkOrder(id: number, data: Partial<WorkOrderAttributes>) {
    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (data.collectionId && data.collectionId !== workOrder.collectionId) {
      const collection = await Collection.findByPk(data.collectionId);
      if (!collection) {
        throw new NotFoundException('藏品不存在');
      }
    }

    await workOrder.update(data);
    return workOrder;
  }

  async getWorkOrderById(id: number) {
    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: Collection, as: 'collection' },
        { model: User, as: 'repairer', attributes: ['id', 'realName', 'phone'] },
        { model: User, as: 'creator', attributes: ['id', 'realName'] }
      ]
    });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }
    return workOrder;
  }

  async getWorkOrderList(params: {
    page?: number;
    pageSize?: number;
    orderNo?: string;
    type?: WorkOrderType;
    status?: WorkOrderStatus;
    customerName?: string;
    repairerId?: number;
  }) {
    const { page = 1, pageSize = 10, orderNo, type, status, customerName, repairerId } = params;

    const where: any = {};
    if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
    if (type) where.type = type;
    if (status) where.status = status;
    if (customerName) where.customerName = { [Op.like]: `%${customerName}%` };
    if (repairerId) where.repairerId = repairerId;

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['id', 'DESC']],
      include: [
        { model: Collection, as: 'collection', attributes: ['id', 'collectionNo', 'name'] }
      ]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async transitionStatus(
    id: number,
    targetStatus: WorkOrderStatus,
    operatorId: number,
    additionalData?: Partial<WorkOrderAttributes>
  ) {
    const t = await sequelize.transaction();

    try {
      const workOrder = await WorkOrder.findByPk(id, { transaction: t });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      if (!this.validateStatusTransition(workOrder.status, targetStatus)) {
        throw new BusinessException(`不允许从 ${workOrder.status} 状态转换到 ${targetStatus} 状态`);
      }

      const updateData: any = { ...additionalData };

      switch (targetStatus) {
        case WorkOrderStatus.INSPECTING:
          break;

        case WorkOrderStatus.PENDING_QUOTATION:
          if (!additionalData?.inspectionReport) {
            throw new BusinessException('检测报告不能为空');
          }
          break;

        case WorkOrderStatus.QUOTATION_SENT:
          if (!additionalData?.estimatedCost) {
            throw new BusinessException('预估费用不能为空');
          }
          updateData.quotationTime = new Date();
          if (!additionalData?.quotationExpireTime) {
            const expireTime = new Date();
            expireTime.setDate(expireTime.getDate() + 7);
            updateData.quotationExpireTime = expireTime;
          }
          break;

        case WorkOrderStatus.QUOTATION_APPROVED:
          const collectionForApproved = await Collection.findByPk(workOrder.collectionId, { transaction: t });
          if (collectionForApproved) {
            await collectionForApproved.update(
              { status: CollectionStatus.IN_REPAIR },
              { transaction: t }
            );
          }
          break;

        case WorkOrderStatus.QUOTATION_REJECTED:
          const collectionForRejected = await Collection.findByPk(workOrder.collectionId, { transaction: t });
          if (collectionForRejected) {
            await collectionForRejected.update(
              { status: CollectionStatus.ARCHIVED },
              { transaction: t }
            );
          }
          break;

        case WorkOrderStatus.IN_REPAIR:
          if (!workOrder.repairerId) {
            throw new BusinessException('请先分配维修师');
          }
          updateData.repairStartTime = new Date();
          break;

        case WorkOrderStatus.REPAIR_COMPLETED:
          updateData.repairEndTime = new Date();
          break;

        case WorkOrderStatus.PENDING_DELIVERY:
          break;

        case WorkOrderStatus.DELIVERED:
          const collectionForDelivery = await Collection.findByPk(workOrder.collectionId, { transaction: t });
          if (collectionForDelivery) {
            await collectionForDelivery.update(
              { status: CollectionStatus.ARCHIVED },
              { transaction: t }
            );
          }
          break;

        case WorkOrderStatus.ON_CONSIGN:
          const collectionForConsign = await Collection.findByPk(workOrder.collectionId, { transaction: t });
          if (collectionForConsign) {
            await collectionForConsign.update(
              { status: CollectionStatus.ON_SALE },
              { transaction: t }
            );
          }
          break;

        case WorkOrderStatus.SOLD:
          const collectionForSold = await Collection.findByPk(workOrder.collectionId, { transaction: t });
          if (collectionForSold) {
            await collectionForSold.update(
              { status: CollectionStatus.SOLD },
              { transaction: t }
            );
          }
          
          const salePrice = additionalData?.salePrice || workOrder.salePrice || 0;
          const commissionAmount = additionalData?.commissionAmount || workOrder.commissionAmount || 0;
          
          const netAmount = salePrice - commissionAmount;
          
          const platformShareRate = 0.1;
          const storeShareRate = 0.2;
          const repairerShareRate = 0.1;
          const ownerShareRate = 0.6;
          
          updateData.platformShare = Number((netAmount * platformShareRate).toFixed(2));
          updateData.storeShare = Number((netAmount * storeShareRate).toFixed(2));
          updateData.repairerShare = Number((netAmount * repairerShareRate).toFixed(2));
          updateData.ownerAmount = Number((netAmount * ownerShareRate).toFixed(2));
          updateData.salePrice = salePrice;
          updateData.commissionAmount = commissionAmount;
          break;

        case WorkOrderStatus.CANCELLED:
          const collectionForCancel = await Collection.findByPk(workOrder.collectionId, { transaction: t });
          if (collectionForCancel) {
            await collectionForCancel.update(
              { status: CollectionStatus.ARCHIVED },
              { transaction: t }
            );
          }
          break;

        case WorkOrderStatus.SUSPENDED:
          break;
      }

      updateData.status = targetStatus;
      await workOrder.update(updateData, { transaction: t });

      await t.commit();
      return workOrder;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async autoSuspendExpiredQuotations() {
    const now = new Date();
    const expiredOrders = await WorkOrder.findAll({
      where: {
        status: WorkOrderStatus.QUOTATION_SENT,
        quotationExpireTime: {
          [Op.lt]: now
        }
      }
    });

    if (expiredOrders.length === 0) {
      return { suspendedCount: 0 };
    }

    const t = await sequelize.transaction();

    try {
      for (const order of expiredOrders) {
        await order.update(
          { status: WorkOrderStatus.SUSPENDED },
          { transaction: t }
        );
      }

      await t.commit();
      return { suspendedCount: expiredOrders.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateRepairInfo(
    id: number,
    repairDescription: string,
    actualCost: number,
    laborFee?: number,
    partsFee?: number,
    operatorId?: number
  ) {
    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.IN_REPAIR) {
      throw new BusinessException('只能在维修中状态更新维修信息');
    }

    await workOrder.update({
      repairDescription,
      actualCost,
      laborFee,
      partsFee
    });

    return workOrder;
  }

  async submitInspection(id: number, inspectionReport: string, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.INSPECTING, operatorId, { inspectionReport });
  }

  async submitQuotation(
    id: number,
    estimatedCost: number,
    quotationExpireTime?: Date,
    operatorId?: number
  ) {
    return this.transitionStatus(id, WorkOrderStatus.QUOTATION_SENT, operatorId!, {
      estimatedCost,
      quotationExpireTime
    });
  }

  async confirmQuotation(id: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.QUOTATION_APPROVED, operatorId);
  }

  async rejectQuotation(id: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.QUOTATION_REJECTED, operatorId);
  }

  async startRepair(id: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.IN_REPAIR, operatorId);
  }

  async completeRepair(
    id: number,
    repairDescription: string,
    actualCost: number,
    laborFee?: number,
    partsFee?: number,
    operatorId?: number
  ) {
    return this.transitionStatus(id, WorkOrderStatus.REPAIR_COMPLETED, operatorId!, {
      repairDescription,
      actualCost,
      laborFee,
      partsFee
    });
  }

  async deliverToCustomer(id: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.DELIVERED, operatorId);
  }

  async putOnConsign(id: number, commissionRate: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.ON_CONSIGN, operatorId, { commissionRate });
  }

  async markAsSold(id: number, salePrice: number, commissionAmount: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.SOLD, operatorId, {
      salePrice,
      commissionAmount
    });
  }

  async cancelWorkOrder(id: number, operatorId: number) {
    return this.transitionStatus(id, WorkOrderStatus.CANCELLED, operatorId);
  }

  async assignRepairer(id: number, repairerId: number) {
    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    const repairer = await User.findByPk(repairerId);
    if (!repairer) {
      throw new NotFoundException('维修师不存在');
    }

    if (repairer.role !== 'repairer') {
      throw new BusinessException('该用户不是维修师');
    }

    await workOrder.update({ repairerId });
    return workOrder;
  }

  async processSuspendedQuotation() {
    const now = new Date();
    const expiredOrders = await WorkOrder.findAll({
      where: {
        status: WorkOrderStatus.QUOTATION_SENT,
        quotationExpireTime: {
          [Op.lt]: now
        }
      }
    });

    const t = await sequelize.transaction();

    try {
      for (const order of expiredOrders) {
        await order.update(
          { status: WorkOrderStatus.SUSPENDED },
          { transaction: t }
        );
      }

      await t.commit();
      return expiredOrders.length;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getMyWorkOrders(
    repairerId: number,
    params: {
      page?: number;
      pageSize?: number;
      status?: WorkOrderStatus;
    }
  ) {
    const { page = 1, pageSize = 10, status } = params;

    const where: any = { repairerId };
    if (status) where.status = status;

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['priority', 'DESC'], ['id', 'DESC']],
      include: [
        { model: Collection, as: 'collection', attributes: ['id', 'collectionNo', 'name'] }
      ]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }
}

export default new WorkOrderService();
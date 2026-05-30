import { InspectionWorkOrder, ObservationSite, User, EquipmentCategory, MaintenanceSchedule, sequelize } from '../models';
import { WorkOrderStatus, SiteStatus, OperationModule, OperationType } from '../types';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/http.exception';
import { Op, Transaction } from 'sequelize';
import moment from 'moment';
import logger from '../utils/logger';
import equipmentCategoryService from './equipmentCategory.service';
import operationLogService from './operationLog.service';
import { Request } from 'express';

const StatusTransitionMap: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.OVERDUE],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.FAULT_REPORTED, WorkOrderStatus.OVERDUE],
  [WorkOrderStatus.FAULT_REPORTED]: [WorkOrderStatus.MAINTENANCE],
  [WorkOrderStatus.MAINTENANCE]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.REINSPECTION],
  [WorkOrderStatus.REINSPECTION]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.MAINTENANCE],
  [WorkOrderStatus.OVERDUE]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED],
  [WorkOrderStatus.COMPLETED]: []
};

class InspectionWorkOrderService {
  generateOrderNo(): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WO${timestamp}${random}`;
  }

  canTransitionStatus(currentStatus: WorkOrderStatus, nextStatus: WorkOrderStatus): boolean {
    const allowedTransitions = StatusTransitionMap[currentStatus];
    return allowedTransitions.includes(nextStatus);
  }

  validateStatusTransition(currentStatus: WorkOrderStatus, nextStatus: WorkOrderStatus, action: string): void {
    if (!this.canTransitionStatus(currentStatus, nextStatus)) {
      const error = `状态流转失败: 无法从【${currentStatus}】流转到【${nextStatus}】, 操作: ${action}`;
      logger.warn(error);
      throw new BadRequestException(`当前工单状态不支持${action}操作`);
    }
  }

  async lockMaintenanceSchedule(userId: number, scheduleDate: Date, workOrderId: number, transaction: Transaction) {
    const dateOnly = moment(scheduleDate).startOf('day').toDate();
    
    const existingSchedule = await MaintenanceSchedule.findOne({
      where: {
        userId,
        scheduleDate: dateOnly
      },
      transaction
    });

    if (existingSchedule) {
      if (existingSchedule.isLocked) {
        throw new ConflictException(`该用户在 ${moment(dateOnly).format('YYYY-MM-DD')} 的排期已被锁定`);
      }
      await existingSchedule.update({
        isLocked: true,
        lockedAt: new Date(),
        workOrderId
      }, { transaction });
      return existingSchedule;
    }

    const schedule = await MaintenanceSchedule.create({
      userId,
      scheduleDate: dateOnly,
      workOrderId,
      isLocked: true,
      lockedAt: new Date()
    }, { transaction });

    return schedule;
  }

  async createWorkOrder(data: {
    siteId: number;
    equipmentCategoryId?: number;
    plannedDate: Date;
    inspectorId?: number;
    remark?: string;
    createdBy?: number;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const site = await ObservationSite.findByPk(data.siteId, { transaction });
      if (!site) {
        throw new NotFoundException('站点不存在');
      }

      if (data.equipmentCategoryId) {
        await equipmentCategoryService.checkCategoryUsable(data.equipmentCategoryId);
      }

      const orderNo = this.generateOrderNo();

      const workOrder = await InspectionWorkOrder.create({
        ...data,
        orderNo,
        status: WorkOrderStatus.PENDING
      }, { transaction });

      if (data.inspectorId && data.plannedDate) {
        await this.lockMaintenanceSchedule(data.inspectorId, data.plannedDate, workOrder.id, transaction);
      }

      await transaction.commit();

      if (req) {
        await operationLogService.logCreate(OperationModule.WORK_ORDER, workOrder.id, workOrder, req);
      }

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async batchCreateWorkOrders(data: {
    siteIds: number[];
    equipmentCategoryId?: number;
    plannedDate: Date;
    inspectorId?: number;
    remark?: string;
    createdBy?: number;
  }) {
    const { siteIds, equipmentCategoryId, ...rest } = data;
    
    if (equipmentCategoryId) {
      await equipmentCategoryService.checkCategoryUsable(equipmentCategoryId);
    }

    const workOrders: any[] = [];

    for (const siteId of siteIds) {
      const site = await ObservationSite.findByPk(siteId);
      if (site) {
        const orderNo = this.generateOrderNo();
        workOrders.push({
          ...rest,
          siteId,
          equipmentCategoryId,
          orderNo,
          status: WorkOrderStatus.PENDING
        });
      }
    }

    const result = await InspectionWorkOrder.bulkCreate(workOrders);
    return result;
  }

  async updateWorkOrder(id: number, data: {
    siteId?: number;
    equipmentCategoryId?: number;
    plannedDate?: Date;
    inspectorId?: number;
    remark?: string;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const workOrder = await InspectionWorkOrder.findByPk(id, { transaction });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      if (workOrder.status !== WorkOrderStatus.PENDING) {
        throw new BadRequestException('只能编辑待处理状态的工单');
      }

      const beforeData = workOrder.toJSON();

      if (data.siteId) {
        const site = await ObservationSite.findByPk(data.siteId, { transaction });
        if (!site) {
          throw new NotFoundException('站点不存在');
        }
      }

      if (data.equipmentCategoryId) {
        await equipmentCategoryService.checkCategoryUsable(data.equipmentCategoryId);
      }

      if (data.inspectorId && data.plannedDate) {
        await this.lockMaintenanceSchedule(data.inspectorId, data.plannedDate, id, transaction);
      }

      await workOrder.update(data, { transaction });

      await transaction.commit();

      if (req) {
        await operationLogService.logUpdate(OperationModule.WORK_ORDER, id, beforeData, workOrder, req);
      }

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteWorkOrder(id: number, req?: Request) {
    const workOrder = await InspectionWorkOrder.findByPk(id);
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.PENDING) {
      throw new BadRequestException('只能删除待处理的工单');
    }

    const beforeData = workOrder.toJSON();
    await workOrder.destroy();

    if (req) {
      await operationLogService.logDelete(OperationModule.WORK_ORDER, id, beforeData, req);
    }

    return true;
  }

  async getWorkOrderById(id: number) {
    const workOrder = await InspectionWorkOrder.findByPk(id, {
      include: [
        { model: ObservationSite, as: 'site' },
        { model: EquipmentCategory, as: 'equipmentCategory' },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'maintenancePerson', attributes: ['id', 'username', 'realName'] }
      ]
    });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }
    return workOrder;
  }

  async getWorkOrderList(params: {
    orderNo?: string;
    siteId?: number;
    district?: string;
    equipmentCategoryId?: number;
    equipmentStatus?: SiteStatus;
    inspectorId?: number;
    maintenancePersonId?: number;
    status?: WorkOrderStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { orderNo, siteId, district, equipmentCategoryId, equipmentStatus, inspectorId, maintenancePersonId, status, startDate, endDate, page = 1, pageSize = 10 } = params;
    const where: any = {};
    const siteWhere: any = {};

    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }
    if (siteId) {
      where.siteId = siteId;
    }
    if (district) {
      siteWhere.district = { [Op.like]: `%${district}%` };
    }
    if (equipmentStatus) {
      siteWhere.status = equipmentStatus;
    }
    if (equipmentCategoryId) {
      where.equipmentCategoryId = equipmentCategoryId;
    }
    if (inspectorId) {
      where.inspectorId = inspectorId;
    }
    if (maintenancePersonId) {
      where.maintenancePersonId = maintenancePersonId;
    }
    if (status) {
      where.status = status;
    }
    if (startDate && endDate) {
      where.plannedDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const include: any[] = [
      {
        model: ObservationSite,
        as: 'site',
        where: Object.keys(siteWhere).length > 0 ? siteWhere : undefined
      },
      {
        model: EquipmentCategory,
        as: 'equipmentCategory'
      },
      {
        model: User,
        as: 'inspector',
        attributes: ['id', 'username', 'realName']
      }
    ];

    const { count, rows } = await InspectionWorkOrder.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async startInspection(id: number, inspectorId: number, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const workOrder = await InspectionWorkOrder.findByPk(id, { transaction });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      const beforeData = workOrder.toJSON();
      this.validateStatusTransition(workOrder.status, WorkOrderStatus.IN_PROGRESS, '开始巡检');

      await workOrder.update({
        status: WorkOrderStatus.IN_PROGRESS,
        inspectorId
      }, { transaction });

      await transaction.commit();

      if (req) {
        await operationLogService.logUpdate(OperationModule.WORK_ORDER, id, beforeData, workOrder, req);
      }

      logger.info(`工单开始巡检 - 工单ID: ${id}, 原状态: ${beforeData.status}, 巡检人ID: ${inspectorId}`);

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async submitInspectionResult(id: number, data: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    windDirection?: string;
    airPressure?: number;
    radiation?: number;
    equipmentCheckResult?: string;
    hasFault: boolean;
    faultDescription?: string;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const workOrder = await InspectionWorkOrder.findByPk(id, { transaction });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      const beforeData = workOrder.toJSON();
      const targetStatus = data.hasFault ? WorkOrderStatus.FAULT_REPORTED : WorkOrderStatus.COMPLETED;
      this.validateStatusTransition(workOrder.status, targetStatus, '提交巡检结果');

      const actualDate = new Date();

      if (data.hasFault) {
        await ObservationSite.update(
          { status: SiteStatus.FAULT },
          { where: { id: workOrder.siteId }, transaction }
        );
        logger.info(`站点状态已更新为故障 - 站点ID: ${workOrder.siteId}`);
      }

      await workOrder.update({
        ...data,
        actualDate,
        status: targetStatus
      }, { transaction });

      if (!data.hasFault && workOrder.siteId) {
        const nextInspectionDate = moment().add(3, 'months').toDate();
        await ObservationSite.update(
          { 
            lastInspectionDate: actualDate,
            nextInspectionDate
          },
          { where: { id: workOrder.siteId }, transaction }
        );
        logger.info(`站点下次巡检日期已更新 - 站点ID: ${workOrder.siteId}, 下次巡检: ${nextInspectionDate}`);
      }

      await transaction.commit();

      if (req) {
        await operationLogService.logSubmit(OperationModule.WORK_ORDER, id, beforeData, workOrder, req);
      }

      logger.info(`提交巡检结果 - 工单ID: ${id}, 原状态: ${beforeData.status}, 是否有故障: ${data.hasFault}`);

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async assignMaintenance(id: number, maintenancePersonId: number, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const workOrder = await InspectionWorkOrder.findByPk(id, { transaction });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      const beforeData = workOrder.toJSON();
      this.validateStatusTransition(workOrder.status, WorkOrderStatus.MAINTENANCE, '分配维修');

      await workOrder.update({
        status: WorkOrderStatus.MAINTENANCE,
        maintenancePersonId
      }, { transaction });

      await transaction.commit();

      if (req) {
        await operationLogService.logAssign(OperationModule.WORK_ORDER, id, beforeData, workOrder, req);
      }

      logger.info(`分配维修人员 - 工单ID: ${id}, 原状态: ${beforeData.status}, 维修人员ID: ${maintenancePersonId}`);

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async submitMaintenanceResult(id: number, data: {
    maintenanceMeasures: string;
    maintenanceCost?: number;
    needReinspection: boolean;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const workOrder = await InspectionWorkOrder.findByPk(id, { transaction });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      const beforeData = workOrder.toJSON();
      const targetStatus = data.needReinspection ? WorkOrderStatus.REINSPECTION : WorkOrderStatus.COMPLETED;
      this.validateStatusTransition(workOrder.status, targetStatus, '提交维修结果');

      await workOrder.update({
        ...data,
        status: targetStatus
      }, { transaction });

      if (!data.needReinspection && workOrder.siteId) {
        await ObservationSite.update(
          { status: SiteStatus.NORMAL },
          { where: { id: workOrder.siteId }, transaction }
        );
        logger.info(`站点状态已恢复正常 - 站点ID: ${workOrder.siteId}`);
      }

      await transaction.commit();

      if (req) {
        await operationLogService.logSubmit(OperationModule.WORK_ORDER, id, beforeData, workOrder, req);
      }

      logger.info(`提交维修结果 - 工单ID: ${id}, 原状态: ${beforeData.status}, 需要复检: ${data.needReinspection}, 维修费用: ${data.maintenanceCost}`);

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async submitReinspectionResult(id: number, data: {
    reinspectionResult: string;
    passed: boolean;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const workOrder = await InspectionWorkOrder.findByPk(id, { transaction });
      if (!workOrder) {
        throw new NotFoundException('工单不存在');
      }

      const beforeData = workOrder.toJSON();
      const targetStatus = data.passed ? WorkOrderStatus.COMPLETED : WorkOrderStatus.MAINTENANCE;
      this.validateStatusTransition(workOrder.status, targetStatus, '提交复检结果');

      const reinspectionDate = new Date();

      if (data.passed) {
        await workOrder.update({
          ...data,
          reinspectionDate,
          status: WorkOrderStatus.COMPLETED
        }, { transaction });

        if (workOrder.siteId) {
          await ObservationSite.update(
            { status: SiteStatus.NORMAL },
            { where: { id: workOrder.siteId }, transaction }
          );
          logger.info(`站点状态已恢复正常 - 站点ID: ${workOrder.siteId}`);
        }
      } else {
        await workOrder.update({
          ...data,
          reinspectionDate,
          status: WorkOrderStatus.MAINTENANCE
        }, { transaction });
        logger.info(`复检未通过，返回维修状态 - 工单ID: ${id}`);
      }

      await transaction.commit();

      if (req) {
        await operationLogService.logSubmit(OperationModule.WORK_ORDER, id, beforeData, workOrder, req);
      }

      return workOrder;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOverdueWorkOrders() {
    const now = new Date();
    const workOrders = await InspectionWorkOrder.findAll({
      where: {
        status: {
          [Op.in]: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS]
        },
        plannedDate: {
          [Op.lt]: now
        }
      },
      include: [
        { model: ObservationSite, as: 'site' },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['plannedDate', 'ASC']]
    });

    return workOrders;
  }

  async markOverdueOrders() {
    const now = new Date();
    const result = await InspectionWorkOrder.update(
      { status: WorkOrderStatus.OVERDUE },
      {
        where: {
          status: {
            [Op.in]: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS]
          },
          plannedDate: {
            [Op.lt]: now
          }
        }
      }
    );

    if (result[0] > 0) {
      logger.info(`超时工单标记完成 - 共标记 ${result[0]} 个工单为超时状态`);
    }
  }

  async getWorkOrderStatistics() {
    const total = await InspectionWorkOrder.count();
    const pending = await InspectionWorkOrder.count({ where: { status: WorkOrderStatus.PENDING } });
    const inProgress = await InspectionWorkOrder.count({ where: { status: WorkOrderStatus.IN_PROGRESS } });
    const faultReported = await InspectionWorkOrder.count({ where: { status: WorkOrderStatus.FAULT_REPORTED } });
    const maintenance = await InspectionWorkOrder.count({ where: { status: WorkOrderStatus.MAINTENANCE } });
    const completed = await InspectionWorkOrder.count({ where: { status: WorkOrderStatus.COMPLETED } });
    const overdue = await InspectionWorkOrder.count({ where: { status: WorkOrderStatus.OVERDUE } });

    return {
      total,
      pending,
      inProgress,
      faultReported,
      maintenance,
      completed,
      overdue
    };
  }
}

export default new InspectionWorkOrderService();

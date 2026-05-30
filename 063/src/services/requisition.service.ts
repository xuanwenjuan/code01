import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import Requisition, { RequisitionStatus } from '../models/Requisition';
import RequisitionItem from '../models/RequisitionItem';
import Material from '../models/Material';
import User from '../models/User';
import Department from '../models/Department';
import StockLog, { StockLogType } from '../models/StockLog';
import Role from '../models/Role';
import { BusinessError } from '../middlewares/errorHandler';
import { RoleCode } from '../types';

export interface CreateRequisitionRequest {
  applicantId: number;
  departmentId: number;
  reason?: string;
  items: Array<{
    materialId: number;
    quantity: number;
  }>;
}

export interface ApproveRequest {
  id: number;
  approverId: number;
  rejectReason?: string;
}

export interface DeliverRequest {
  id: number;
  delivererId: number;
}

class RequisitionService {
  private canTransition(currentStatus: RequisitionStatus, targetStatus: RequisitionStatus): boolean {
    const transitions: Record<RequisitionStatus, RequisitionStatus[]> = {
      [RequisitionStatus.PENDING]: [RequisitionStatus.APPROVING, RequisitionStatus.CANCELLED],
      [RequisitionStatus.APPROVING]: [RequisitionStatus.APPROVED, RequisitionStatus.REJECTED, RequisitionStatus.CANCELLED],
      [RequisitionStatus.APPROVED]: [RequisitionStatus.DELIVERED, RequisitionStatus.CANCELLED],
      [RequisitionStatus.REJECTED]: [],
      [RequisitionStatus.DELIVERED]: [],
      [RequisitionStatus.CANCELLED]: []
    };
    return transitions[currentStatus]?.includes(targetStatus) ?? false;
  }

  async create(request: CreateRequisitionRequest) {
    const t = await sequelize.transaction();

    try {
      for (const item of request.items) {
        const material = await Material.findByPk(item.materialId, { transaction: t });
        if (!material) {
          throw new BusinessError(`物资ID ${item.materialId} 不存在`, 400);
        }
        if (material.status === 0) {
          throw new BusinessError(`物资 ${material.name} 已停用`, 400);
        }
      }

      const requisitionNo = `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const requisition = await Requisition.create(
        {
          requisitionNo,
          applicantId: request.applicantId,
          departmentId: request.departmentId,
          status: RequisitionStatus.PENDING,
          reason: request.reason
        },
        { transaction: t }
      );

      for (const item of request.items) {
        const material = await Material.findByPk(item.materialId, { transaction: t });
        await RequisitionItem.create(
          {
            requisitionId: requisition.id,
            materialId: item.materialId,
            quantity: item.quantity,
            deliveredQuantity: 0,
            unitPrice: material!.unitPrice
          },
          { transaction: t }
        );
      }

      await t.commit();
      return requisition;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async submit(id: number, applicantId: number) {
    const requisition = await Requisition.findByPk(id);
    if (!requisition) {
      throw new BusinessError('申领单不存在', 404);
    }

    if (requisition.applicantId !== applicantId) {
      throw new BusinessError('只能提交自己的申领单', 403);
    }

    if (!this.canTransition(requisition.status, RequisitionStatus.APPROVING)) {
      throw new BusinessError('当前状态不能提交审批', 400);
    }

    return requisition.update({ status: RequisitionStatus.APPROVING });
  }

  async approve(request: ApproveRequest, approverRoleId: number) {
    const t = await sequelize.transaction();
    
    try {
      const requisition = await Requisition.findByPk(request.id, { transaction: t });
      if (!requisition) {
        throw new BusinessError('申领单不存在', 404);
      }

      if (requisition.applicantId === request.approverId) {
        throw new BusinessError('不能审批自己的申领单', 400);
      }

      const role = await Role.findByPk(approverRoleId, { transaction: t });
      if (!role || (role.code !== RoleCode.SUPER_ADMIN && role.code !== RoleCode.DEPT_MANAGER)) {
        throw new BusinessError('您没有审批权限', 403);
      }

      const targetStatus = request.rejectReason 
        ? RequisitionStatus.REJECTED 
        : RequisitionStatus.APPROVED;

      if (!this.canTransition(requisition.status, targetStatus)) {
        throw new BusinessError('当前状态不能执行此操作', 400);
      }

      if (targetStatus === RequisitionStatus.APPROVED) {
        const items = await RequisitionItem.findAll({
          where: { requisitionId: request.id },
          transaction: t
        });

        for (const item of items) {
          const material = await Material.findByPk(item.materialId, { transaction: t });
          if (!material) {
            throw new BusinessError(`物资ID ${item.materialId} 不存在`, 400);
          }
          if (material.stockQuantity < item.quantity) {
            throw new BusinessError(`物资 ${material.name} 库存不足，无法审批通过`, 400);
          }
        }

        for (const item of items) {
          const material = await Material.findByPk(item.materialId, { transaction: t });
          if (material) {
            const beforeQuantity = material.stockQuantity;
            const afterQuantity = beforeQuantity - item.quantity;

            await material.update({ stockQuantity: afterQuantity }, { transaction: t });

            const logNo = `REQ_OUT${Date.now()}${Math.floor(Math.random() * 1000)}`;
            await StockLog.create(
              {
                logNo,
                materialId: item.materialId,
                warehouseId: material.warehouseId,
                type: StockLogType.REQUISITION_OUT,
                quantity: item.quantity,
                beforeQuantity,
                afterQuantity,
                operatorId: request.approverId,
                relatedId: requisition.id,
                relatedType: 'requisition',
                remark: `申领单 ${requisition.requisitionNo} 审批通过`
              },
              { transaction: t }
            );
          }
        }
      }

      const result = await requisition.update(
        {
          status: targetStatus,
          approverId: request.approverId,
          rejectReason: request.rejectReason,
          approvalTime: new Date()
        },
        { transaction: t }
      );

      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deliver(request: DeliverRequest) {
    const t = await sequelize.transaction();

    try {
      const requisition = await Requisition.findByPk(request.id, { transaction: t });
      if (!requisition) {
        throw new BusinessError('申领单不存在', 404);
      }

      if (!this.canTransition(requisition.status, RequisitionStatus.DELIVERED)) {
        throw new BusinessError('当前状态不能发放', 400);
      }

      const items = await RequisitionItem.findAll({
        where: { requisitionId: request.id },
        transaction: t
      });

      for (const item of items) {
        await item.update({ deliveredQuantity: item.quantity }, { transaction: t });
      }

      await requisition.update(
        {
          status: RequisitionStatus.DELIVERED,
          delivererId: request.delivererId,
          deliveryTime: new Date()
        },
        { transaction: t }
      );

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancel(id: number, userId: number) {
    const requisition = await Requisition.findByPk(id);
    if (!requisition) {
      throw new BusinessError('申领单不存在', 404);
    }

    if (requisition.applicantId !== userId) {
      throw new BusinessError('只能取消自己的申领单', 403);
    }

    if (!this.canTransition(requisition.status, RequisitionStatus.CANCELLED)) {
      throw new BusinessError('当前状态不能取消', 400);
    }

    return requisition.update({ status: RequisitionStatus.CANCELLED });
  }

  async getById(id: number) {
    return Requisition.findByPk(id, {
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'approver', attributes: ['id', 'username', 'realName'] },
        { model: Department, as: 'department' },
        {
          model: RequisitionItem,
          as: 'items',
          include: [{ model: Material, as: 'material' }]
        }
      ]
    });
  }

  async getList(params: {
    applicantId?: number;
    departmentId?: number;
    status?: number;
    startDate?: string;
    endDate?: string;
    mine?: boolean;
    userId?: number;
    userDepartmentId?: number;
  }) {
    const where: any = {};
    
    if (params.mine && params.userId) {
      where.applicantId = params.userId;
    } else if (params.departmentId) {
      where.departmentId = params.departmentId;
    } else if (params.userDepartmentId && !params.mine) {
      where.departmentId = params.userDepartmentId;
    }
    
    if (params.status !== undefined) {
      where.status = params.status;
    }
    if (params.startDate && params.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(params.startDate), new Date(params.endDate)]
      };
    }

    return Requisition.findAll({
      where,
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'username', 'realName'] },
        { model: Department, as: 'department' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

export default new RequisitionService();

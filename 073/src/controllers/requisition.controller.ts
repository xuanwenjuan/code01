import { Request, Response } from 'express';
import { Op, Transaction, literal } from 'sequelize';
import {
  Requisition, RequisitionItem, Reagent, Stock,
  StockFlow, User, sequelize, StockStatus
} from '../models';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/operationLogger';
import { RequisitionStatus, UserRole } from '../types';

export class RequisitionController {
  private static validateStatusTransition(
    currentStatus: RequisitionStatus,
    targetStatus: RequisitionStatus,
    userRole: UserRole
  ): { valid: boolean; message?: string } {
    const validTransitions: Record<RequisitionStatus, RequisitionStatus[]> = {
      [RequisitionStatus.DRAFT]: [RequisitionStatus.PENDING_APPROVAL, RequisitionStatus.CANCELLED],
      [RequisitionStatus.PENDING_APPROVAL]: [RequisitionStatus.APPROVED, RequisitionStatus.REJECTED, RequisitionStatus.CANCELLED],
      [RequisitionStatus.APPROVED]: [RequisitionStatus.DELIVERED, RequisitionStatus.CANCELLED],
      [RequisitionStatus.REJECTED]: [],
      [RequisitionStatus.DELIVERED]: [RequisitionStatus.RETURNED, RequisitionStatus.SCRAPPED],
      [RequisitionStatus.RETURNED]: [],
      [RequisitionStatus.SCRAPPED]: [],
      [RequisitionStatus.CANCELLED]: []
    };

    const canTransition = validTransitions[currentStatus]?.includes(targetStatus);
    if (!canTransition) {
      return { valid: false, message: `无法从 ${currentStatus} 状态转换到 ${targetStatus} 状态` };
    }

    const rolePermissions: Record<RequisitionStatus, UserRole[]> = {
      [RequisitionStatus.PENDING_APPROVAL]: [UserRole.RESEARCHER, UserRole.ADMIN],
      [RequisitionStatus.APPROVED]: [UserRole.ADMIN, UserRole.TEACHER],
      [RequisitionStatus.REJECTED]: [UserRole.ADMIN, UserRole.TEACHER],
      [RequisitionStatus.CANCELLED]: [UserRole.RESEARCHER, UserRole.ADMIN, UserRole.TEACHER],
      [RequisitionStatus.DELIVERED]: [UserRole.ADMIN, UserRole.WAREHOUSE],
      [RequisitionStatus.RETURNED]: [UserRole.ADMIN, UserRole.WAREHOUSE],
      [RequisitionStatus.SCRAPPED]: [UserRole.ADMIN, UserRole.WAREHOUSE],
      [RequisitionStatus.DRAFT]: [UserRole.RESEARCHER, UserRole.ADMIN]
    };

    const hasPermission = rolePermissions[targetStatus]?.includes(userRole);
    if (!hasPermission) {
      return { valid: false, message: `无权限执行 ${targetStatus} 操作` };
    }

    return { valid: true };
  }

  private static async validateStockAvailability(items: any[]): Promise<void> {
    for (const item of items) {
      const stock = await Stock.findByPk(item.stockId);
      if (!stock) {
        throw new NotFoundException(`库存记录不存在: ${item.stockId}`);
      }
      if (stock.status !== StockStatus.QUALIFIED) {
        throw new BadRequestException(`批次 ${stock.batchNo} 未通过质检，无法领用`);
      }
      if (stock.availableQuantity < item.quantity) {
        throw new BadRequestException(`库存不足: ${stock.batchNo}, 可用: ${stock.availableQuantity}, 申请: ${item.quantity}`);
      }
    }
  }

  static async create(req: Request, res: Response) {
    const { department, purpose, items, remarks, saveAsDraft } = req.body;

    if (!items || items.length === 0) {
      throw new BadRequestException('请添加领用物品');
    }

    await this.validateStockAvailability(items);

    const requisitionNo = `RL${Date.now()}${Math.floor(Math.random() * 1000)}`;

    let totalAmount = 0;
    for (const item of items) {
      const stock = await Stock.findByPk(item.stockId);
      if (stock) {
        totalAmount += item.quantity * stock.unitPrice;
      }
    }

    const user = await User.findByPk(req.user?.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const availableQuota = Number(user.quota) - Number(user.usedQuota);
    if (!saveAsDraft && totalAmount > availableQuota) {
      throw new BadRequestException(`领用金额超过可用额度，可用额度：${availableQuota.toFixed(2)}，领用金额：${totalAmount.toFixed(2)}`);
    }

    const warnings: string[] = [];
    if (!saveAsDraft && totalAmount > availableQuota * 0.8) {
      warnings.push(`领用金额已超过可用额度的80%，请合理使用`);
    }

    const now = new Date();
    for (const item of items) {
      const stock = await Stock.findByPk(item.stockId);
      if (stock?.expiryDate) {
        const daysUntilExpiry = Math.ceil((new Date(stock.expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        if (daysUntilExpiry <= 7) {
          warnings.push(`批次 ${stock.batchNo} 将在 ${daysUntilExpiry} 天后过期，请谨慎使用`);
        }
      }
    }

    const status = saveAsDraft ? RequisitionStatus.DRAFT : RequisitionStatus.PENDING_APPROVAL;

    const result = await sequelize.transaction(async (t: Transaction) => {
      const requisition = await Requisition.create({
        requisitionNo,
        applicantId: req.user?.userId || 0,
        approverId: null,
        department,
        purpose,
        totalAmount,
        status,
        remarks
      }, { transaction: t });

      for (const item of items) {
        const stock = await Stock.findByPk(item.stockId, { transaction: t });
        await RequisitionItem.create({
          requisitionId: requisition.id,
          reagentId: stock?.reagentId,
          stockId: item.stockId,
          quantity: item.quantity,
          unitPrice: stock?.unitPrice || 0,
          returnedQuantity: 0,
          remarks: item.remarks
        }, { transaction: t });
      }

      return requisition;
    });

    await OperationLogger.create(req, 'requisition', result.id, `创建领用单: ${requisitionNo}`);

    const responseData = {
      ...result.toJSON(),
      warnings: warnings.length > 0 ? warnings : undefined
    };

    return ResponseUtil.success(res, responseData, saveAsDraft ? '保存草稿成功' : (warnings.length > 0 ? `提交审批成功，${warnings.join('；')}` : '提交审批成功'));
  }

  static async submitForApproval(req: Request, res: Response) {
    const { id } = req.params;

    const requisition = await Requisition.findByPk(id);
    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态可以提交审批');
    }

    const items = await RequisitionItem.findAll({ where: { requisitionId: id } });
    await this.validateStockAvailability(items);

    const beforeData = requisition.toJSON();
    await requisition.update({
      status: RequisitionStatus.PENDING_APPROVAL
    });

    await OperationLogger.update(req, 'requisition', requisition.id, `提交审批: ${requisition.requisitionNo}`, beforeData, requisition.toJSON());

    return ResponseUtil.success(res, requisition, '提交审批成功');
  }

  static async approve(req: Request, res: Response) {
    const { id } = req.params;
    const { approvalRemark } = req.body;

    const requisition = await Requisition.findByPk(id);
    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    const validation = this.validateStatusTransition(
      requisition.status,
      RequisitionStatus.APPROVED,
      req.user?.role as UserRole
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const items = await RequisitionItem.findAll({ where: { requisitionId: id } });
    await this.validateStockAvailability(items);

    const beforeData = requisition.toJSON();
    await requisition.update({
      status: RequisitionStatus.APPROVED,
      approverId: req.user?.userId,
      approvalRemark,
      approvedAt: new Date()
    });

    await OperationLogger.approve(req, 'requisition', requisition.id, `审批通过: ${requisition.requisitionNo}`, beforeData, requisition.toJSON());

    return ResponseUtil.success(res, requisition, '审批成功');
  }

  static async reject(req: Request, res: Response) {
    const { id } = req.params;
    const { approvalRemark } = req.body;

    if (!approvalRemark) {
      throw new BadRequestException('请填写拒绝原因');
    }

    const requisition = await Requisition.findByPk(id);
    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    const validation = this.validateStatusTransition(
      requisition.status,
      RequisitionStatus.REJECTED,
      req.user?.role as UserRole
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const beforeData = requisition.toJSON();
    await requisition.update({
      status: RequisitionStatus.REJECTED,
      approverId: req.user?.userId,
      approvalRemark,
      approvedAt: new Date()
    });

    await OperationLogger.reject(req, 'requisition', requisition.id, `审批拒绝: ${requisition.requisitionNo}`, beforeData, requisition.toJSON());

    return ResponseUtil.success(res, requisition, '已拒绝');
  }

  static async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    const requisition = await Requisition.findByPk(id);
    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    if (requisition.applicantId !== req.user?.userId && req.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只能取消自己的领用单');
    }

    const validation = this.validateStatusTransition(
      requisition.status,
      RequisitionStatus.CANCELLED,
      req.user?.role as UserRole
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const beforeData = requisition.toJSON();
    await requisition.update({
      status: RequisitionStatus.CANCELLED,
      remarks: reason ? `${requisition.remarks || ''}\n取消原因: ${reason}` : requisition.remarks
    });

    await OperationLogger.update(req, 'requisition', requisition.id, `取消领用: ${requisition.requisitionNo}`, beforeData, requisition.toJSON());

    return ResponseUtil.success(res, requisition, '取消成功');
  }

  static async deliver(req: Request, res: Response) {
    const { id } = req.params;

    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.WAREHOUSE) {
      throw new ForbiddenException('无出库权限');
    }

    const requisition = await Requisition.findByPk(id, {
      include: [{ model: RequisitionItem, as: 'items' }]
    });

    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    const validation = this.validateStatusTransition(
      requisition.status,
      RequisitionStatus.DELIVERED,
      req.user?.role as UserRole
    );
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      for (const item of requisition.items!) {
        const stock = await Stock.findByPk(item.stockId, { transaction: t });
        if (!stock) {
          throw new NotFoundException(`库存 ${item.stockId} 不存在`);
        }
        
        if (stock.availableQuantity < item.quantity) {
          throw new BadRequestException(`库存不足: ${stock.batchNo}，当前可用：${stock.availableQuantity}，需要：${item.quantity}`);
        }

        if (stock.status !== StockStatus.IN_STOCK) {
          throw new BadRequestException(`批次 ${stock.batchNo} 状态为 ${stock.status}，不能出库`);
        }

        const now = new Date();
        if (stock.expiryDate && new Date(stock.expiryDate) <= now) {
          throw new BadRequestException(`批次 ${stock.batchNo} 已过期，不能出库`);
        }

        const beforeQty = stock.availableQuantity;
        await stock.update({ availableQuantity: beforeQty - item.quantity }, { transaction: t });

        await StockFlow.create({
          stockId: stock.id,
          reagentId: stock.reagentId,
          flowType: 'outbound',
          quantity: item.quantity,
          beforeQuantity: beforeQty,
          afterQuantity: beforeQty - item.quantity,
          operatorId: req.user?.userId || 0,
          relatedType: 'requisition',
          relatedId: requisition.id,
          remarks: `领用出库: ${requisition.requisitionNo} - ${stock.batchNo}`
        }, { transaction: t });
      }

      const user = await User.findByPk(requisition.applicantId, { transaction: t });
      if (user) {
        const newUsedQuota = Number(user.usedQuota) + Number(requisition.totalAmount);
        if (newUsedQuota > Number(user.quota)) {
          throw new BadRequestException('出库后将超过用户额度限制');
        }
        await user.update({ usedQuota: newUsedQuota }, { transaction: t });
      }

      await requisition.update({
        status: RequisitionStatus.DELIVERED,
        deliveredBy: req.user?.userId,
        deliveredAt: new Date()
      }, { transaction: t });

      return requisition;
    });

    await OperationLogger.outbound(req, 'requisition', result.id, `出库完成: ${result.requisitionNo}`);

    return ResponseUtil.success(res, result, '出库成功');
  }

  static async return(req: Request, res: Response) {
    const { id } = req.params;
    const { returnItems } = req.body;

    if (!returnItems || returnItems.length === 0) {
      throw new BadRequestException('请选择要归还的物品');
    }

    const requisition = await Requisition.findByPk(id, {
      include: [{ model: RequisitionItem, as: 'items' }]
    });

    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    if (requisition.status !== RequisitionStatus.DELIVERED && requisition.status !== RequisitionStatus.PARTIAL_RETURNED) {
      throw new BadRequestException('该领用单状态不允许归还');
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      let totalReturnAmount = 0;

      for (const returnItem of returnItems) {
        const item = requisition.items!.find(i => i.id === returnItem.itemId);
        if (!item) continue;

        const stock = await Stock.findByPk(item.stockId, { transaction: t });
        if (!stock) continue;

        const remainingToReturn = item.quantity - item.returnedQuantity;
        const returnQty = Math.min(returnItem.quantity, remainingToReturn);

        if (returnQty <= 0) {
          throw new BadRequestException(`物品已全部归还: ${stock.batchNo}`);
        }

        const beforeQty = stock.availableQuantity;
        await stock.update({ availableQuantity: beforeQty + returnQty }, { transaction: t });
        await item.update({ returnedQuantity: item.returnedQuantity + returnQty }, { transaction: t });

        totalReturnAmount += returnQty * item.unitPrice;

        await StockFlow.create({
          stockId: stock.id,
          reagentId: stock.reagentId,
          flowType: 'return',
          quantity: returnQty,
          beforeQuantity: beforeQty,
          afterQuantity: beforeQty + returnQty,
          operatorId: req.user?.userId || 0,
          relatedType: 'requisition',
          relatedId: requisition.id,
          remarks: `归还: ${requisition.requisitionNo} - ${stock.batchNo}`
        }, { transaction: t });
      }

      if (totalReturnAmount > 0) {
        const user = await User.findByPk(requisition.applicantId, { transaction: t });
        if (user) {
          const newUsedQuota = Math.max(0, Number(user.usedQuota) - totalReturnAmount);
          await user.update({ usedQuota: newUsedQuota }, { transaction: t });
        }
      }

      const allItems = await RequisitionItem.findAll({ where: { requisitionId: id }, transaction: t });
      const allReturned = allItems.every(item => item.returnedQuantity >= item.quantity);

      await requisition.update({
        status: allReturned ? RequisitionStatus.RETURNED : RequisitionStatus.PARTIAL_RETURNED,
        returnedAt: new Date()
      }, { transaction: t });

      return requisition;
    });

    await OperationLogger.return(req, 'requisition', result.id, `归还完成: ${result.requisitionNo}`);

    return ResponseUtil.success(res, result, '归还成功');
  }

  static async scrap(req: Request, res: Response) {
    const { id } = req.params;
    const { remark, scrapItems } = req.body;

    const requisition = await Requisition.findByPk(id, {
      include: [{ model: RequisitionItem, as: 'items' }]
    });

    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    if (requisition.status !== RequisitionStatus.DELIVERED && requisition.status !== RequisitionStatus.PARTIAL_RETURNED) {
      throw new BadRequestException('该领用单状态不允许报废');
    }

    await sequelize.transaction(async (t: Transaction) => {
      const itemsToScrap = scrapItems || requisition.items;

      for (const item of itemsToScrap) {
        const requisitionItem = requisition.items!.find(i => i.id === item.itemId || i.id === item.id);
        if (!requisitionItem) continue;

        const stock = await Stock.findByPk(requisitionItem.stockId, { transaction: t });
        if (!stock) continue;

        const scrapQty = requisitionItem.quantity - requisitionItem.returnedQuantity;
        if (scrapQty > 0) {
          await StockFlow.create({
            stockId: stock.id,
            reagentId: stock.reagentId,
            flowType: 'scrap',
            quantity: scrapQty,
            beforeQuantity: stock.availableQuantity,
            afterQuantity: stock.availableQuantity,
            operatorId: req.user?.userId || 0,
            relatedType: 'requisition',
            relatedId: requisition.id,
            remarks: `报废: ${remark || requisition.requisitionNo}`
          }, { transaction: t });
        }
      }

      await requisition.update({
        status: RequisitionStatus.SCRAPPED,
        scrappedAt: new Date()
      }, { transaction: t });
    });

    await OperationLogger.scrap(req, 'requisition', requisition.id, `报废完成: ${requisition.requisitionNo}`);

    return ResponseUtil.success(res, requisition, '报废成功');
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    const requisition = await Requisition.findByPk(id, {
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'approver', attributes: ['id', 'realName', 'username'] },
        {
          model: RequisitionItem,
          as: 'items',
          include: [
            { model: Reagent, as: 'reagent' },
            { model: Stock, as: 'stock' }
          ]
        }
      ]
    });

    if (!requisition) {
      throw new NotFoundException('领用单不存在');
    }

    return ResponseUtil.success(res, requisition, '查询成功');
  }

  static async getList(req: Request, res: Response) {
    const { status, applicantId, keyword, startDate, endDate, page = 1, pageSize = 10 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (applicantId) where.applicantId = applicantId;
    if (keyword) where.requisitionNo = { [Op.like]: `%${keyword}%` };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (req.user?.role === UserRole.RESEARCHER) {
      where.applicantId = req.user.userId;
    }

    const { count, rows } = await Requisition.findAndCountAll({
      where,
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'approver', attributes: ['id', 'realName', 'username'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    return ResponseUtil.success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }, '查询成功');
  }

  static async getMyRequisitions(req: Request, res: Response) {
    req.query.applicantId = String(req.user?.userId);
    return this.getList(req, res);
  }

  static async getPendingApprovals(req: Request, res: Response) {
    req.query.status = RequisitionStatus.PENDING_APPROVAL;
    return this.getList(req, res);
  }

  static async getStatistics(req: Request, res: Response) {
    const [statusStats, myStats, pendingCount] = await Promise.all([
      Requisition.findAll({
        attributes: ['status', [literal('COUNT(*)'), 'count']],
        group: ['status']
      }),
      req.user?.userId ? Requisition.findAll({
        attributes: ['status', [literal('COUNT(*)'), 'count']],
        where: { applicantId: req.user.userId },
        group: ['status']
      }) : Promise.resolve([]),
      Requisition.count({ where: { status: RequisitionStatus.PENDING_APPROVAL } })
    ]);

    return ResponseUtil.success(res, {
      byStatus: statusStats,
      myByStatus: myStats,
      pendingApprovalCount: pendingCount
    }, '查询成功');
  }
}

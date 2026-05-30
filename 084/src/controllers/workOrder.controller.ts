import { Response, NextFunction } from 'express';
import WorkOrder, { WorkOrderStatus, Priority } from '../models/WorkOrder';
import WorkOrderLog from '../models/WorkOrderLog';
import WorkArea from '../models/WorkArea';
import Cleaner, { CleanerStatus } from '../models/Cleaner';
import User, { UserRole } from '../models/User';
import ResponseUtil from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/AppException';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import logService from '../services/log.service';
import { OperationType } from '../models/OperationLog';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';

export const createValidation = [
  body('title').notEmpty().withMessage('工单标题不能为空'),
  body('workAreaId').isInt({ min: 1 }).withMessage('作业区域ID必须为正整数'),
  body('scheduledTime').isISO8601().withMessage('计划时间格式错误'),
  body('deadlineTime').isISO8601().withMessage('截止时间格式错误'),
  body('priority').optional().isIn(Object.values(Priority)).withMessage('无效的优先级'),
  body('assignedTo').optional().isInt({ min: 1 }).withMessage('保洁人员ID必须为正整数'),
  body('description').optional().isString().withMessage('描述必须为字符串')
];

export const assignValidation = [
  param('id').isInt({ min: 1 }).withMessage('工单ID必须为正整数'),
  body('cleanerId').isInt({ min: 1 }).withMessage('保洁人员ID必须为正整数'),
  body('remark').optional().isString().withMessage('备注必须为字符串')
];

export const reviewValidation = [
  param('id').isInt({ min: 1 }).withMessage('工单ID必须为正整数'),
  body('status').isIn(['pass', 'reject']).withMessage('审核状态必须是pass或reject'),
  body('comment').optional().isString().withMessage('审核意见必须为字符串')
];

export const reportValidation = [
  param('id').isInt({ min: 1 }).withMessage('工单ID必须为正整数'),
  body('content').notEmpty().withMessage('问题描述不能为空').isString().withMessage('问题描述必须为字符串')
];

export const completeValidation = [
  param('id').isInt({ min: 1 }).withMessage('工单ID必须为正整数'),
  body('completionNote').optional().isString().withMessage('完工备注必须为字符串')
];

const generateOrderNo = (): string => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO${timestamp}${random}`;
};

const createWorkOrderLog = async (
  workOrderId: number,
  action: string,
  oldStatus: string | undefined,
  newStatus: string,
  operatorId?: number,
  cleanerId?: number,
  remark?: string
) => {
  await WorkOrderLog.create({
    workOrderId,
    action,
    oldStatus,
    newStatus,
    operatorId,
    cleanerId,
    remark
  });
};

const canTransition = (currentStatus: WorkOrderStatus, targetStatus: WorkOrderStatus): boolean => {
  const transitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    [WorkOrderStatus.PENDING]: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED],
    [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.ACCEPTED, WorkOrderStatus.REASSIGNED, WorkOrderStatus.CANCELLED],
    [WorkOrderStatus.ACCEPTED]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.REASSIGNED],
    [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.REPORTED, WorkOrderStatus.COMPLETED],
    [WorkOrderStatus.REPORTED]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.IN_PROGRESS],
    [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.REVIEWED, WorkOrderStatus.ASSIGNED],
    [WorkOrderStatus.REVIEWED]: [],
    [WorkOrderStatus.REASSIGNED]: [WorkOrderStatus.ACCEPTED, WorkOrderStatus.CANCELLED],
    [WorkOrderStatus.CANCELLED]: []
  };
  return transitions[currentStatus]?.includes(targetStatus) || false;
};

const getActionName = (status: WorkOrderStatus): string => {
  const actionMap: Record<WorkOrderStatus, string> = {
    [WorkOrderStatus.PENDING]: '创建工单',
    [WorkOrderStatus.ASSIGNED]: '分配工单',
    [WorkOrderStatus.ACCEPTED]: '接单',
    [WorkOrderStatus.IN_PROGRESS]: '开始作业',
    [WorkOrderStatus.REPORTED]: '问题上报',
    [WorkOrderStatus.COMPLETED]: '完工',
    [WorkOrderStatus.REVIEWED]: '审核通过',
    [WorkOrderStatus.REASSIGNED]: '重新分配',
    [WorkOrderStatus.CANCELLED]: '取消工单'
  };
  return actionMap[status] || '状态变更';
};

export const getAllWorkOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, workAreaId, assignedTo, priority, keyword, startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 10, 100);

    const where: any = {};
    if (status) where.status = status;
    if (workAreaId) where.workAreaId = workAreaId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (req.user?.role === UserRole.WORKER) {
      const cleaner = await Cleaner.findOne({ where: { userId: req.user.id } });
      if (cleaner) {
        where.assignedTo = cleaner.id;
      }
    }

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      include: [
        { model: WorkArea, as: 'workArea', attributes: ['id', 'name', 'areaType'] },
        { model: Cleaner, as: 'cleaner', attributes: ['id', 'name', 'employeeNo', 'phone'] },
        { model: User, as: 'assigner', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'reviewer', attributes: ['id', 'realName', 'username'] }
      ],
      order: [
        [literal(`FIELD(priority, 'urgent', 'high', 'medium', 'low')`), 'ASC'],
        ['deadlineTime', 'ASC'],
        ['createdAt', 'DESC']
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    ResponseUtil.success(res, {
      list: rows,
      total: count,
      page,
      pageSize
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id, {
      include: [
        { model: WorkArea, as: 'workArea' },
        { model: Cleaner, as: 'cleaner' },
        { model: User, as: 'assigner', attributes: ['id', 'realName', 'username'] },
        { model: User, as: 'reviewer', attributes: ['id', 'realName', 'username'] }
      ]
    });

    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    const logs = await WorkOrderLog.findAll({
      where: { workOrderId: id },
      include: [
        { model: User, as: 'operator', attributes: ['id', 'realName', 'username'] },
        { model: Cleaner, as: 'cleaner', attributes: ['id', 'name', 'employeeNo'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    ResponseUtil.success(res, { ...workOrder.toJSON(), logs });
  } catch (error) {
    next(error);
  }
};

export const createWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, workAreaId, assignedTo, scheduledDate, scheduledTime, deadlineTime, priority, autoReassign = true } = req.body;

    const workArea = await WorkArea.findByPk(workAreaId, { transaction: t });
    if (!workArea) {
      throw new BadRequestException('作业区域不存在');
    }

    if (workArea.status === 'suspended') {
      throw new BadRequestException('该作业区域已停运，不能创建工单');
    }

    if (new Date(deadlineTime) <= new Date(scheduledTime)) {
      throw new BadRequestException('截止时间必须晚于计划时间');
    }

    let cleaner = null;
    if (assignedTo) {
      cleaner = await Cleaner.findByPk(assignedTo, { transaction: t });
      if (!cleaner) {
        throw new BadRequestException('保洁人员不存在');
      }
      if (cleaner.status !== CleanerStatus.ON_DUTY) {
        throw new BadRequestException('该保洁人员当前不在岗，无法分配工单');
      }
      if (cleaner.workAreaId !== workAreaId) {
        throw new BadRequestException('该保洁人员不属于此作业区域');
      }

      const conflictingOrders = await WorkOrder.count({
        where: {
          assignedTo,
          scheduledDate: scheduledDate || new Date(scheduledTime),
          scheduleLocked: true,
          status: {
            [Op.notIn]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED, WorkOrderStatus.REVIEWED]
          }
        },
        transaction: t
      });

      if (conflictingOrders > 0) {
        throw new BadRequestException('该保洁人员当日档期已满，请选择其他日期或保洁人员');
      }
    }

    const orderNo = generateOrderNo();

    const workOrder = await WorkOrder.create(
      {
        orderNo,
        title,
        description,
        workAreaId,
        assignedTo,
        assignedBy: req.user!.id,
        status: assignedTo ? WorkOrderStatus.ASSIGNED : WorkOrderStatus.PENDING,
        priority: priority || Priority.MEDIUM,
        scheduledDate: scheduledDate || new Date(scheduledTime),
        scheduledTime,
        deadlineTime,
        reassignCount: 0,
        autoReassign,
        scheduleLocked: false
      },
      { transaction: t }
    );

    await createWorkOrderLog(
      workOrder.id,
      '创建工单',
      undefined,
      workOrder.status,
      req.user!.id,
      assignedTo,
      description
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.CREATE,
      workOrder.id,
      workOrder.title,
      `创建工单: ${workOrder.title}`,
      undefined,
      workOrder.toJSON()
    );

    ResponseUtil.created(res, workOrder, '工单创建成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const assignWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { cleanerId, remark } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    const validStatuses = [WorkOrderStatus.PENDING, WorkOrderStatus.ASSIGNED, WorkOrderStatus.REASSIGNED];
    if (!validStatuses.includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许分配');
    }

    const cleaner = await Cleaner.findByPk(cleanerId, { transaction: t });
    if (!cleaner) {
      throw new BadRequestException('保洁人员不存在');
    }

    if (cleaner.status !== CleanerStatus.ON_DUTY) {
      throw new BadRequestException('该保洁人员当前不在岗，无法分配工单');
    }

    if (cleaner.workAreaId !== workOrder.workAreaId) {
      throw new BadRequestException('该保洁人员不属于工单作业区域');
    }

    const oldStatus = workOrder.status;
    await workOrder.update(
      { 
        assignedTo: cleanerId, 
        status: WorkOrderStatus.ASSIGNED,
        reassignCount: workOrder.assignedTo ? workOrder.reassignCount + 1 : workOrder.reassignCount
      },
      { transaction: t }
    );

    const oldWorkOrder = workOrder.toJSON();
    await createWorkOrderLog(
      workOrder.id,
      '分配工单',
      oldStatus,
      WorkOrderStatus.ASSIGNED,
      req.user!.id,
      cleanerId,
      remark
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.ASSIGN,
      workOrder.id,
      workOrder.title,
      `分配工单给: ${cleaner.name || cleanerId}`,
      oldWorkOrder,
      workOrder.toJSON()
    );

    ResponseUtil.success(res, workOrder, '工单分配成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const acceptWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.ASSIGNED && workOrder.status !== WorkOrderStatus.REASSIGNED) {
      throw new BadRequestException('只有已分配或重新分配的工单才能接单');
    }

    if (!workOrder.assignedTo) {
      throw new BadRequestException('该工单尚未分配保洁人员');
    }

    if (req.user?.role === UserRole.WORKER) {
      const cleaner = await Cleaner.findOne({ 
        where: { userId: req.user.id }, 
        transaction: t 
      });
      if (!cleaner || cleaner.id !== workOrder.assignedTo) {
        throw new ForbiddenException('您不是该工单的指定保洁人员，无法接单');
      }
    }

    if (!workOrder.scheduleLocked) {
      const conflictingOrders = await WorkOrder.count({
        where: {
          assignedTo: workOrder.assignedTo,
          scheduledDate: workOrder.scheduledDate,
          scheduleLocked: true,
          status: {
            [Op.notIn]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED, WorkOrderStatus.REVIEWED]
          }
        },
        transaction: t
      });

      if (conflictingOrders > 0) {
        throw new BadRequestException('该保洁人员当日档期已满，无法接单');
      }
    }

    const oldStatus = workOrder.status;
    const oldWorkOrder = workOrder.toJSON();
    await workOrder.update(
      { 
        status: WorkOrderStatus.ACCEPTED, 
        acceptedTime: new Date(),
        scheduleLocked: true
      },
      { transaction: t }
    );

    await createWorkOrderLog(
      workOrder.id,
      '接单并锁定档期',
      oldStatus,
      WorkOrderStatus.ACCEPTED,
      req.user!.id,
      workOrder.assignedTo
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.ACCEPT,
      workOrder.id,
      workOrder.title,
      `接单并锁定档期: ${workOrder.title}`,
      oldWorkOrder,
      workOrder.toJSON()
    );

    ResponseUtil.success(res, workOrder, '接单成功，档期已锁定');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const startWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.ACCEPTED) {
      throw new BadRequestException('只有已接单的工单才能开始作业');
    }

    if (req.user?.role === UserRole.WORKER) {
      const cleaner = await Cleaner.findOne({ 
        where: { userId: req.user.id }, 
        transaction: t 
      });
      if (!cleaner || cleaner.id !== workOrder.assignedTo) {
        throw new ForbiddenException('您不是该工单的指定保洁人员，无法开始作业');
      }
    }

    const oldStatus = workOrder.status;
    await workOrder.update(
      { status: WorkOrderStatus.IN_PROGRESS, startTime: new Date() },
      { transaction: t }
    );

    await createWorkOrderLog(
      workOrder.id,
      '开始作业',
      oldStatus,
      WorkOrderStatus.IN_PROGRESS,
      req.user!.id,
      workOrder.assignedTo
    );

    await t.commit();
    ResponseUtil.success(res, workOrder, '开始作业成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const reportProblem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('问题描述不能为空');
    }

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (![WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ACCEPTED].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('只有已接单或进行中的工单才能上报问题');
    }

    const oldStatus = workOrder.status;
    await workOrder.update(
      { status: WorkOrderStatus.REPORTED, reportTime: new Date(), reportContent: content },
      { transaction: t }
    );

    await createWorkOrderLog(
      workOrder.id,
      '问题上报',
      oldStatus,
      WorkOrderStatus.REPORTED,
      req.user!.id,
      workOrder.assignedTo,
      content
    );

    await t.commit();
    ResponseUtil.success(res, workOrder, '问题上报成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const completeWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { completionNote } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (![WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.REPORTED].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('只有进行中或已上报的工单才能完工');
    }

    if (req.user?.role === UserRole.WORKER) {
      const cleaner = await Cleaner.findOne({ 
        where: { userId: req.user.id }, 
        transaction: t 
      });
      if (!cleaner || cleaner.id !== workOrder.assignedTo) {
        throw new ForbiddenException('您不是该工单的指定保洁人员，无法完工');
      }
    }

    const oldStatus = workOrder.status;
    await workOrder.update(
      { 
        status: WorkOrderStatus.COMPLETED, 
        completedTime: new Date(), 
        completionNote,
        scheduleLocked: false
      },
      { transaction: t }
    );

    const oldWorkOrder = workOrder.toJSON();
    await createWorkOrderLog(
      workOrder.id,
      '完工并解锁档期',
      oldStatus,
      WorkOrderStatus.COMPLETED,
      req.user!.id,
      workOrder.assignedTo,
      completionNote
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.COMPLETE,
      workOrder.id,
      workOrder.title,
      `工单完工: ${workOrder.title}`,
      oldWorkOrder,
      workOrder.toJSON()
    );

    ResponseUtil.success(res, workOrder, '工单完工成功，档期已解锁');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const reviewWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('只有已完工的工单才能审核');
    }

    const oldStatus = workOrder.status;
    const newStatus = status === 'pass' ? WorkOrderStatus.REVIEWED : WorkOrderStatus.ASSIGNED;

    await workOrder.update(
      {
        status: newStatus,
        reviewedTime: new Date(),
        reviewedBy: req.user!.id,
        reviewComment: comment
      },
      { transaction: t }
    );

    const oldWorkOrder = workOrder.toJSON();
    await createWorkOrderLog(
      workOrder.id,
      status === 'pass' ? '审核通过' : '审核驳回',
      oldStatus,
      newStatus,
      req.user!.id,
      undefined,
      comment
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.REVIEW,
      workOrder.id,
      workOrder.title,
      `工单审核${status === 'pass' ? '通过' : '驳回'}: ${workOrder.title}`,
      oldWorkOrder,
      workOrder.toJSON()
    );

    const message = status === 'pass' ? '工单审核通过' : '工单已驳回，重新分配';
    ResponseUtil.success(res, workOrder, message);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const reassignWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { cleanerId, remark } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if ([WorkOrderStatus.COMPLETED, WorkOrderStatus.REVIEWED, WorkOrderStatus.CANCELLED].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许重新分配');
    }

    const cleaner = await Cleaner.findByPk(cleanerId, { transaction: t });
    if (!cleaner) {
      throw new BadRequestException('保洁人员不存在');
    }

    if (cleaner.status !== CleanerStatus.ON_DUTY) {
      throw new BadRequestException('该保洁人员当前不在岗，无法分配工单');
    }

    if (cleaner.workAreaId !== workOrder.workAreaId) {
      throw new BadRequestException('该保洁人员不属于工单作业区域');
    }

    const oldStatus = workOrder.status;
    await workOrder.update(
      {
        assignedTo: cleanerId,
        status: WorkOrderStatus.REASSIGNED,
        reassignCount: workOrder.reassignCount + 1
      },
      { transaction: t }
    );

    const oldWorkOrder = workOrder.toJSON();
    await createWorkOrderLog(
      workOrder.id,
      '重新分配',
      oldStatus,
      WorkOrderStatus.REASSIGNED,
      req.user!.id,
      cleanerId,
      remark
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.ASSIGN,
      workOrder.id,
      workOrder.title,
      `重新分配工单给: ${cleaner.name || cleanerId}`,
      oldWorkOrder,
      workOrder.toJSON()
    );

    ResponseUtil.success(res, workOrder, '工单重新分配成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const cancelWorkOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction: t });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if ([WorkOrderStatus.COMPLETED, WorkOrderStatus.REVIEWED, WorkOrderStatus.CANCELLED].includes(workOrder.status as WorkOrderStatus)) {
      throw new BadRequestException('当前工单状态不允许取消');
    }

    const oldStatus = workOrder.status;
    await workOrder.update(
      { 
        status: WorkOrderStatus.CANCELLED, 
        cancelReason: reason,
        scheduleLocked: false
      },
      { transaction: t }
    );

    const oldWorkOrder = workOrder.toJSON();
    await createWorkOrderLog(
      workOrder.id,
      '取消工单并解锁档期',
      oldStatus,
      WorkOrderStatus.CANCELLED,
      req.user!.id,
      undefined,
      reason
    );

    await t.commit();

    await logService.createWorkOrderLog(
      req,
      OperationType.CANCEL,
      workOrder.id,
      workOrder.title,
      `取消工单: ${workOrder.title}`,
      oldWorkOrder,
      workOrder.toJSON()
    );

    ResponseUtil.success(res, workOrder, '工单已取消，档期已解锁');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, workAreaId, cleanerId } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (workAreaId) where.workAreaId = workAreaId;
    if (cleanerId) where.assignedTo = cleanerId;

    const statusCounts = await WorkOrder.findAll({
      where,
      attributes: ['status', [fn('COUNT', '*'), 'count']],
      group: ['status'],
      raw: true
    });

    const stats: any = {
      total: 0,
      pending: 0,
      assigned: 0,
      accepted: 0,
      inProgress: 0,
      reported: 0,
      completed: 0,
      reviewed: 0,
      reassigned: 0,
      cancelled: 0
    };

    statusCounts.forEach((item: any) => {
      const count = parseInt(item.count);
      stats.total += count;
      if (item.status === WorkOrderStatus.PENDING) stats.pending = count;
      if (item.status === WorkOrderStatus.ASSIGNED) stats.assigned = count;
      if (item.status === WorkOrderStatus.ACCEPTED) stats.accepted = count;
      if (item.status === WorkOrderStatus.IN_PROGRESS) stats.inProgress = count;
      if (item.status === WorkOrderStatus.REPORTED) stats.reported = count;
      if (item.status === WorkOrderStatus.COMPLETED) stats.completed = count;
      if (item.status === WorkOrderStatus.REVIEWED) stats.reviewed = count;
      if (item.status === WorkOrderStatus.REASSIGNED) stats.reassigned = count;
      if (item.status === WorkOrderStatus.CANCELLED) stats.cancelled = count;
    });

    stats.completionRate = stats.total > 0 
      ? parseFloat(((stats.reviewed / stats.total) * 100).toFixed(2)) 
      : 0;

    const overdueCount = await WorkOrder.count({
      where: {
        ...where,
        deadlineTime: { [Op.lt]: new Date() },
        status: { [Op.notIn]: [WorkOrderStatus.REVIEWED, WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED] }
      }
    });
    stats.overdue = overdueCount;

    ResponseUtil.success(res, stats);
  } catch (error) {
    next(error);
  }
};

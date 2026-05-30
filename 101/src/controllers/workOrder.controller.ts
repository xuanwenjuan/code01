import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import dayjs from 'dayjs';
import WorkOrder from '../models/WorkOrder.model';
import Pigeon from '../models/Pigeon.model';
import Expense from '../models/Expense.model';
import Category from '../models/Category.model';
import { 
  WorkOrderType, 
  WorkOrderStatus, 
  PigeonStatus,
  ExpenseType,
  OperationType,
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
  EXPENSE_TYPE_LABELS
} from '../constants/enum';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/base.exception';
import sequelize from '../config/database';
import logger from '../utils/logger';
import operationLogService from '../services/operationLog.service';

const STATUS_FLOW: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [WorkOrderStatus.CONFIRMED, WorkOrderStatus.CANCELLED, WorkOrderStatus.LOCKED],
  [WorkOrderStatus.LOCKED]: [WorkOrderStatus.CONFIRMED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.CONFIRMED]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.COMPLETED]: [],
  [WorkOrderStatus.CANCELLED]: []
};

export const createWorkOrderSchema = Joi.object({
  type: Joi.string().valid(...Object.values(WorkOrderType)).required().messages({
    'any.only': '工单类型不合法',
    'any.required': '工单类型是必填项'
  }),
  title: Joi.string().required().max(200).messages({
    'string.empty': '工单标题不能为空',
    'string.max': '工单标题不能超过200个字符',
    'any.required': '工单标题是必填项'
  }),
  description: Joi.string().max(2000).optional(),
  pigeonIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.min': '至少选择一只赛鸽',
    'any.required': '赛鸽ID列表是必填项'
  }),
  location: Joi.string().max(200).optional(),
  distance: Joi.number().positive().optional().messages({
    'number.positive': '距离必须是正数'
  }),
  planDate: Joi.date().required().messages({
    'any.required': '计划日期是必填项'
  }),
  raceName: Joi.string().max(200).optional(),
  remarks: Joi.string().max(1000).optional()
});

export const updateWorkOrderSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().max(2000).optional(),
  pigeonIds: Joi.array().items(Joi.number().integer().positive()).min(1).optional(),
  location: Joi.string().max(200).optional(),
  distance: Joi.number().positive().optional(),
  planDate: Joi.date().optional(),
  raceName: Joi.string().max(200).optional(),
  remarks: Joi.string().max(1000).optional()
});

export const updateWorkOrderStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(WorkOrderStatus)).required().messages({
    'any.only': '状态不合法',
    'any.required': '状态是必填项'
  }),
  reason: Joi.string().max(500).optional(),
  returnCount: Joi.number().integer().min(0).optional(),
  results: Joi.string().max(5000).optional(),
  actualStartDate: Joi.date().optional(),
  actualEndDate: Joi.date().optional()
});

export const autoSummarizeExpenseSchema = Joi.object({
  feedCost: Joi.number().positive().optional(),
  medicineCost: Joi.number().positive().optional(),
  transportCost: Joi.number().positive().optional(),
  registrationFee: Joi.number().positive().optional(),
  otherCost: Joi.number().positive().optional()
});

const generateOrderNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO${date}${random}`;
};

export const createWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { pigeonIds, planDate, type, ...rest } = req.body;

    const pigeons = await Pigeon.findAll({
      where: { 
        id: { [Op.in]: pigeonIds },
        status: PigeonStatus.IN_LOFT
      },
      transaction
    });

    if (pigeons.length !== pigeonIds.length) {
      const invalidIds = pigeonIds.filter(
        (id: number) => !pigeons.some(p => p.id === id)
      );
      throw new BadRequestException(`部分赛鸽不在棚或不存在，ID: ${invalidIds.join(', ')}`);
    }

    if (type === WorkOrderType.FORMAL_RACE) {
      const overlappingRaces = await WorkOrder.count({
        where: {
          type: WorkOrderType.FORMAL_RACE,
          status: { [Op.in]: [WorkOrderStatus.PENDING, WorkOrderStatus.LOCKED, WorkOrderStatus.CONFIRMED] },
          planDate: {
            [Op.between]: [
              dayjs(planDate).subtract(3, 'day').toDate(),
              dayjs(planDate).add(3, 'day').toDate()
            ]
          }
        },
        transaction
      });

      if (overlappingRaces > 0) {
        throw new BadRequestException('该日期前后3天内已有锁定或已确认的赛事，为避免档期冲突请选择其他日期');
      }
    }

    const orderNo = generateOrderNo();
    const workOrder = await WorkOrder.create({
      orderNo,
      type,
      status: WorkOrderStatus.PENDING,
      pigeonIds: JSON.stringify(pigeonIds),
      pigeonCount: pigeonIds.length,
      planDate,
      createdById: req.user!.id,
      ...rest
    }, { transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.CREATE,
      req.user,
      { orderNo, type, planDate, pigeonCount: pigeonIds.length },
      { workOrderId: workOrder.id },
      `创建工单: ${orderNo} - ${WORK_ORDER_TYPE_LABELS[type]}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]创建工单: ${orderNo}`);
    
    res.json(ResponseUtil.success(workOrder, '创建成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.CREATE,
      (error as Error).message,
      req.user,
      req.body
    );
    next(error);
  }
};

export const lockRaceSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.type !== WorkOrderType.FORMAL_RACE) {
      throw new BadRequestException('只有正式赛事可以锁定档期');
    }

    if (workOrder.status !== WorkOrderStatus.PENDING) {
      throw new BadRequestException('只有待确认状态的工单可以锁定');
    }

    await workOrder.update({
      status: WorkOrderStatus.LOCKED
    }, { transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.LOCK,
      req.user,
      { workOrderId: id, orderNo: workOrder.orderNo, reason },
      null,
      `锁定赛事档期: ${workOrder.orderNo}, 原因: ${reason || '无'}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]锁定赛事档期: ${workOrder.orderNo}`);
    
    res.json(ResponseUtil.success(workOrder, '赛事档期锁定成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.LOCK,
      (error as Error).message,
      req.user,
      { workOrderId: req.params.id }
    );
    next(error);
  }
};

export const unlockRaceSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.LOCKED) {
      throw new BadRequestException('只有已锁定状态的工单可以解锁');
    }

    await workOrder.update({
      status: WorkOrderStatus.PENDING
    }, { transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.UNLOCK,
      req.user,
      { workOrderId: id, orderNo: workOrder.orderNo, reason },
      null,
      `解锁赛事档期: ${workOrder.orderNo}, 原因: ${reason || '无'}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]解锁赛事档期: ${workOrder.orderNo}`);
    
    res.json(ResponseUtil.success(workOrder, '赛事档期解锁成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.UNLOCK,
      (error as Error).message,
      req.user,
      { workOrderId: req.params.id }
    );
    next(error);
  }
};

export const getWorkOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      type,
      status,
      startDate,
      endDate,
      keyword
    } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.planDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (keyword) {
      where[Op.or] = [
        { orderNo: { [Op.like]: `%${keyword}%` } },
        { title: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    const list = rows.map(order => ({
      ...order.toJSON(),
      pigeonIds: order.pigeonIds ? JSON.parse(order.pigeonIds) : [],
      typeLabel: WORK_ORDER_TYPE_LABELS[order.type],
      statusLabel: WORK_ORDER_STATUS_LABELS[order.status],
      allowedNextStatuses: STATUS_FLOW[order.status]
    }));

    res.json(ResponseUtil.success({
      list,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id);

    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    let pigeons: any[] = [];
    if (workOrder.pigeonIds) {
      const pigeonIdList = JSON.parse(workOrder.pigeonIds);
      pigeons = await Pigeon.findAll({
        where: { id: { [Op.in]: pigeonIdList } },
        attributes: ['id', 'ringNumber', 'name', 'gender', 'status', 'categoryId'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }]
      });
    }

    const relatedExpenses = await Expense.findAll({
      where: { workOrderId: id },
      order: [['createdAt', 'DESC']]
    });

    res.json(ResponseUtil.success({
      ...workOrder.toJSON(),
      pigeonIds: workOrder.pigeonIds ? JSON.parse(workOrder.pigeonIds) : [],
      pigeons,
      relatedExpenses,
      typeLabel: WORK_ORDER_TYPE_LABELS[workOrder.type],
      statusLabel: WORK_ORDER_STATUS_LABELS[workOrder.status],
      allowedNextStatuses: STATUS_FLOW[workOrder.status]
    }));
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { pigeonIds, planDate, ...rest } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (![WorkOrderStatus.PENDING, WorkOrderStatus.LOCKED].includes(workOrder.status)) {
      throw new BadRequestException('只有待确认或已锁定状态的工单可以编辑');
    }

    if (workOrder.status === WorkOrderStatus.LOCKED) {
      throw new ForbiddenException('已锁定的工单无法编辑，请先解锁');
    }

    const updateData: any = { ...rest };

    if (pigeonIds) {
      const pigeons = await Pigeon.findAll({
        where: { 
          id: { [Op.in]: pigeonIds },
          status: PigeonStatus.IN_LOFT
        },
        transaction
      });

      if (pigeons.length !== pigeonIds.length) {
        const invalidIds = pigeonIds.filter(
          (id: number) => !pigeons.some(p => p.id === id)
        );
        throw new BadRequestException(`部分赛鸽不在棚或不存在，ID: ${invalidIds.join(', ')}`);
      }

      updateData.pigeonIds = JSON.stringify(pigeonIds);
      updateData.pigeonCount = pigeonIds.length;
    }

    if (planDate && workOrder.type === WorkOrderType.FORMAL_RACE) {
      const overlappingRaces = await WorkOrder.count({
        where: {
          id: { [Op.ne]: id },
          type: WorkOrderType.FORMAL_RACE,
          status: { [Op.in]: [WorkOrderStatus.PENDING, WorkOrderStatus.LOCKED, WorkOrderStatus.CONFIRMED] },
          planDate: {
            [Op.between]: [
              dayjs(planDate).subtract(3, 'day').toDate(),
              dayjs(planDate).add(3, 'day').toDate()
            ]
          }
        },
        transaction
      });

      if (overlappingRaces > 0) {
        throw new BadRequestException('该日期前后3天内已有锁定或已确认的赛事，为避免档期冲突请选择其他日期');
      }

      updateData.planDate = planDate;
    }

    await workOrder.update(updateData, { transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.UPDATE,
      req.user,
      { workOrderId: id, orderNo: workOrder.orderNo, ...req.body },
      null,
      `更新工单: ${workOrder.orderNo}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]更新工单: ${workOrder.orderNo}`);
    
    res.json(ResponseUtil.success(workOrder, '更新成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.UPDATE,
      (error as Error).message,
      req.user,
      { workOrderId: req.params.id, ...req.body }
    );
    next(error);
  }
};

export const updateWorkOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, reason, returnCount, results, actualStartDate, actualEndDate } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    const allowedStatuses = STATUS_FLOW[workOrder.status];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        `当前状态「${WORK_ORDER_STATUS_LABELS[workOrder.status]}」不允许变更为「${WORK_ORDER_STATUS_LABELS[status]}」`
      );
    }

    const updateData: any = { status };

    switch (status) {
      case WorkOrderStatus.CONFIRMED:
        updateData.confirmedById = req.user!.id;
        updateData.confirmedAt = new Date();
        break;

      case WorkOrderStatus.IN_PROGRESS:
        if (workOrder.status !== WorkOrderStatus.CONFIRMED) {
          throw new BadRequestException('只有已确认的工单才能开始执行');
        }
        updateData.actualStartDate = actualStartDate || new Date();
        
        const pigeonIdList = JSON.parse(workOrder.pigeonIds || '[]');
        await Pigeon.update(
          { status: workOrder.type === WorkOrderType.FORMAL_RACE ? PigeonStatus.RACING : PigeonStatus.TRAINING },
          { where: { id: { [Op.in]: pigeonIdList } }, transaction }
        );
        break;

      case WorkOrderStatus.COMPLETED:
        if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
          throw new BadRequestException('只有进行中的工单才能完成');
        }
        if (returnCount !== undefined) {
          if (returnCount > workOrder.pigeonCount!) {
            throw new BadRequestException('归巢数量不能大于参赛数量');
          }
          updateData.returnCount = returnCount;
        }
        if (results) updateData.results = results;
        updateData.actualEndDate = actualEndDate || new Date();
        
        const pigeonIdsToRestore = JSON.parse(workOrder.pigeonIds || '[]');
        await Pigeon.update(
          { status: PigeonStatus.IN_LOFT },
          { where: { id: { [Op.in]: pigeonIdsToRestore } }, transaction }
        );
        break;

      case WorkOrderStatus.CANCELLED:
        if (workOrder.status === WorkOrderStatus.IN_PROGRESS) {
          const pigeonIdsToCancel = JSON.parse(workOrder.pigeonIds || '[]');
          await Pigeon.update(
            { status: PigeonStatus.IN_LOFT },
            { where: { id: { [Op.in]: pigeonIdsToCancel } }, transaction }
          );
        }
        break;
    }

    await workOrder.update(updateData, { transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.UPDATE,
      req.user,
      { workOrderId: id, orderNo: workOrder.orderNo, fromStatus: workOrder.status, toStatus: status, reason },
      null,
      `工单状态变更: ${workOrder.orderNo} ${workOrder.status} → ${status}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]更新工单状态: ${workOrder.orderNo} ${workOrder.status} → ${status}`);
    
    res.json(ResponseUtil.success(workOrder, `工单状态已更新为「${WORK_ORDER_STATUS_LABELS[status]}」`));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.UPDATE,
      (error as Error).message,
      req.user,
      { workOrderId: req.params.id, ...req.body }
    );
    next(error);
  }
};

export const autoSummarizeExpenses = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { feedCost, medicineCost, transportCost, registrationFee, otherCost } = req.body;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status !== WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('只有已完成的工单才能进行开销汇总');
    }

    const existingExpenses = await Expense.count({
      where: { workOrderId: id },
      transaction
    });
    if (existingExpenses > 0) {
      throw new BadRequestException('该工单已进行过开销汇总，请勿重复操作');
    }

    const expenseRecords = [];
    const expenseDate = workOrder.actualEndDate || new Date();

    if (feedCost && feedCost > 0) {
      expenseRecords.push({
        expenseNo: `EXP${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: ExpenseType.FEED,
        title: `${workOrder.title} - 饲料耗材`,
        amount: feedCost,
        workOrderId: id,
        expenseDate,
        operatorId: req.user!.id,
        description: `赛事ID: ${workOrder.orderNo}，赛鸽数量: ${workOrder.pigeonCount}`
      });
    }

    if (medicineCost && medicineCost > 0) {
      expenseRecords.push({
        expenseNo: `EXP${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: ExpenseType.MEDICINE,
        title: `${workOrder.title} - 医药防疫`,
        amount: medicineCost,
        workOrderId: id,
        expenseDate,
        operatorId: req.user!.id,
        description: `赛事ID: ${workOrder.orderNo}，赛鸽数量: ${workOrder.pigeonCount}`
      });
    }

    if (transportCost && transportCost > 0) {
      expenseRecords.push({
        expenseNo: `EXP${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: ExpenseType.TRAINING,
        title: `${workOrder.title} - 运输训放`,
        amount: transportCost,
        workOrderId: id,
        expenseDate,
        operatorId: req.user!.id,
        description: `赛事ID: ${workOrder.orderNo}，地点: ${workOrder.location || '未填写'}`
      });
    }

    if (registrationFee && registrationFee > 0) {
      expenseRecords.push({
        expenseNo: `EXP${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: ExpenseType.RACE_FEE,
        title: `${workOrder.title} - 报名费`,
        amount: registrationFee,
        workOrderId: id,
        expenseDate,
        operatorId: req.user!.id,
        description: `赛事ID: ${workOrder.orderNo}，赛鸽数量: ${workOrder.pigeonCount}`
      });
    }

    if (otherCost && otherCost > 0) {
      expenseRecords.push({
        expenseNo: `EXP${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: ExpenseType.OTHER,
        title: `${workOrder.title} - 其他支出`,
        amount: otherCost,
        workOrderId: id,
        expenseDate,
        operatorId: req.user!.id,
        description: `赛事ID: ${workOrder.orderNo}`
      });
    }

    if (expenseRecords.length === 0) {
      throw new BadRequestException('请至少填写一项开销金额');
    }

    const createdExpenses = await Expense.bulkCreate(expenseRecords, { transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.COMPLETE,
      req.user,
      { workOrderId: id, orderNo: workOrder.orderNo, expenses: expenseRecords.length },
      { expenseCount: createdExpenses.length },
      `工单开销汇总: ${workOrder.orderNo}，共 ${createdExpenses.length} 条记录`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]完成工单开销汇总: ${workOrder.orderNo}，共 ${createdExpenses.length} 条记录`);
    
    res.json(ResponseUtil.success(createdExpenses, `开销汇总完成，共生成 ${createdExpenses.length} 条记录`));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.COMPLETE,
      (error as Error).message,
      req.user,
      { workOrderId: req.params.id, ...req.body }
    );
    next(error);
  }
};

export const deleteWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      throw new NotFoundException('工单不存在');
    }

    if (workOrder.status === WorkOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('进行中的工单无法删除');
    }

    const orderNo = workOrder.orderNo;
    await workOrder.destroy({ transaction });

    await operationLogService.logSuccess(
      '训放参赛工单',
      OperationType.DELETE,
      req.user,
      { workOrderId: id, orderNo },
      null,
      `删除工单: ${orderNo}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]删除工单: ${orderNo}`);
    
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '训放参赛工单',
      OperationType.DELETE,
      (error as Error).message,
      req.user,
      { workOrderId: req.params.id }
    );
    next(error);
  }
};

export const getWorkOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const statusStats = await WorkOrder.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    const typeStats = await WorkOrder.findAll({
      where,
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['type']
    });

    const totalResult = await WorkOrder.findOne({
      where,
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'total']]
    });

    const lockedRaces = await WorkOrder.count({
      where: {
        ...where,
        type: WorkOrderType.FORMAL_RACE,
        status: WorkOrderStatus.LOCKED
      }
    });

    const thisMonthStart = dayjs().startOf('month').toDate();
    const thisMonthStats = await WorkOrder.findAll({
      where: { ...where, createdAt: { [Op.gte]: thisMonthStart } },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    res.json(ResponseUtil.success({
      total: (totalResult as any)?.dataValues?.total || 0,
      lockedRaces,
      statusStats: statusStats.map(s => ({
        status: s.status,
        label: WORK_ORDER_STATUS_LABELS[s.status as WorkOrderStatus],
        count: (s as any).dataValues.count
      })),
      typeStats: typeStats.map(t => ({
        type: t.type,
        label: WORK_ORDER_TYPE_LABELS[t.type as WorkOrderType],
        count: (t as any).dataValues.count
      })),
      thisMonthStats: thisMonthStats.map(s => ({
        status: s.status,
        label: WORK_ORDER_STATUS_LABELS[s.status as WorkOrderStatus],
        count: (s as any).dataValues.count
      }))
    }));
  } catch (error) {
    next(error);
  }
};

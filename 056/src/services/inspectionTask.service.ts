import { Transaction, FindOptions, Op, Col } from 'sequelize';
import sequelize from '../config/database';
import { InspectionTask, Equipment, User, InspectionPlan } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { InspectionStatus, EquipmentStatus, UserRole } from '../types';
import CodeGenerator from '../utils/generator';
import logger from '../utils/logger';

interface InspectionTaskCreateData {
  planId?: number;
  equipmentId: number;
  inspectorId?: number;
  title: string;
  scheduledDate: Date;
  inspectionItems: string;
}

interface InspectionTaskUpdateData {
  title?: string;
  scheduledDate?: Date;
  inspectorId?: number;
  inspectionItems?: string;
}

interface SubmitResultData {
  inspectionResult: string;
  hasException: boolean;
  exceptionDescription?: string;
  completedBy: number;
}

interface StatisticsItem {
  status: InspectionStatus;
  count: number;
}

interface FindAllParams {
  title?: string;
  taskNo?: string;
  equipmentId?: number;
  inspectorId?: number;
  status?: InspectionStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export class InspectionTaskService {
  private validateStatusTransition(
    currentStatus: InspectionStatus,
    nextStatus: InspectionStatus
  ): boolean {
    const validTransitions: Record<InspectionStatus, InspectionStatus[]> = {
      [InspectionStatus.PENDING]: [InspectionStatus.IN_PROGRESS],
      [InspectionStatus.IN_PROGRESS]: [InspectionStatus.COMPLETED, InspectionStatus.EXCEPTION],
      [InspectionStatus.COMPLETED]: [],
      [InspectionStatus.EXCEPTION]: [],
    };
    return validTransitions[currentStatus].includes(nextStatus);
  }

  private async validateInspectorAssignment(
    task: InspectionTask,
    userId: number,
    userRole: UserRole
  ): void {
    if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
      return;
    }

    if (task.inspectorId && task.inspectorId !== userId) {
      throw new ForbiddenError('只有指派的巡检员才能执行此操作');
    }
  }

  async create(data: InspectionTaskCreateData): Promise<InspectionTask> {
    const equipment = await Equipment.findByPk(data.equipmentId);
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (data.inspectorId) {
      const inspector = await User.findByPk(data.inspectorId);
      if (!inspector) {
        throw new NotFoundError('巡检员不存在');
      }
    }

    if (data.planId) {
      const plan = await InspectionPlan.findByPk(data.planId);
      if (!plan) {
        throw new NotFoundError('巡检计划不存在');
      }
    }

    const taskNo = CodeGenerator.generateTaskNo();

    const task = await InspectionTask.create({
      ...data,
      taskNo,
      status: InspectionStatus.PENDING,
      hasException: false,
    });

    logger.info(`创建巡检任务成功: ${taskNo}`);
    return task;
  }

  async update(id: number, data: InspectionTaskUpdateData): Promise<InspectionTask> {
    const task = await InspectionTask.findByPk(id);
    if (!task) {
      throw new NotFoundError('巡检任务不存在');
    }

    if (task.status !== InspectionStatus.PENDING) {
      throw new BadRequestError('只能编辑待执行的任务');
    }

    if (data.inspectorId) {
      const inspector = await User.findByPk(data.inspectorId);
      if (!inspector) {
        throw new NotFoundError('巡检员不存在');
      }
    }

    await task.update(data);
    logger.info(`更新巡检任务成功: ${task.taskNo}`);
    return task;
  }

  async delete(id: number): Promise<void> {
    const task = await InspectionTask.findByPk(id);
    if (!task) {
      throw new NotFoundError('巡检任务不存在');
    }

    if (task.status !== InspectionStatus.PENDING) {
      throw new BadRequestError('只能删除待执行的任务');
    }

    await task.destroy();
    logger.info(`删除巡检任务成功: ${task.taskNo}`);
  }

  async findById(id: number): Promise<InspectionTask> {
    const task = await InspectionTask.findByPk(id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: InspectionPlan, as: 'plan' },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'completer', attributes: ['id', 'username', 'realName'] },
      ],
    });
    if (!task) {
      throw new NotFoundError('巡检任务不存在');
    }
    return task;
  }

  async findAll(params: FindAllParams): Promise<{
    list: InspectionTask[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const {
      title,
      taskNo,
      equipmentId,
      inspectorId,
      status,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = params;

    const where: Record<string, unknown> = {};

    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }

    if (taskNo) {
      where.taskNo = { [Op.like]: `%${taskNo}%` };
    }

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    if (inspectorId) {
      where.inspectorId = inspectorId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.scheduledDate = { [Op.between]: [startDate, endDate] };
    }

    const options: FindOptions = {
      where,
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'realName'] },
      ],
      order: [['scheduledDate', 'DESC'], ['createdAt', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await InspectionTask.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async startTask(id: number, userId: number, userRole: UserRole): Promise<InspectionTask> {
    const task = await InspectionTask.findByPk(id);
    if (!task) {
      throw new NotFoundError('巡检任务不存在');
    }

    if (!this.validateStatusTransition(task.status, InspectionStatus.IN_PROGRESS)) {
      throw new BadRequestError(`当前状态 ${task.status} 无法开始巡检`);
    }

    this.validateInspectorAssignment(task, userId, userRole);

    const updatedTask = await task.update({ status: InspectionStatus.IN_PROGRESS });
    logger.info(`开始巡检任务成功: ${task.taskNo}`);
    return updatedTask;
  }

  async submitResult(
    id: number,
    data: SubmitResultData,
    userRole: UserRole
  ): Promise<InspectionTask> {
    const t: Transaction = await sequelize.transaction();

    try {
      const task = await InspectionTask.findByPk(id, { transaction: t });
      if (!task) {
        throw new NotFoundError('巡检任务不存在');
      }

      const targetStatus = data.hasException
        ? InspectionStatus.EXCEPTION
        : InspectionStatus.COMPLETED;

      if (!this.validateStatusTransition(task.status, targetStatus)) {
        throw new BadRequestError(`当前状态 ${task.status} 无法提交巡检结果`);
      }

      this.validateInspectorAssignment(task, data.completedBy, userRole);

      const updatedTask = await task.update(
        {
          status: targetStatus,
          inspectionResult: data.inspectionResult,
          hasException: data.hasException,
          exceptionDescription: data.exceptionDescription,
          completedBy: data.completedBy,
          actualDate: new Date(),
          completedAt: new Date(),
        },
        { transaction: t }
      );

      if (data.hasException) {
        await Equipment.update(
          { status: EquipmentStatus.FAULT },
          { where: { id: task.equipmentId }, transaction: t }
        );
        logger.info(`设备 ${task.equipmentId} 状态已更新为故障`);
      }

      await t.commit();
      logger.info(`提交巡检结果成功: ${task.taskNo}`);
      return updatedTask;
    } catch (error) {
      await t.rollback();
      logger.error(`提交巡检结果失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getStatistics(): Promise<StatisticsItem[]> {
    const result = await InspectionTask.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    return result.map((item) => ({
      status: item.getDataValue('status') as InspectionStatus,
      count: Number(item.getDataValue('count')),
    }));
  }

  async getMyTasks(
    userId: number,
    params: {
      status?: InspectionStatus;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    list: InspectionTask[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { status, page = 1, pageSize = 10 } = params;
    const where: Record<string, unknown> = { inspectorId: userId };

    if (status) {
      where.status = status;
    }

    const options: FindOptions = {
      where,
      include: [{ model: Equipment, as: 'equipment' }],
      order: [['scheduledDate', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await InspectionTask.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }
}

export default new InspectionTaskService();

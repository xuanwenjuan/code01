import { Response, NextFunction } from 'express';
import Performance from '../models/Performance';
import WorkOrder, { WorkOrderStatus } from '../models/WorkOrder';
import Cleaner, { CleanerStatus } from '../models/Cleaner';
import WorkArea from '../models/WorkArea';
import User, { UserRole } from '../models/User';
import ResponseUtil from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/AppException';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import logService from '../services/log.service';
import { OperationType } from '../models/OperationLog';
import { Op, fn, col } from 'sequelize';
import moment from 'moment';
import sequelize from '../config/database';

export const calculateValidation = [
  body('year').isInt({ min: 2020, max: 2100 }).withMessage('年份必须在2020-2100之间'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('月份必须在1-12之间')
];

export const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('绩效ID必须为正整数'),
  body('attendanceDays').optional().isInt({ min: 0, max: 31 }).withMessage('出勤天数必须在0-31之间'),
  body('violationPoints').optional().isInt({ min: 0, max: 100 }).withMessage('违规扣分必须在0-100之间'),
  body('performanceBonus').optional().isFloat({ min: 0 }).withMessage('绩效奖金不能为负数'),
  body('remarks').optional().isString().withMessage('备注必须为字符串')
];

export const calculatePerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      throw new BadRequestException('年份和月份不能为空');
    }

    const startOfMonth = moment([year, month - 1, 1]).toDate();
    const endOfMonth = moment([year, month - 1]).endOf('month').toDate();

    const cleaners = await Cleaner.findAll({
      where: { status: { [Op.ne]: CleanerStatus.RESIGNED } },
      transaction: t
    });

    const results = [];

    for (const cleaner of cleaners) {
      const totalOrders = await WorkOrder.count({
        where: {
          assignedTo: cleaner.id,
          scheduledDate: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        transaction: t
      });

      const completedOrders = await WorkOrder.count({
        where: {
          assignedTo: cleaner.id,
          status: { [Op.in]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.REVIEWED] },
          scheduledDate: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        transaction: t
      });

      const reviewedOrders = await WorkOrder.count({
        where: {
          assignedTo: cleaner.id,
          status: WorkOrderStatus.REVIEWED,
          scheduledDate: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        transaction: t
      });

      const cancelledOrders = await WorkOrder.count({
        where: {
          assignedTo: cleaner.id,
          status: WorkOrderStatus.CANCELLED,
          scheduledDate: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        transaction: t
      });

      const timeoutOrders = await WorkOrder.count({
        where: {
          assignedTo: cleaner.id,
          status: { [Op.notIn]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.REVIEWED, WorkOrderStatus.CANCELLED] },
          deadlineTime: { [Op.lt]: new Date() },
          scheduledDate: { [Op.between]: [startOfMonth, endOfMonth] }
        },
        transaction: t
      });

      const validOrders = totalOrders - cancelledOrders;
      const completionRate = validOrders > 0 ? Number(((completedOrders / validOrders) * 100).toFixed(2)) : 0;

      const workDaysInMonth = moment([year, month - 1]).daysInMonth();
      const weekends = Math.floor(workDaysInMonth / 7) * 2;
      const standardWorkDays = workDaysInMonth - weekends;
      
      const uniqueWorkDays = await WorkOrder.findAll({
        where: {
          assignedTo: cleaner.id,
          scheduledDate: { [Op.between]: [startOfMonth, endOfMonth] },
          status: { [Op.notIn]: [WorkOrderStatus.CANCELLED] }
        },
        attributes: [[fn('DISTINCT', col('scheduledDate')), 'date']],
        raw: true,
        transaction: t
      });
      
      const actualWorkDays = uniqueWorkDays.length;
      const attendanceDays = Math.min(standardWorkDays, actualWorkDays);

      const basePoints = 100;
      const timeoutPenalty = timeoutOrders * 5;
      const violationPoints = Math.min(basePoints, timeoutPenalty);

      let performanceBonus = 0;
      if (completionRate >= 98 && violationPoints <= 10) {
        performanceBonus = 800;
      } else if (completionRate >= 95 && violationPoints <= 20) {
        performanceBonus = 500;
      } else if (completionRate >= 90 && violationPoints <= 30) {
        performanceBonus = 300;
      } else if (completionRate >= 85) {
        performanceBonus = 150;
      }

      const finalScore = Math.max(0, basePoints - violationPoints + Math.floor(completionRate / 10));

      const [performance, created] = await Performance.findOrBuild({
        where: {
          cleanerId: cleaner.id,
          year,
          month
        },
        defaults: {
          cleanerId: cleaner.id,
          workAreaId: cleaner.workAreaId,
          year,
          month,
          totalOrders,
          completedOrders,
          reviewedOrders,
          cancelledOrders,
          timeoutOrders,
          completionRate,
          attendanceDays,
          violationPoints,
          performanceBonus,
          finalScore,
          calculatedAt: new Date()
        },
        transaction: t
      });

      if (!created) {
        await performance.update(
          {
            totalOrders,
            completedOrders,
            reviewedOrders,
            cancelledOrders,
            timeoutOrders,
            completionRate,
            attendanceDays,
            violationPoints,
            performanceBonus,
            finalScore,
            calculatedAt: new Date()
          },
          { transaction: t }
        );
      } else {
        await performance.save({ transaction: t });
      }

      results.push(performance);
    }

    await t.commit();

    for (const perf of results) {
      await logService.createPerformanceLog(
        req,
        OperationType.CALCULATE,
        perf.id,
        `${perf.year}年${perf.month}月绩效`,
        `计算绩效: ${perf.year}年${perf.month}月`,
        undefined,
        perf.toJSON()
      );
    }

    ResponseUtil.success(res, { list: results, total: results.length }, '绩效计算完成');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getPerformanceList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { year, month, workAreaId, cleanerId } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const where: any = {};
    if (year) where.year = year;
    if (month) where.month = month;
    if (workAreaId) where.workAreaId = workAreaId;
    if (cleanerId) where.cleanerId = cleanerId;

    const { count, rows } = await Performance.findAndCountAll({
      where,
      include: [
        { model: Cleaner, as: 'cleaner', attributes: ['id', 'name', 'employeeNo'] },
        { model: WorkArea, as: 'workArea', attributes: ['id', 'name'] }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']],
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

export const getPerformanceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const performance = await Performance.findByPk(id, {
      include: [
        { model: Cleaner, as: 'cleaner' },
        { model: WorkArea, as: 'workArea' }
      ]
    });

    if (!performance) {
      throw new NotFoundException('绩效记录不存在');
    }

    const workOrders = await WorkOrder.findAll({
      where: {
        assignedTo: performance.cleanerId,
        createdAt: {
          [Op.between]: [
            moment([performance.year, performance.month - 1, 1]).toDate(),
            moment([performance.year, performance.month - 1]).endOf('month').toDate()
          ]
        }
      },
      include: [{ model: WorkArea, as: 'workArea' }],
      order: [['createdAt', 'DESC']]
    });

    ResponseUtil.success(res, { ...performance.toJSON(), workOrders });
  } catch (error) {
    next(error);
  }
};

export const updatePerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { attendanceDays, violationPoints, performanceBonus, remarks } = req.body;

    const performance = await Performance.findByPk(id);
    if (!performance) {
      throw new NotFoundException('绩效记录不存在');
    }

    await performance.update({
      attendanceDays,
      violationPoints,
      performanceBonus,
      remarks
    });

    ResponseUtil.success(res, performance, '绩效更新成功');
  } catch (error) {
    next(error);
  }
};

export const getPerformanceStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { year, month, workAreaId } = req.query;

    const where: any = {};
    if (year) where.year = year;
    if (month) where.month = month;
    if (workAreaId) where.workAreaId = workAreaId;

    const stats = await Performance.findAll({
      where,
      attributes: [
        [fn('COUNT', '*'), 'totalRecords'],
        [fn('AVG', col('completionRate')), 'avgCompletionRate'],
        [fn('AVG', col('attendanceDays')), 'avgAttendanceDays'],
        [fn('SUM', col('performanceBonus')), 'totalBonus'],
        [fn('AVG', col('violationPoints')), 'avgViolationPoints']
      ],
      raw: true
    });

    const topPerformers = await Performance.findAll({
      where,
      include: [{ model: Cleaner, as: 'cleaner', attributes: ['id', 'name', 'employeeNo'] }],
      order: [['completionRate', 'DESC']],
      limit: 10
    });

    ResponseUtil.success(res, {
      summary: stats[0],
      topPerformers
    });
  } catch (error) {
    next(error);
  }
};

export const getCleanerPerformanceHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cleanerId } = req.params;

    const cleaner = await Cleaner.findByPk(cleanerId);
    if (!cleaner) {
      throw new NotFoundException('保洁人员不存在');
    }

    const history = await Performance.findAll({
      where: { cleanerId },
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: 12
    });

    ResponseUtil.success(res, { cleaner, history });
  } catch (error) {
    next(error);
  }
};

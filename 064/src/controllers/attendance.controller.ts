import { Request, Response, NextFunction } from 'express';
import { Op, fn, col } from 'sequelize';
import { Attendance, Lesson, Student, Class, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import {
  bulkCreateAttendanceSchema,
  updateAttendanceSchema,
  checkInSchema,
  getStatisticsSchema
} from '../validations/attendance.validation';
import { AttendanceStatus, IAttendanceStatistics, IAttendanceQueryParams, StudentStatus } from '../types';
import { PermissionGuard } from '../middlewares/auth';
import * as dayjs from 'dayjs';

export class AttendanceController {
  static async bulkCreate(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canManageAttendance(req.user.role)) {
        throw new ForbiddenException('权限不足，无法创建考勤记录');
      }

      const { error, value } = bulkCreateAttendanceSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { lessonId, records } = value;

      const lesson = await Lesson.findByPk(lessonId, { transaction: t });
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      const existingAttendance = await Attendance.findOne({
        where: { lessonId },
        transaction: t
      });
      if (existingAttendance) {
        throw new BadRequestException('该课时已生成考勤记录');
      }

      const attendanceRecords = records.map((record: any) => ({
        lessonId,
        studentId: record.studentId,
        classId: lesson.classId,
        status: record.status || AttendanceStatus.PRESENT,
        remark: record.remark || ''
      }));

      await Attendance.bulkCreate(attendanceRecords, { transaction: t });
      await t.commit();

      res.status(201).json(ResponseUtil.created(null, '考勤记录生成成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canManageAttendance(req.user.role)) {
        throw new ForbiddenException('权限不足，无法更新考勤记录');
      }

      const { id } = req.params;
      const { error, value } = updateAttendanceSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        throw new NotFoundException('考勤记录不存在');
      }

      await attendance.update(value);

      res.json(ResponseUtil.success(attendance, '考勤记录更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getByLessonId(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;

      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      const attendances = await Attendance.findAll({
        where: { lessonId },
        include: [
          { model: Student, as: 'student' }
        ],
        order: [['id', 'ASC']]
      });

      res.json(ResponseUtil.success(attendances));
    } catch (error) {
      next(error);
    }
  }

  static async getByStudentId(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { page = 1, pageSize = 10, startDate, endDate, status } = req.query as IAttendanceQueryParams;

      const where: any = { studentId };
      if (status) {
        where.status = status;
      }
      if (startDate && endDate) {
        where['$lesson.lessonDate$'] = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows } = await Attendance.findAndCountAll({
        where,
        include: [
          { model: Lesson, as: 'lesson' },
          { model: Class, as: 'classInfo' }
        ],
        order: [['id', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)));
    } catch (error) {
      next(error);
    }
  }

  static async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canViewStatistics(req.user.role)) {
        throw new ForbiddenException('权限不足，无法查看统计数据');
      }

      const { error, value } = getStatisticsSchema.validate(req.query);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { classId, studentId, startDate, endDate } = value;

      const where: any = {};
      if (classId) {
        where.classId = classId;
      }
      if (studentId) {
        where.studentId = studentId;
      }

      if (startDate && endDate) {
        where['$lesson.lessonDate$'] = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const allRecords = await Attendance.findAll({
        where,
        include: [{ model: Lesson, as: 'lesson' }]
      });

      const statistics: IAttendanceStatistics = {
        [AttendanceStatus.PRESENT]: 0,
        [AttendanceStatus.ABSENT]: 0,
        [AttendanceStatus.LATE]: 0,
        [AttendanceStatus.LEAVE_EARLY]: 0,
        [AttendanceStatus.LEAVE]: 0,
        total: allRecords.length,
        attendanceRate: 0
      };

      allRecords.forEach((record) => {
        statistics[record.status] = (statistics[record.status] || 0) + 1;
      });

      const presentCount = statistics[AttendanceStatus.PRESENT] + statistics[AttendanceStatus.LEAVE];
      if (allRecords.length > 0) {
        statistics.attendanceRate = Number(((presentCount / allRecords.length) * 100).toFixed(2));
      }

      res.json(ResponseUtil.success(statistics));
    } catch (error) {
      next(error);
    }
  }

  static async getStudentAttendanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canViewStatistics(req.user.role)) {
        throw new ForbiddenException('权限不足，无法查看统计数据');
      }

      const { studentId, majorId, startDate, endDate } = req.query;

      const where: any = {};
      if (studentId) {
        where.studentId = studentId;
      }
      if (startDate && endDate) {
        where['$lesson.lessonDate$'] = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        };
      }

      const studentWhere: any = { status: StudentStatus.ENROLLED };
      if (studentId) {
        studentWhere.id = studentId;
      }

      const students = await Student.findAll({
        where: studentWhere,
        attributes: ['id', 'name', 'phone']
      });

      const summary = await Promise.all(
        students.map(async (student) => {
          const studentWhereClause = { ...where, studentId: student.id };
          
          const attendances = await Attendance.findAll({
            where: studentWhereClause,
            include: [{ model: Lesson, as: 'lesson' }]
          });

          const counts: Record<string, number> = {
            [AttendanceStatus.PRESENT]: 0,
            [AttendanceStatus.ABSENT]: 0,
            [AttendanceStatus.LATE]: 0,
            [AttendanceStatus.LEAVE_EARLY]: 0,
            [AttendanceStatus.LEAVE]: 0,
            total: attendances.length
          };

          attendances.forEach((record) => {
            counts[record.status] = (counts[record.status] || 0) + 1;
          });

          const presentCount = counts[AttendanceStatus.PRESENT] + counts[AttendanceStatus.LEAVE];
          const attendanceRate = attendances.length > 0
            ? Number(((presentCount / attendances.length) * 100).toFixed(2))
            : 0;

          return {
            studentId: student.id,
            studentName: student.name,
            studentPhone: student.phone,
            statistics: {
              ...counts,
              attendanceRate
            }
          };
        })
      );

      res.json(ResponseUtil.success(summary));
    } catch (error) {
      next(error);
    }
  }

  static async getClassAttendanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canViewStatistics(req.user.role)) {
        throw new ForbiddenException('权限不足，无法查看统计数据');
      }

      const { classId, startDate, endDate } = req.query;

      const where: any = {};
      if (classId) {
        where.classId = classId;
      }
      if (startDate && endDate) {
        where['$lesson.lessonDate$'] = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        };
      }

      const classWhere: any = {};
      if (classId) {
        classWhere.id = classId;
      }

      const classes = await Class.findAll({
        where: classWhere,
        attributes: ['id', 'name']
      });

      const summary = await Promise.all(
        classes.map(async (classItem) => {
          const classWhereClause = { ...where, classId: classItem.id };
          
          const attendances = await Attendance.findAll({
            where: classWhereClause,
            include: [{ model: Lesson, as: 'lesson' }]
          });

          const counts: Record<string, number> = {
            [AttendanceStatus.PRESENT]: 0,
            [AttendanceStatus.ABSENT]: 0,
            [AttendanceStatus.LATE]: 0,
            [AttendanceStatus.LEAVE_EARLY]: 0,
            [AttendanceStatus.LEAVE]: 0,
            total: attendances.length
          };

          attendances.forEach((record) => {
            counts[record.status] = (counts[record.status] || 0) + 1;
          });

          const presentCount = counts[AttendanceStatus.PRESENT] + counts[AttendanceStatus.LEAVE];
          const attendanceRate = attendances.length > 0
            ? Number(((presentCount / attendances.length) * 100).toFixed(2))
            : 0;

          return {
            classId: classItem.id,
            className: classItem.name,
            statistics: {
              ...counts,
              attendanceRate
            }
          };
        })
      );

      res.json(ResponseUtil.success(summary));
    } catch (error) {
      next(error);
    }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      const { error, value } = checkInSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { lessonId, studentId } = value;

      const attendance = await Attendance.findOne({
        where: { lessonId, studentId },
        transaction: t
      });

      if (!attendance) {
        throw new NotFoundException('考勤记录不存在');
      }

      const lesson = await Lesson.findByPk(lessonId, { transaction: t });
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      const now = new Date();
      let status = attendance.status;

      const lessonDateTime = new Date(`${lesson.lessonDate.toISOString().split('T')[0]}T${lesson.startTime}`);
      const lateThreshold = dayjs(lessonDateTime).add(15, 'minute').toDate();

      if (now > lateThreshold && attendance.status === AttendanceStatus.PRESENT) {
        status = AttendanceStatus.LATE;
      }

      await attendance.update({
        checkInTime: now,
        status
      }, { transaction: t });

      await t.commit();
      res.json(ResponseUtil.success(attendance, status === AttendanceStatus.LATE ? '签到成功，已迟到' : '签到成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      const { error, value } = checkInSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { lessonId, studentId } = value;

      const attendance = await Attendance.findOne({
        where: { lessonId, studentId },
        transaction: t
      });

      if (!attendance) {
        throw new NotFoundException('考勤记录不存在');
      }

      if (!attendance.checkInTime) {
        throw new BadRequestException('请先签到');
      }

      const lesson = await Lesson.findByPk(lessonId, { transaction: t });
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      const now = new Date();
      let status = attendance.status;

      const lessonEndTime = new Date(`${lesson.lessonDate.toISOString().split('T')[0]}T${lesson.endTime}`);

      if (now < lessonEndTime && ![AttendanceStatus.LATE, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE].includes(status as AttendanceStatus)) {
        status = AttendanceStatus.LEAVE_EARLY;
      }

      await attendance.update({
        checkOutTime: now,
        status
      }, { transaction: t });

      await t.commit();
      res.json(ResponseUtil.success(attendance, status === AttendanceStatus.LEAVE_EARLY ? '签退成功，早退' : '签退成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async autoMarkAbsent(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canManageAttendance(req.user.role)) {
        throw new ForbiddenException('权限不足，无法执行自动标记缺勤');
      }

      const { lessonId } = req.params;

      const lesson = await Lesson.findByPk(lessonId, { transaction: t });
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      const [affectedCount] = await Attendance.update(
        { status: AttendanceStatus.ABSENT },
        {
          where: {
            lessonId,
            checkInTime: null,
            status: { [Op.ne]: AttendanceStatus.LEAVE }
          },
          transaction: t
        }
      );

      await t.commit();
      res.json(ResponseUtil.success({ markedCount: affectedCount }, `已自动标记 ${affectedCount} 人为缺勤`));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async batchUpdateStatus(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canManageAttendance(req.user.role)) {
        throw new ForbiddenException('权限不足，无法批量更新考勤状态');
      }

      const { ids, status, reason } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestException('请选择要更新的考勤记录');
      }

      if (!Object.values(AttendanceStatus).includes(status)) {
        throw new BadRequestException('考勤状态不正确');
      }

      const [affectedCount] = await Attendance.update(
        {
          status,
          remark: reason
        },
        {
          where: { id: { [Op.in]: ids } },
          transaction: t
        }
      );

      await t.commit();
      res.json(ResponseUtil.success({ updatedCount: affectedCount }, `已成功更新 ${affectedCount} 条考勤记录`));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}

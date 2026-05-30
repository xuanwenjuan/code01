import { Class, Teacher, CourseCategory, Schedule, Enrollment, Student, Attendance } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ClassStatus, AttendanceStatus, CourseCategoryStatus, StudentStatus, EnrollmentStatus, PaymentStatus } from '../types';
import { Op, Transaction } from 'sequelize';
import { withTransaction } from '../utils/transaction';

export const AttendanceFlow = {
  [AttendanceStatus.PRESENT]: {
    canTransitionTo: [AttendanceStatus.ABSENT, AttendanceStatus.LEAVE, AttendanceStatus.LATE],
    requiredConditions: []
  },
  [AttendanceStatus.ABSENT]: {
    canTransitionTo: [AttendanceStatus.PRESENT, AttendanceStatus.LEAVE, AttendanceStatus.LATE],
    requiredConditions: []
  },
  [AttendanceStatus.LEAVE]: {
    canTransitionTo: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE],
    requiredConditions: []
  },
  [AttendanceStatus.LATE]: {
    canTransitionTo: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LEAVE],
    requiredConditions: []
  }
};

export const canTransitionAttendanceStatus = (
  currentStatus: AttendanceStatus,
  newStatus: AttendanceStatus
): boolean => {
  const flow = AttendanceFlow[currentStatus];
  return flow ? flow.canTransitionTo.includes(newStatus) : false;
};

export const createClass = async (data: any) => {
  const { teacherId, courseId, scheduleData, ...classData } = data;

  const teacher = await Teacher.findByPk(teacherId);
  if (!teacher) {
    throw new AppError('教师不存在', 404);
  }

  const course = await CourseCategory.findByPk(courseId);
  if (!course) {
    throw new AppError('课程不存在', 404);
  }

  if (course.status === CourseCategoryStatus.SUSPENDED) {
    throw new AppError('该课程类目已暂停招生，无法创建班级', 400);
  }
  if (course.status === CourseCategoryStatus.CLOSED) {
    throw new AppError('该课程类目已停招，无法创建班级', 400);
  }

  return withTransaction(async (transaction) => {
    const newClass = await Class.create({
      ...classData,
      teacherId,
      courseId,
      currentStudents: 0,
      status: ClassStatus.NOT_STARTED
    }, { transaction });

    if (scheduleData && scheduleData.length > 0) {
      const schedules = scheduleData.map((s: any) => ({
        ...s,
        classId: newClass.id
      }));
      await Schedule.bulkCreate(schedules, { transaction });
    }

    return newClass;
  });
};

export const updateClass = async (id: number, data: any) => {
  const classInfo = await Class.findByPk(id);
  if (!classInfo) {
    throw new AppError('班级不存在', 404);
  }

  await classInfo.update(data);
  return classInfo;
};

export const deleteClass = async (id: number) => {
  const classInfo = await Class.findByPk(id);
  if (!classInfo) {
    throw new AppError('班级不存在', 404);
  }

  await classInfo.destroy();
  return { message: '删除成功' };
};

export const getClassById = async (id: number) => {
  const classInfo = await Class.findByPk(id, {
    include: [
      { model: Teacher },
      { model: CourseCategory },
      { model: Schedule },
      {
        model: Enrollment,
        include: [Student]
      }
    ]
  });
  if (!classInfo) {
    throw new AppError('班级不存在', 404);
  }
  return classInfo;
};

export const getAllClasses = async (query: any) => {
  const { name, teacherId, courseId, status, page = 1, pageSize = 10 } = query;
  const where: any = {};

  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (teacherId) {
    where.teacherId = teacherId;
  }
  if (courseId) {
    where.courseId = courseId;
  }
  if (status) {
    where.status = status;
  }

  const { count, rows } = await Class.findAndCountAll({
    where,
    include: [Teacher, CourseCategory],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: Number(pageSize)
  });

  return {
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  };
};

export const updateStatus = async (id: number, status: ClassStatus) => {
  const classInfo = await Class.findByPk(id);
  if (!classInfo) {
    throw new AppError('班级不存在', 404);
  }

  classInfo.status = status;
  await classInfo.save();
  return classInfo;
};

const calculateHoursConsumed = (
  status: AttendanceStatus,
  defaultHours: number = 1
): number => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return defaultHours;
    case AttendanceStatus.LATE:
      return Math.round(defaultHours * 0.5);
    case AttendanceStatus.ABSENT:
      return defaultHours;
    case AttendanceStatus.LEAVE:
      return 0;
    default:
      return defaultHours;
  }
};

export const recordAttendance = async (data: any) => {
  return withTransaction(async (transaction) => {
    const { classId, attendanceDate, records } = data;

    const classInfo = await Class.findByPk(classId);
    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.status !== ClassStatus.IN_PROGRESS) {
      throw new AppError('只有进行中的班级才能记录考勤', 400);
    }

    const studentIds = records.map((r: any) => r.studentId);
    const enrollments = await Enrollment.findAll({
      where: {
        classId,
        studentId: { [Op.in]: studentIds },
        status: EnrollmentStatus.APPROVED
      },
      transaction
    });

    if (enrollments.length !== records.length) {
      const invalidIds = studentIds.filter(
        (id: number) => !enrollments.some((e: any) => e.studentId === id)
      );
      throw new AppError(`学员ID ${invalidIds.join(', ')} 不存在或未审批通过`, 400);
    }

    const existingAttendances = await Attendance.findAll({
      where: {
        classId,
        studentId: { [Op.in]: studentIds },
        attendanceDate
      },
      transaction
    });

    const attendanceRecords = [];
    const enrollmentUpdates = [];

    for (const record of records) {
      const status = record.status || AttendanceStatus.PRESENT;
      const defaultHours = record.hoursConsumed !== undefined ? record.hoursConsumed : 1;
      const hoursConsumed = calculateHoursConsumed(status, defaultHours);

      const existingAttendance = existingAttendances.find(
        (a: any) => a.studentId === record.studentId
      );

      let attendance: Attendance;
      if (existingAttendance) {
        if (!canTransitionAttendanceStatus(existingAttendance.status, status)) {
          throw new AppError(`学员${record.studentId}当前状态${existingAttendance.status}无法转换为${status}`, 400);
        }

        const oldHours = existingAttendance.status === AttendanceStatus.LEAVE ? 0 : existingAttendance.hoursConsumed;
        const newHours = status === AttendanceStatus.LEAVE ? 0 : hoursConsumed;
        const hoursDiff = newHours - oldHours;

        attendance = await existingAttendance.update({
          status,
          hoursConsumed,
          remark: record.remark,
          checkInTime: record.checkInTime
        }, { transaction });

        if (hoursDiff !== 0) {
          enrollmentUpdates.push({
            studentId: record.studentId,
            hoursDiff
          });
        }
      } else {
        attendance = await Attendance.create({
          classId,
          studentId: record.studentId,
          attendanceDate,
          status,
          hoursConsumed,
          remark: record.remark,
          checkInTime: record.checkInTime
        }, { transaction });

        if (hoursConsumed > 0) {
          enrollmentUpdates.push({
            studentId: record.studentId,
            hoursDiff: hoursConsumed
          });
        }
      }

      attendanceRecords.push(attendance);
    }

    for (const update of enrollmentUpdates) {
      await Enrollment.increment('usedHours', {
        by: update.hoursDiff,
        where: {
          studentId: update.studentId,
          classId
        },
        transaction
      });

      const enrollment = enrollments.find((e: any) => e.studentId === update.studentId);
      if (enrollment) {
        const updatedEnrollment = await Enrollment.findByPk(enrollment.id, { transaction });
        if (updatedEnrollment && updatedEnrollment.usedHours >= classInfo.totalHours) {
          const otherActiveEnrollments = await Enrollment.count({
            where: {
              studentId: enrollment.studentId,
              status: EnrollmentStatus.APPROVED,
              id: { [Op.ne]: enrollment.id }
            },
            transaction
          });

          if (otherActiveEnrollments === 0) {
            await Student.update(
              { status: StudentStatus.SUSPENDED },
              { where: { id: enrollment.studentId }, transaction }
            );
          }
        }
      }
    }

    return attendanceRecords;
  });
};

export const updateAttendance = async (attendanceId: number, data: any) => {
  return withTransaction(async (transaction) => {
    const attendance = await Attendance.findByPk(attendanceId, { transaction });
    if (!attendance) {
      throw new AppError('考勤记录不存在', 404);
    }

    const newStatus = data.status || attendance.status;
    if (newStatus !== attendance.status) {
      if (!canTransitionAttendanceStatus(attendance.status, newStatus)) {
        throw new AppError(`当前状态${attendance.status}无法转换为${newStatus}`, 400);
      }
    }

    const oldHours = attendance.status === AttendanceStatus.LEAVE ? 0 : attendance.hoursConsumed;
    const defaultHours = data.hoursConsumed !== undefined ? data.hoursConsumed : attendance.hoursConsumed;
    const newHoursConsumed = calculateHoursConsumed(newStatus, defaultHours);

    await attendance.update({
      ...data,
      hoursConsumed: newHoursConsumed,
      status: newStatus
    }, { transaction });

    const newHours = newStatus === AttendanceStatus.LEAVE ? 0 : newHoursConsumed;
    const hoursDiff = newHours - oldHours;

    if (hoursDiff !== 0) {
      await Enrollment.increment('usedHours', {
        by: hoursDiff,
        where: {
          studentId: attendance.studentId,
          classId: attendance.classId
        },
        transaction
      });

      const enrollment = await Enrollment.findOne({
        where: {
          studentId: attendance.studentId,
          classId: attendance.classId
        },
        transaction
      });

      const classInfo = await Class.findByPk(attendance.classId, { transaction });
      if (enrollment && classInfo && enrollment.usedHours >= classInfo.totalHours) {
        const otherActiveEnrollments = await Enrollment.count({
          where: {
            studentId: attendance.studentId,
            status: EnrollmentStatus.APPROVED,
            id: { [Op.ne]: enrollment.id }
          },
          transaction
        });

        if (otherActiveEnrollments === 0) {
          await Student.update(
            { status: StudentStatus.SUSPENDED },
            { where: { id: attendance.studentId }, transaction }
          );
        }
      }
    }

    return attendance;
  });
};

export const deleteAttendance = async (attendanceId: number) => {
  return withTransaction(async (transaction) => {
    const attendance = await Attendance.findByPk(attendanceId, { transaction });
    if (!attendance) {
      throw new AppError('考勤记录不存在', 404);
    }

    if (attendance.status !== AttendanceStatus.LEAVE) {
      await Enrollment.decrement('usedHours', {
        by: attendance.hoursConsumed,
        where: {
          studentId: attendance.studentId,
          classId: attendance.classId
        },
        transaction
      });
    }

    await attendance.destroy({ transaction });
    return { message: '删除成功' };
  });
};

export const getClassAttendance = async (classId: number, attendanceDate?: string) => {
  const where: any = { classId };
  if (attendanceDate) {
    where.attendanceDate = attendanceDate;
  }

  const attendances = await Attendance.findAll({
    where,
    include: [Student],
    order: [['attendanceDate', 'DESC'], ['createdAt', 'DESC']]
  });

  return attendances;
};

export const getClassAttendanceStats = async (classId: number, startDate?: string, endDate?: string) => {
  const where: any = { classId };
  if (startDate && endDate) {
    where.attendanceDate = { [Op.between]: [startDate, endDate] };
  }

  const attendances = await Attendance.findAll({ where });

  const stats = {
    total: attendances.length,
    present: attendances.filter(a => a.status === AttendanceStatus.PRESENT).length,
    absent: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length,
    leave: attendances.filter(a => a.status === AttendanceStatus.LEAVE).length,
    late: attendances.filter(a => a.status === AttendanceStatus.LATE).length,
    totalHours: attendances.reduce((sum, a) => sum + Number(a.hoursConsumed), 0)
  };

  return stats;
};

export const getStudentAttendance = async (studentId: number, classId?: number) => {
  const where: any = { studentId };
  if (classId) {
    where.classId = classId;
  }

  const attendances = await Attendance.findAll({
    where,
    include: [Class, Student],
    order: [['attendanceDate', 'DESC']]
  });

  return attendances;
};

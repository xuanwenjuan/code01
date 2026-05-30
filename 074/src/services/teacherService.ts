import { Teacher, TeacherCourse, CourseCategory } from '../models';
import { AppError } from '../middleware/errorHandler';
import { TeacherStatus } from '../types';
import { Op, Transaction } from 'sequelize';
import { withTransaction } from '../utils/transaction';
import sequelize from '../config/database';

export const createTeacher = async (data: any) => {
  return withTransaction(async (transaction) => {
    const { courseIds, ...teacherData } = data;
    
    const existingTeacher = await Teacher.findOne({
      where: { phone: teacherData.phone }
    });
    if (existingTeacher) {
      throw new AppError('该手机号已存在', 400);
    }

    const teacher = await Teacher.create(teacherData, { transaction });

    if (courseIds && courseIds.length > 0) {
      const teacherCourses = courseIds.map((courseId: number) => ({
        teacherId: teacher.id,
        courseId
      }));
      await TeacherCourse.bulkCreate(teacherCourses, { transaction });
    }

    return teacher;
  });
};

export const updateTeacher = async (id: number, data: any) => {
  return withTransaction(async (transaction) => {
    const { courseIds, ...teacherData } = data;
    
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      throw new AppError('教师不存在', 404);
    }

    if (teacherData.phone && teacherData.phone !== teacher.phone) {
      const existingTeacher = await Teacher.findOne({
        where: { phone: teacherData.phone }
      });
      if (existingTeacher) {
        throw new AppError('该手机号已存在', 400);
      }
    }

    await teacher.update(teacherData, { transaction });

    if (courseIds) {
      await TeacherCourse.destroy({
        where: { teacherId: id },
        transaction
      });

      if (courseIds.length > 0) {
        const teacherCourses = courseIds.map((courseId: number) => ({
          teacherId: id,
          courseId
        }));
        await TeacherCourse.bulkCreate(teacherCourses, { transaction });
      }
    }

    return teacher;
  });
};

export const deleteTeacher = async (id: number) => {
  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    throw new AppError('教师不存在', 404);
  }

  await teacher.destroy();
  return { message: '删除成功' };
};

export const getTeacherById = async (id: number) => {
  const teacher = await Teacher.findByPk(id, {
    include: [{
      model: CourseCategory,
      through: { attributes: [] }
    }]
  });
  if (!teacher) {
    throw new AppError('教师不存在', 404);
  }
  return teacher;
};

export const getAllTeachers = async (query: any) => {
  const {
    keyword,
    status,
    courseId,
    dayOfWeek,
    startTime,
    endTime,
    page = 1,
    pageSize = 10
  } = query;

  const where: any = {};

  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
      { email: { [Op.like]: `%${keyword}%` } },
      { qualifications: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (dayOfWeek !== undefined || startTime || endTime) {
    const timeSlotConditions: any[] = [];

    if (dayOfWeek !== undefined) {
      timeSlotConditions.push({
        'availableTimeSlots.dayOfWeek': Number(dayOfWeek)
      });
    }

    if (startTime) {
      timeSlotConditions.push({
        'availableTimeSlots.startTime': {
          [Op.lte]: startTime
        }
      });
    }

    if (endTime) {
      timeSlotConditions.push({
        'availableTimeSlots.endTime': {
          [Op.gte]: endTime
        }
      });
    }

    timeSlotConditions.push({
      'availableTimeSlots.isAvailable': true
    });

    where[Op.and] = [
      sequelize.where(
        sequelize.literal(`EXISTS (
          SELECT 1 FROM json_each(teachers.availableTimeSlots) as slot
          WHERE json_extract(slot.value, '$.isAvailable') = true
          ${dayOfWeek !== undefined ? `AND json_extract(slot.value, '$.dayOfWeek') = ${Number(dayOfWeek)}` : ''}
          ${startTime ? `AND json_extract(slot.value, '$.startTime') <= '${startTime}'` : ''}
          ${endTime ? `AND json_extract(slot.value, '$.endTime') >= '${endTime}'` : ''}
        )`),
        true
      )
    ];
  }

  const include: any[] = [];
  if (courseId) {
    include.push({
      model: CourseCategory,
      through: { attributes: [] },
      where: { id: courseId },
      required: true
    });
  }

  const { count, rows } = await Teacher.findAndCountAll({
    where,
    include,
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

export const getAvailableTeachers = async (query: any) => {
  const { courseId, dayOfWeek, startTime, endTime, page = 1, pageSize = 10 } = query;

  const where: any = {
    status: TeacherStatus.ON_JOB
  };

  if (dayOfWeek !== undefined || startTime || endTime) {
    where[Op.and] = [
      sequelize.where(
        sequelize.literal(`EXISTS (
          SELECT 1 FROM json_each(teachers.availableTimeSlots) as slot
          WHERE json_extract(slot.value, '$.isAvailable') = true
          ${dayOfWeek !== undefined ? `AND json_extract(slot.value, '$.dayOfWeek') = ${Number(dayOfWeek)}` : ''}
          ${startTime ? `AND json_extract(slot.value, '$.startTime') <= '${startTime}'` : ''}
          ${endTime ? `AND json_extract(slot.value, '$.endTime') >= '${endTime}'` : ''}
        )`),
        true
      )
    ];
  }

  const include: any[] = [];
  if (courseId) {
    include.push({
      model: CourseCategory,
      through: { attributes: [] },
      where: { id: courseId },
      required: true
    });
  }

  const { count, rows } = await Teacher.findAndCountAll({
    where,
    include,
    order: [['rating', 'DESC'], ['createdAt', 'DESC']],
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

export const updateStatus = async (id: number, status: TeacherStatus) => {
  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    throw new AppError('教师不存在', 404);
  }

  teacher.status = status;
  await teacher.save();
  return teacher;
};

export const getTeachersWithExpiringQualifications = async (days: number = 30) => {
  const today = new Date();
  const expiryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  const teachers = await Teacher.findAll({
    where: {
      qualificationExpiryDate: {
        [Op.between]: [today, expiryDate]
      },
      status: TeacherStatus.ON_JOB
    },
    order: [['qualificationExpiryDate', 'ASC']]
  });

  return teachers;
};

export const rateTeacher = async (id: number, rating: number) => {
  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    throw new AppError('教师不存在', 404);
  }

  const currentTotal = teacher.rating * teacher.ratingCount;
  const newCount = teacher.ratingCount + 1;
  const newRating = (currentTotal + rating) / newCount;

  teacher.rating = Math.round(newRating * 100) / 100;
  teacher.ratingCount = newCount;
  await teacher.save();

  return teacher;
};

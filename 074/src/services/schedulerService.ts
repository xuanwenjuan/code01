import cron from 'node-cron';
import { Teacher, Class, Enrollment, Attendance } from '../models';
import { TeacherStatus, ClassStatus, EnrollmentStatus } from '../types';
import { Op } from 'sequelize';
import logger from '../config/logger';

export const startSchedulers = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      await checkQualificationExpiry();
      logger.info('资质到期检查完成');
    } catch (error) {
      logger.error('资质到期检查失败:', error);
    }
  });

  cron.schedule('0 1 * * *', async () => {
    try {
      await updateClassStatus();
      logger.info('班级状态更新完成');
    } catch (error) {
      logger.error('班级状态更新失败:', error);
    }
  });

  cron.schedule('0 2 * * 0', async () => {
    try {
      await generateWeeklyReport();
      logger.info('周报生成完成');
    } catch (error) {
      logger.error('周报生成失败:', error);
    }
  });

  console.log('定时任务已启动');
};

export const checkQualificationExpiry = async () => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringTeachers = await Teacher.findAll({
    where: {
      qualificationExpiryDate: {
        [Op.between]: [today, thirtyDaysLater]
      },
      status: TeacherStatus.ON_JOB
    }
  });

  for (const teacher of expiringTeachers) {
    const daysUntilExpiry = Math.ceil(
      (new Date(teacher.qualificationExpiryDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    logger.warn(`教师 ${teacher.name} 的资质将在 ${daysUntilExpiry} 天后到期`);
  }

  return expiringTeachers;
};

export const updateClassStatus = async () => {
  const today = new Date();

  const classesToStart = await Class.findAll({
    where: {
      startDate: { [Op.lte]: today },
      status: ClassStatus.NOT_STARTED
    }
  });

  for (const classInfo of classesToStart) {
    classInfo.status = ClassStatus.IN_PROGRESS;
    await classInfo.save();
    logger.info(`班级 ${classInfo.name} 已自动更新为进行中状态`);
  }

  const classesToComplete = await Class.findAll({
    where: {
      endDate: { [Op.lte]: today },
      status: { [Op.ne]: ClassStatus.COMPLETED }
    }
  });

  for (const classInfo of classesToComplete) {
    classInfo.status = ClassStatus.COMPLETED;
    await classInfo.save();
    logger.info(`班级 ${classInfo.name} 已自动更新为已完成状态`);
  }

  return { started: classesToStart.length, completed: classesToComplete.length };
};

export const generateWeeklyReport = async () => {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalClasses = await Class.count();
  const activeClasses = await Class.count({ where: { status: ClassStatus.IN_PROGRESS } });
  
  const newEnrollments = await Enrollment.count({
    where: {
      createdAt: { [Op.between]: [oneWeekAgo, today] }
    }
  });

  const totalAttendances = await Attendance.count({
    where: {
      attendanceDate: { [Op.between]: [oneWeekAgo, today] }
    }
  });

  const report = {
    period: {
      start: oneWeekAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    },
    stats: {
      totalClasses,
      activeClasses,
      newEnrollments,
      totalAttendances
    }
  };

  logger.info('周报数据:', report);
  return report;
};

import * as cron from 'node-cron';
import { Op } from 'sequelize';
import { Lesson, Attendance, Class, sequelize } from '../models';
import { AttendanceStatus, ClassStatus } from '../types';
import * as dayjs from 'dayjs';

export class TaskService {
  static init() {
    cron.schedule('0 * * * *', async () => {
      console.log('执行定时任务：自动标记缺勤');
      await this.autoMarkAbsentForExpiredLessons();
    });

    cron.schedule('0 2 * * *', async () => {
      console.log('执行定时任务：更新班级状态');
      await this.updateClassStatus();
    });

    console.log('定时任务已启动');
  }

  static async autoMarkAbsentForExpiredLessons() {
    const t = await sequelize.transaction();
    try {
      const now = new Date();
      
      const expiredLessons = await Lesson.findAll({
        where: {
          isCompleted: false,
          [Op.and]: [
            sequelize.literal(`
              CONCAT(DATE_FORMAT(lessonDate, '%Y-%m-%d'), ' ', endTime) <= '${dayjs(now).format('YYYY-MM-DD HH:mm')}'
            `)
          ]
        },
        transaction: t
      });

      for (const lesson of expiredLessons) {
        const [affectedCount] = await Attendance.update(
          { status: AttendanceStatus.ABSENT },
          {
            where: {
              lessonId: lesson.id,
              checkInTime: null,
              status: { [Op.ne]: AttendanceStatus.LEAVE }
            },
            transaction: t
          }
        );

        if (affectedCount > 0) {
          console.log(`课时 ${lesson.id} 自动标记 ${affectedCount} 人为缺勤`);
        }

        await lesson.update({ isCompleted: true }, { transaction: t });
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error('自动标记缺勤任务失败:', error);
    }
  }

  static async updateClassStatus() {
    const t = await sequelize.transaction();
    try {
      const now = new Date();

      const [completedCount] = await Class.update(
        { status: ClassStatus.COMPLETED },
        {
          where: {
            status: { [Op.ne]: ClassStatus.COMPLETED },
            endDate: { [Op.lte]: now }
          },
          transaction: t
        }
      );

      const [inProgressCount] = await Class.update(
        { status: ClassStatus.IN_PROGRESS },
        {
          where: {
            status: ClassStatus.PREPARING,
            startDate: { [Op.lte]: now },
            [Op.or]: [
              { endDate: { [Op.gt]: now } },
              { endDate: null }
            ]
          },
          transaction: t
        }
      );

      await t.commit();

      if (completedCount > 0 || inProgressCount > 0) {
        console.log(`班级状态更新：${completedCount} 个班级已完成，${inProgressCount} 个班级已开课`);
      }
    } catch (error) {
      await t.rollback();
      console.error('更新班级状态任务失败:', error);
    }
  }
}

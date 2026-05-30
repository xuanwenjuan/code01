import cron from 'node-cron';
import { Reservation, ReservationStatus } from '../models/Reservation';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { RoomStatusService } from './roomStatus.service';
import moment from 'moment';

export class TaskSchedulerService {
  private static tasks: Map<string, cron.ScheduledTask> = new Map();

  static init() {
    this.startReservationTimeoutTask();
    this.startRoomLockExpireTask();
    this.startNoShowCheckTask();

    console.log('✅ 定时任务已启动');
  }

  private static startReservationTimeoutTask() {
    const task = cron.schedule('*/5 * * * *', async () => {
      console.log('🔍 检查超时未支付的预订...');
      try {
        await this.cancelTimeoutReservations();
      } catch (error) {
        console.error('❌ 处理超时预订失败:', error);
      }
    });

    this.tasks.set('reservationTimeout', task);
  }

  private static startRoomLockExpireTask() {
    const task = cron.schedule('*/10 * * * *', async () => {
      console.log('🔍 检查超时的房间锁定...');
      try {
        const released = await RoomStatusService.checkAndReleaseExpiredLocks();
        if (released > 0) {
          console.log(`✅ 自动解锁了 ${released} 间客房`);
        }
      } catch (error) {
        console.error('❌ 处理房间锁定超时失败:', error);
      }
    });

    this.tasks.set('roomLockExpire', task);
  }

  private static startNoShowCheckTask() {
    const task = cron.schedule('0 2 * * *', async () => {
      console.log('🔍 检查未到店的预订...');
      try {
        await this.markNoShowReservations();
      } catch (error) {
        console.error('❌ 处理未到店预订失败:', error);
      }
    });

    this.tasks.set('noShowCheck', task);
  }

  static async cancelTimeoutReservations(timeoutMinutes: number = 30): Promise<number> {
    const t = await sequelize.transaction();

    try {
      const timeoutTime = moment().subtract(timeoutMinutes, 'minutes').toDate();

      const timeoutReservations = await Reservation.findAll({
        where: {
          status: ReservationStatus.PENDING,
          deposit: 0,
          createdAt: {
            [Op.lte]: timeoutTime
          }
        },
        transaction: t
      });

      let cancelledCount = 0;

      for (const reservation of timeoutReservations) {
        await reservation.update(
          {
            status: ReservationStatus.CANCELLED,
            remark: `${reservation.remark || ''}\n系统自动取消：超时${timeoutMinutes}分钟未支付`.trim()
          },
          { transaction: t }
        );

        cancelledCount++;
      }

      await t.commit();

      if (cancelledCount > 0) {
        console.log(`✅ 自动取消了 ${cancelledCount} 个超时未支付的预订`);
      }

      return cancelledCount;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async markNoShowReservations(): Promise<number> {
    const t = await sequelize.transaction();

    try {
      const today = moment().startOf('day').toDate();
      const tomorrow = moment().endOf('day').toDate();

      const noShowReservations = await Reservation.findAll({
        where: {
          status: ReservationStatus.CONFIRMED,
          checkInDate: {
            [Op.between]: [today, tomorrow]
          }
        },
        transaction: t
      });

      let markedCount = 0;

      for (const reservation of noShowReservations) {
        const hoursSinceCheckIn = moment().diff(moment(reservation.checkInDate), 'hours');

        if (hoursSinceCheckIn >= 6) {
          await reservation.update(
            {
              status: ReservationStatus.NO_SHOW,
              remark: `${reservation.remark || ''}\n系统自动标记：未到店`.trim()
            },
            { transaction: t }
          );

          markedCount++;
        }
      }

      await t.commit();

      if (markedCount > 0) {
        console.log(`✅ 自动标记了 ${markedCount} 个未到店的预订`);
      }

      return markedCount;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static stopAllTasks() {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`⏹️ 已停止任务: ${name}`);
    });
    this.tasks.clear();
  }

  static getTaskStatus() {
    return Array.from(this.tasks.entries()).map(([name, task]) => ({
      name,
      status: 'running'
    }));
  }
}

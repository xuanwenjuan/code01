import cron from 'node-cron';
import { Reservation, ReservationStatus } from '../models/Reservation';
import { Room, RoomStatus } from '../models/Room';
import moment from 'moment';
import sequelize from '../config/database';
import { Op } from 'sequelize';

export class Scheduler {
  static start() {
    // 每天凌晨0点自动处理过期预订
    cron.schedule('0 0 * * *', async () => {
      console.log('开始执行定时任务：处理过期预订');
      await this.handleExpiredReservations();
    });

    // 每小时检查应离店的订单
    cron.schedule('0 * * * *', async () => {
      console.log('开始执行定时任务：检查应离店订单');
      await this.handleDueCheckOuts();
    });

    console.log('定时任务已启动');
  }

  private static async handleExpiredReservations() {
    try {
      const now = new Date();
      const expiredReservations = await Reservation.findAll({
        where: {
          status: ReservationStatus.CONFIRMED,
          checkInDate: { [Op.lt]: moment().subtract(1, 'day').toDate() }
        }
      });

      for (const reservation of expiredReservations) {
        await reservation.update({
          status: ReservationStatus.NO_SHOW,
          remark: `${reservation.remark || ''}\n系统自动标记为未到店`.trim()
        });
        console.log(`预订 ${reservation.orderNo} 已自动标记为未到店`);
      }
    } catch (error) {
      console.error('处理过期预订失败:', error);
    }
  }

  private static async handleDueCheckOuts() {
    try {
      const now = new Date();
      const dueReservations = await Reservation.findAll({
        where: {
          status: ReservationStatus.CHECKED_IN,
          checkOutDate: { [Op.lt]: now }
        },
        include: [{ model: Room, as: 'room' }]
      });

      console.log(`发现 ${dueReservations.length} 个逾期未退房订单`);
    } catch (error) {
      console.error('检查应离店订单失败:', error);
    }
  }
}

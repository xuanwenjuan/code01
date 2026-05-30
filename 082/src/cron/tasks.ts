import cron from 'node-cron';
import { Order, OrderStatusLog, Room } from '../models';
import { OrderStatus, RoomStatus } from '../constants';
import sequelize from '../config/database';
import { Op } from 'sequelize';

const ORDER_TIMEOUT_MINUTES = 30;

export const closeExpiredOrders = async () => {
  const t = await sequelize.transaction();
  try {
    const timeoutDate = new Date(Date.now() - ORDER_TIMEOUT_MINUTES * 60 * 1000);
    const expiredOrders = await Order.findAll({
      where: { status: OrderStatus.PENDING_PAYMENT, createdAt: { [Op.lte]: timeoutDate } },
      transaction: t
    });
    for (const order of expiredOrders) {
      await order.update({ status: OrderStatus.CLOSED }, { transaction: t });
      await OrderStatusLog.create({
        orderId: order.id,
        orderNo: order.orderNo,
        previousStatus: OrderStatus.PENDING_PAYMENT,
        currentStatus: OrderStatus.CLOSED,
        remark: '超时未支付自动关闭'
      }, { transaction: t });
      const room = await Room.findByPk(order.roomId, { transaction: t });
      if (room && room.status === RoomStatus.LOCKED) {
        room.status = RoomStatus.VACANT;
        await room.save({ transaction: t });
      }
    }
    await t.commit();
    if (expiredOrders.length > 0) {
      console.log(`[${new Date().toISOString()}] 已自动关闭 ${expiredOrders.length} 个超时订单`);
    }
  } catch (error) {
    await t.rollback();
    console.error('关闭超时订单失败:', error);
  }
};

export const autoCheckoutExpiredBookings = async () => {
  const t = await sequelize.transaction();
  try {
    const now = new Date();
    const expiredOrders = await Order.findAll({
      where: {
        status: OrderStatus.CHECKED_IN,
        checkOutDate: { [Op.lte]: now }
      },
      transaction: t
    });
    for (const order of expiredOrders) {
      order.status = OrderStatus.CHECKED_OUT;
      order.checkOutTime = now;
      await order.save({ transaction: t });
      await OrderStatusLog.create({
        orderId: order.id,
        orderNo: order.orderNo,
        previousStatus: OrderStatus.CHECKED_IN,
        currentStatus: OrderStatus.CHECKED_OUT,
        remark: '系统自动退房'
      }, { transaction: t });
      const room = await Room.findByPk(order.roomId, { transaction: t });
      if (room) {
        room.status = RoomStatus.VACANT;
        await room.save({ transaction: t });
      }
    }
    await t.commit();
    if (expiredOrders.length > 0) {
      console.log(`[${new Date().toISOString()}] 已自动退房 ${expiredOrders.length} 个订单`);
    }
  } catch (error) {
    await t.rollback();
    console.error('自动退房失败:', error);
  }
};

export const generateDailyRevenueReport = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfDay = new Date(yesterday);
    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);
    const checkedOutOrders = await Order.findAll({
      where: {
        status: OrderStatus.CHECKED_OUT,
        checkOutTime: { [Op.between]: [startOfDay, endOfDay] }
      }
    });
    const totalRevenue = checkedOutOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const extraRevenue = checkedOutOrders.reduce((sum, order) => sum + Number(order.extraAmount || 0), 0);
    console.log(`[${new Date().toISOString()}] 昨日营收报表 - 订单数: ${checkedOutOrders.length}, 总营收: ${totalRevenue.toFixed(2)}, 额外消费: ${extraRevenue.toFixed(2)}`);
  } catch (error) {
    console.error('生成日报失败:', error);
  }
};

export const initCronTasks = () => {
  cron.schedule('*/5 * * * *', closeExpiredOrders);
  console.log('[定时任务] 订单超时检查已启动 (每5分钟)');
  cron.schedule('0 12 * * *', autoCheckoutExpiredBookings);
  console.log('[定时任务] 自动退房已启动 (每天中午12点)');
  cron.schedule('0 1 * * *', generateDailyRevenueReport);
  console.log('[定时任务] 日报生成已启动 (每天凌晨1点)');
};

export default { initCronTasks, closeExpiredOrders, autoCheckoutExpiredBookings };

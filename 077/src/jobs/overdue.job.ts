import { sequelize } from '../database';
import RentalOrder from '../database/models/RentalOrder.model';
import OrderLog from '../database/models/OrderLog.model';
import { EquipmentStatus, OrderStatus, LogModule } from '../types';
import { calculateOverduePenalty } from '../controllers/order.controller';

export const checkOverdueOrders = async () => {
  try {
    console.log(`[定时任务] 开始检查逾期订单 - ${new Date().toISOString()}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await RentalOrder.findAll({
      where: {
        status: OrderStatus.IN_USE,
        endDate: {
          [sequelize.Op.lt]: today
        }
      }
    });

    console.log(`[定时任务] 发现 ${orders.length} 个逾期订单`);

    for (const order of orders) {
      try {
        await sequelize.transaction(async (t) => {
          const { days: overdueDays, amount: overdueAmount } = calculateOverduePenalty(
            today,
            order.endDate,
            Number(order.unitPrice)
          );

          await order.update({
            status: OrderStatus.OVERDUE,
            overdueDays,
            overdueAmount
          }, { transaction: t });

          await OrderLog.create({
            orderId: order.id,
            action: 'overdue',
            oldStatus: OrderStatus.IN_USE,
            newStatus: OrderStatus.OVERDUE,
            description: `订单逾期，逾期 ${overdueDays} 天，罚金 ${overdueAmount} 元`
          }, { transaction: t });

          console.log(`[定时任务] 订单 ${order.orderNo} 已标记为逾期`);
        });
      } catch (error) {
        console.error(`[定时任务] 处理订单 ${order.orderNo} 失败:`, error);
      }
    }

    console.log(`[定时任务] 逾期订单检查完成 - ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[定时任务] 检查逾期订单失败:', error);
  }
};

export const checkPendingPaymentOrders = async () => {
  try {
    console.log(`[定时任务] 开始检查超时未支付订单 - ${new Date().toISOString()}`);

    const timeoutThreshold = new Date();
    timeoutThreshold.setHours(timeoutThreshold.getHours() - 24);

    const orders = await RentalOrder.findAll({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: {
          [sequelize.Op.lt]: timeoutThreshold
        }
      }
    });

    console.log(`[定时任务] 发现 ${orders.length} 个超时未支付订单`);

    for (const order of orders) {
      try {
        await sequelize.transaction(async (t) => {
          const oldStatus = order.status;

          await order.update({
            status: OrderStatus.CANCELLED
          }, { transaction: t });

          await OrderLog.create({
            orderId: order.id,
            action: 'auto_cancel',
            oldStatus,
            newStatus: OrderStatus.CANCELLED,
            description: '订单超时24小时未支付，自动取消'
          }, { transaction: t });

          console.log(`[定时任务] 订单 ${order.orderNo} 已自动取消`);
        });
      } catch (error) {
        console.error(`[定时任务] 处理订单 ${order.orderNo} 失败:`, error);
      }
    }

    console.log(`[定时任务] 超时未支付订单检查完成 - ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[定时任务] 检查超时未支付订单失败:', error);
  }
};

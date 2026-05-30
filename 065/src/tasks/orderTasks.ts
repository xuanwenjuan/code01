import cron from 'node-cron';
import { Order, OrderStatusLog, AuntProfile, ServiceCategory } from '../models';
import { OrderStatus, AuntStatus } from '../types';
import { OperationLogger } from '../utils/operationLogger';
import { sequelize } from '../database';
import { Op, QueryTypes } from 'sequelize';

export const processExpiredOrders = async () => {
  console.log('[定时任务] 开始处理超时未支付订单...');

  try {
    const expiredOrders = await Order.findAll({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        expireTime: {
          [Op.lt]: new Date(),
        },
      },
    });

    for (const order of expiredOrders) {
      const oldStatus = order.status;
      await order.update({ status: OrderStatus.EXPIRED });

      await OrderStatusLog.create({
        orderId: order.id,
        oldStatus,
        newStatus: OrderStatus.EXPIRED,
        operatorId: 0,
        operatorRole: 'system',
        remark: '系统自动超时取消',
      });

      console.log(`[定时任务] 订单 ${order.orderNo} 已超时取消`);
    }

    console.log(`[定时任务] 本次共处理 ${expiredOrders.length} 个超时未支付订单`);
  } catch (error) {
    console.error('[定时任务] 处理超时订单失败:', error);
  }
};

export const processAutoCompleteOrders = async () => {
  console.log('[定时任务] 开始处理自动完成订单...');

  try {
    const serviceEndTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ordersToComplete = await Order.findAll({
      where: {
        status: OrderStatus.IN_SERVICE,
        serviceTime: {
          [Op.lt]: serviceEndTime,
        },
      },
    });

    for (const order of ordersToComplete) {
      const oldStatus = order.status;
      await order.update({
        status: OrderStatus.COMPLETED,
        completeTime: new Date(),
      });

      await OrderStatusLog.create({
        orderId: order.id,
        oldStatus,
        newStatus: OrderStatus.COMPLETED,
        operatorId: 0,
        operatorRole: 'system',
        remark: '系统自动完成订单',
      });

      if (order.auntId) {
        await AuntProfile.increment('orderCount', { where: { id: order.auntId } });
      }

      console.log(`[定时任务] 订单 ${order.orderNo} 已自动完成`);
    }

    console.log(`[定时任务] 本次共处理 ${ordersToComplete.length} 个自动完成订单`);
  } catch (error) {
    console.error('[定时任务] 处理自动完成订单失败:', error);
  }
};

export const processAutoCancelDispatchedOrders = async () => {
  console.log('[定时任务] 开始处理超时未接单订单...');

  try {
    const expireTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const ordersToCancel = await Order.findAll({
      where: {
        status: OrderStatus.DISPATCHED,
        createdAt: {
          [Op.lt]: expireTime,
        },
      },
    });

    for (const order of ordersToCancel) {
      const oldStatus = order.status;
      await order.update({ status: OrderStatus.CANCELLED });

      await OrderStatusLog.create({
        orderId: order.id,
        oldStatus,
        newStatus: OrderStatus.CANCELLED,
        operatorId: 0,
        operatorRole: 'system',
        remark: '阿姨超时未接单，系统自动取消',
      });

      console.log(`[定时任务] 订单 ${order.orderNo} 因超时未接单已自动取消`);
    }

    console.log(`[定时任务] 本次共处理 ${ordersToCancel.length} 个超时未接单订单`);
  } catch (error) {
    console.error('[定时任务] 处理超时未接单订单失败:', error);
  }
};

export const processAutoRedispatchOrders = async () => {
  console.log('[定时任务] 开始处理超时自动重新派单...');

  const transaction = await sequelize.transaction();

  try {
    const expireTime = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const ordersToRedispatch = await Order.findAll({
      where: {
        status: OrderStatus.DISPATCHED,
        createdAt: {
          [Op.lt]: expireTime,
        },
      },
      include: [
        { model: ServiceCategory, as: 'category' },
      ],
      transaction,
    });

    let redispatchedCount = 0;

    for (const order of ordersToRedispatch) {
      try {
        const availableAunts = await AuntProfile.findAll({
          where: {
            status: AuntStatus.ACTIVE,
            id: { [Op.ne]: order.auntId },
          },
          transaction,
        });

        const categorySkills = order.category?.name ? [order.category.name] : [];
        const matchedAunts = availableAunts.filter(aunt => {
          const auntSkills = typeof aunt.skills === 'string' ? JSON.parse(aunt.skills) : aunt.skills;
          return categorySkills.some(skill => auntSkills.includes(skill));
        });

        if (matchedAunts.length > 0) {
          const newAunt = matchedAunts[Math.floor(Math.random() * matchedAunts.length)];

          const oldStatus = order.status;
          await order.update(
            {
              auntId: newAunt.id,
              status: OrderStatus.REDISPATCHING,
            },
            { transaction }
          );

          await OrderStatusLog.create(
            {
              orderId: order.id,
              oldStatus,
              newStatus: OrderStatus.REDISPATCHING,
              operatorId: 0,
              operatorRole: 'system',
              remark: `系统自动重新派单，新阿姨: ${newAunt.realName}`,
            },
            { transaction }
          );

          await order.update(
            { status: OrderStatus.DISPATCHED },
            { transaction }
          );

          await OrderStatusLog.create(
            {
              orderId: order.id,
              oldStatus: OrderStatus.REDISPATCHING,
              newStatus: OrderStatus.DISPATCHED,
              operatorId: 0,
              operatorRole: 'system',
              remark: '重新派单完成',
            },
            { transaction }
          );

          redispatchedCount++;
          console.log(`[定时任务] 订单 ${order.orderNo} 已重新派单给阿姨 ${newAunt.realName}`);
        } else {
          console.log(`[定时任务] 订单 ${order.orderNo} 没有找到合适的阿姨进行重新派单`);
        }
      } catch (orderError) {
        console.error(`[定时任务] 重新派单订单 ${order.orderNo} 失败:`, orderError);
        continue;
      }
    }

    await transaction.commit();
    console.log(`[定时任务] 本次共重新派单 ${redispatchedCount} 个订单`);
  } catch (error) {
    await transaction.rollback();
    console.error('[定时任务] 处理超时自动重新派单失败:', error);
  }
};

export const startOrderTasks = () => {
  cron.schedule('*/5 * * * *', () => {
    processExpiredOrders();
  });

  cron.schedule('0 * * * *', () => {
    processAutoCompleteOrders();
  });

  cron.schedule('15 * * * *', () => {
    processAutoRedispatchOrders();
  });

  cron.schedule('30 * * * *', () => {
    processAutoCancelDispatchedOrders();
  });

  console.log('订单定时任务已启动');
  console.log('  - 超时未支付订单检查: 每5分钟');
  console.log('  - 自动完成订单检查: 每小时');
  console.log('  - 超时自动重新派单: 每小时15分');
  console.log('  - 超时未接单订单检查: 每小时30分');
};

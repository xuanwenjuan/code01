import cron from 'node-cron';
import { Op } from 'sequelize';
import { Order, OrderStatusLog, sequelize } from '../models';
import { OrderStatus } from '../types';

export const startTaskScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[定时任务] 检查超时未支付订单...');
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const pendingOrders = await Order.findAll({
        where: {
          status: OrderStatus.PENDING_PAYMENT,
          createdAt: { [Op.lte]: thirtyMinutesAgo }
        }
      });

      for (const order of pendingOrders) {
        await order.update({
          status: OrderStatus.TIMEOUT_CLOSED,
          cancelledAt: new Date()
        });

        await OrderStatusLog.create({
          orderId: order.id,
          orderNo: order.orderNo,
          fromStatus: OrderStatus.PENDING_PAYMENT,
          toStatus: OrderStatus.TIMEOUT_CLOSED,
          remark: '订单超时未支付，自动关闭'
        });

        console.log(`[定时任务] 订单 ${order.orderNo} 已自动关闭`);
      }
    } catch (error) {
      console.error('[定时任务] 处理超时订单失败:', error);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    console.log('[定时任务] 检查过期预约订单...');
    try {
      const now = new Date();
      
      const expiredOrders = await Order.findAll({
        where: {
          status: { [Op.in]: [OrderStatus.PAID, OrderStatus.MAKING, OrderStatus.READY] },
          deliveryTime: { [Op.lte]: now }
        }
      });

      for (const order of expiredOrders) {
        const oldStatus = order.status;
        
        await order.update({
          status: OrderStatus.TIMEOUT_CLOSED,
          cancelledAt: new Date()
        });

        await OrderStatusLog.create({
          orderId: order.id,
          orderNo: order.orderNo,
          fromStatus: oldStatus,
          toStatus: OrderStatus.TIMEOUT_CLOSED,
          remark: `预约时间已过，订单自动作废。原状态: ${oldStatus}`
        });

        console.log(`[定时任务] 预约订单 ${order.orderNo} 已自动作废`);
      }
    } catch (error) {
      console.error('[定时任务] 处理过期预约订单失败:', error);
    }
  });

  cron.schedule('0 3 * * *', async () => {
    console.log('[定时任务] 自动生成昨日销售报表...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const sequelize = require('../config/database').default;
      const SalesReport = require('../models/SalesReport').default;

      const stores = await require('../models/Store').default.findAll({
        where: { status: 'active' }
      });

      for (const store of stores) {
        const orders = await Order.findAll({
          where: {
            storeId: store.id,
            status: OrderStatus.COMPLETED,
            completedAt: {
              [Op.gte]: yesterday,
              [Op.lt]: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        });

        const totalSales = orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
        const orderCount = orders.length;

        const existingReport = await SalesReport.findOne({
          where: {
            storeId: store.id,
            reportDate: yesterday
          }
        });

        if (existingReport) {
          await existingReport.update({
            orderCount,
            totalSales,
            materialCost: totalSales * 0.3,
            netProfit: totalSales * 0.7
          });
        } else {
          await SalesReport.create({
            storeId: store.id,
            reportDate: yesterday,
            orderCount,
            totalSales,
            materialCost: totalSales * 0.3,
            netProfit: totalSales * 0.7
          });
        }
      }

      console.log('[定时任务] 昨日销售报表生成完成');
    } catch (error) {
      console.error('[定时任务] 生成销售报表失败:', error);
    }
  });

  console.log('✅ 定时任务调度器已启动');
};

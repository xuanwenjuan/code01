import schedule from 'node-schedule';
import { Order, User, OrderLog, Material } from '../models';
import { OrderStatus, MaterialStatus } from '../types';
import { Op } from 'sequelize';
import logger from '../config/logger';
import dotenv from 'dotenv';

dotenv.config();

export const initScheduler = () => {
  const timeoutMinutes = parseInt(process.env.ORDER_TIMEOUT_MINUTES || '30');

  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      logger.info('执行订单超时检查任务');

      const timeoutTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      const expiredOrders = await Order.findAll({
        where: {
          status: OrderStatus.PENDING_PAYMENT,
          createdAt: { [Op.lte]: timeoutTime },
        },
      });

      for (const order of expiredOrders) {
        await order.update({ status: OrderStatus.EXPIRED });

        const systemUser = await User.findOne({ where: { role: 'admin' } });
        await OrderLog.create({
          orderId: order.id,
          operatorId: systemUser?.id || 1,
          operatorName: '系统',
          previousStatus: OrderStatus.PENDING_PAYMENT,
          newStatus: OrderStatus.EXPIRED,
          action: '订单超时自动取消',
        });

        logger.info(`订单 ${order.orderNo} 已超时自动取消`);
      }
    } catch (error) {
      logger.error('订单超时检查任务执行失败:', error);
    }
  });

  schedule.scheduleJob('0 9 * * *', async () => {
    try {
      logger.info('执行库存预警检查任务');

      const lowStockMaterials = await Material.findAll({
        where: {
          status: { [Op.in]: [MaterialStatus.LOW_STOCK, MaterialStatus.OUT_OF_STOCK] },
        },
      });

      if (lowStockMaterials.length > 0) {
        logger.warn(`发现 ${lowStockMaterials.length} 个库存预警材料:`,
          lowStockMaterials.map((m: any) => `${m.name}(${m.batchNo}): ${m.stockQuantity}`).join(', ')
        );
      }
    } catch (error) {
      logger.error('库存预警检查任务执行失败:', error);
    }
  });

  logger.info('定时任务已启动');
};
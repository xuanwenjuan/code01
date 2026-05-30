import cron from 'node-cron';
import { OrderService } from '../services/orderService';
import logger from '../config/logger';

export const startScheduler = (): void => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('开始执行超时订单关闭任务');
      const closedCount = await OrderService.closeExpiredOrders();
      logger.info(`超时订单关闭任务执行完成，共关闭 ${closedCount} 个订单`);
    } catch (error) {
      logger.error('执行超时订单关闭任务失败:', error);
    }
  });

  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('开始执行每日库存预警检查任务');
    } catch (error) {
      logger.error('执行每日库存预警检查任务失败:', error);
    }
  });

  logger.info('定时任务调度器已启动');
};

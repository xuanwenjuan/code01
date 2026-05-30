import cron from 'node-cron';
import orderService from '../services/order.service';
import workerService from '../services/worker.service';
import { Logger } from './logger';

export const initScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      Logger.info('开始执行超时订单检查');
      const results = await orderService.processTimeoutOrders(30);
      Logger.info(`超时订单处理完成，处理了 ${results.length} 个订单`);
    } catch (error) {
      Logger.error('执行超时订单检查失败', error);
    }
  });

  cron.schedule('0 9 * * *', async () => {
    try {
      Logger.info('开始检查即将到期的健康证');
      const expiringWorkers = await workerService.getExpiringCertificates(7);
      if (expiringWorkers.length > 0) {
        Logger.info(`发现 ${expiringWorkers.length} 位师傅的健康证即将到期`);
      }
    } catch (error) {
      Logger.error('检查即将到期的健康证失败', error);
    }
  });

  Logger.info('定时任务已启动');
};

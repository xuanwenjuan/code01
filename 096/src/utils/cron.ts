import cron from 'node-cron';
import WorkOrderService from '../services/WorkOrderService';
import logger from '../config/logger';

export const initCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('开始执行超时报价工单挂起任务...');
      const result = await WorkOrderService.autoSuspendExpiredQuotations();
      if (result.suspendedCount > 0) {
        logger.info(`已将 ${result.suspendedCount} 个超时报价工单挂起`);
      }
    } catch (error) {
      logger.error('执行超时报价工单挂起任务失败:', error);
    }
  });

  logger.info('定时任务已初始化');
};
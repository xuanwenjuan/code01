import cron from 'node-cron';
import { RentalOrderService } from '../services/RentalOrderService';
import { Logger } from '../utils/logger';

export const startScheduler = (): void => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      Logger.info('开始处理逾期订单...');
      await RentalOrderService.processOverdueOrders();
      Logger.info('逾期订单处理完成');
    } catch (error) {
      Logger.error('处理逾期订单失败', error);
    }
  });

  Logger.info('定时任务已启动');
};

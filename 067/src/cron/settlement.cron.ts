import cron from 'node-cron';
import settlementService from '../services/settlement.service';
import logger from '../config/logger';
import moment from 'moment';

export const setupCronJobs = () => {
  // 每天凌晨2点自动生成前一天的结算单
  cron.schedule('0 2 * * *', async () => {
    try {
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
      logger.info(`开始自动生成 ${yesterday} 的日结算单`);
      await settlementService.generateDailySettlement(yesterday);
      logger.info(`自动生成 ${yesterday} 的日结算单完成`);
    } catch (error) {
      logger.error('自动生成日结算单失败:', error);
    }
  });

  logger.info('定时任务已启动');
};

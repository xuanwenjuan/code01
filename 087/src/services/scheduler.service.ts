import cron from 'node-cron';
import inspectionWorkOrderService from './inspectionWorkOrder.service';
import logger from '../utils/logger';

class SchedulerService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  start() {
    this.checkOverdueOrders();
    logger.info('定时任务服务已启动');
  }

  private checkOverdueOrders() {
    const task = cron.schedule('0 0 * * *', async () => {
      logger.info('开始执行：检查超时工单');
      try {
        await inspectionWorkOrderService.markOverdueOrders();
        logger.info('检查超时工单完成');
      } catch (error) {
        logger.error('检查超时工单失败:', error);
      }
    });

    this.tasks.set('checkOverdueOrders', task);
  }

  stop() {
    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`定时任务 ${name} 已停止`);
    });
    this.tasks.clear();
  }
}

export default new SchedulerService();

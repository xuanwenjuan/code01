import cron from 'node-cron';
import { Op } from 'sequelize';
import WorkOrder from '../models/WorkOrder';
import logger from './logger';
import dayjs from 'dayjs';
import { WorkOrderStatus } from '../constants';

export const startScheduler = () => {
  logger.info('定时任务启动...');

  cron.schedule('0 0 * * *', async () => {
    logger.info('执行超时工单检查任务');
    try {
      const now = new Date();
      const pendingOrders = await WorkOrder.findAll({
        where: {
          status: { [Op.notIn]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.SUSPENDED] },
          estimatedEndDate: { [Op.lt]: now },
          isOverdue: false,
        },
      });

      for (const order of pendingOrders) {
        const overdueDays = dayjs(now).diff(dayjs(order.estimatedEndDate), 'day');
        await order.update({ isOverdue: true });
        logger.info(`工单 ${order.orderNo} 已标记为逾期，逾期 ${overdueDays} 天`);
      }

      logger.info(`共处理 ${pendingOrders.length} 个逾期工单`);
    } catch (error) {
      logger.error('超时工单检查任务执行失败:', error);
    }
  });

  cron.schedule('0 1 * * *', async () => {
    logger.info('执行工单自动搁置任务');
    try {
      const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();
      const pendingOrders = await WorkOrder.findAll({
        where: {
          status: WorkOrderStatus.PENDING,
          createdAt: { [Op.lt]: sevenDaysAgo },
        },
      });

      for (const order of pendingOrders) {
        await order.update({ status: WorkOrderStatus.SUSPENDED });
        logger.info(`工单 ${order.orderNo} 已自动搁置（创建超过7天未启动）`);
      }

      logger.info(`共自动搁置 ${pendingOrders.length} 个工单`);
    } catch (error) {
      logger.error('工单自动搁置任务执行失败:', error);
    }
  });

  logger.info('定时任务已全部启动');
};

export default startScheduler;

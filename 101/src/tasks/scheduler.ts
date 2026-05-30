import cron from 'node-cron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import WorkOrder from '../models/WorkOrder.model';
import Pigeon from '../models/Pigeon.model';
import { WorkOrderStatus, PigeonStatus } from '../constants/enum';
import logger from '../utils/logger';

export const startScheduler = () => {
  logger.info('定时任务调度器已启动');

  // 每天凌晨 00:00 执行 - 自动取消超时未确认的工单
  cron.schedule('0 0 0 * * *', async () => {
    logger.info('执行每日定时任务：自动取消超时工单');
    try {
      const threeDaysAgo = dayjs().subtract(3, 'day').toDate();

      const pendingWorkOrders = await WorkOrder.findAll({
        where: {
          status: WorkOrderStatus.PENDING,
          createdAt: {
            [Op.lt]: threeDaysAgo
          }
        }
      });

      if (pendingWorkOrders.length > 0) {
        const idsToCancel = pendingWorkOrders.map(w => w.id);
        
        await WorkOrder.update(
          { status: WorkOrderStatus.CANCELLED },
          { where: { id: { [Op.in]: idsToCancel } } }
        );

        logger.info(`已自动取消 ${idsToCancel.length} 个超时工单: ${idsToCancel.join(', ')}`);
      } else {
        logger.info('没有需要自动取消的超时工单');
      }
    } catch (error) {
      logger.error('自动取消超时工单失败:', error);
    }
  });

  // 每天凌晨 00:30 执行 - 检查并更新异常工单
  cron.schedule('0 30 0 * * *', async () => {
    logger.info('执行每日定时任务：检查异常工单');
    try {
      const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();
      
      const stuckWorkOrders = await WorkOrder.findAll({
        where: {
          status: WorkOrderStatus.IN_PROGRESS,
          actualStartDate: {
            [Op.lt]: sevenDaysAgo
          }
        }
      });

      if (stuckWorkOrders.length > 0) {
        for (const workOrder of stuckWorkOrders) {
          const pigeonIds = JSON.parse(workOrder.pigeonIds || '[]');
          if (pigeonIds.length > 0) {
            await Pigeon.update(
              { status: PigeonStatus.IN_LOFT },
              { where: { id: { [Op.in]: pigeonIds } } }
            );
          }
          
          await workOrder.update({
            status: WorkOrderStatus.CANCELLED,
            remarks: `${workOrder.remarks || ''}\n[系统自动取消] 工单执行超过7天未完成，已自动取消并恢复赛鸽状态`
          });
        }
        
        logger.info(`已自动取消并恢复 ${stuckWorkOrders.length} 个异常工单`);
      }
    } catch (error) {
      logger.error('检查异常工单失败:', error);
    }
  });

  logger.info('定时任务已注册：工单超时自动取消（每日00:00）、异常工单检查（每日00:30）');
};

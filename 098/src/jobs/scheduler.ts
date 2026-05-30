import cron from 'node-cron';
import { WorkOrder, Plant, Material, sequelize } from '../models';
import { WorkOrderStatus } from '../types';
import { Op } from 'sequelize';
import dayjs from 'dayjs';

export const startScheduler = () => {
  console.log('定时任务已启动');

  // 每天凌晨0点检查超期工单
  cron.schedule('0 0 * * *', async () => {
    console.log('[定时任务] 开始检查超期工单...');
    try {
      const overdueOrders = await WorkOrder.findAll({
        where: {
          status: {
            [Op.in]: [
              WorkOrderStatus.PENDING,
              WorkOrderStatus.ASSIGNED,
              WorkOrderStatus.ACCEPTED,
              WorkOrderStatus.IN_PROGRESS
            ]
          },
          dueDate: {
            [Op.lt]: dayjs().toDate()
          }
        }
      });

      for (const order of overdueOrders) {
        if (order.status !== WorkOrderStatus.OVERDUE) {
          await order.update({ status: WorkOrderStatus.OVERDUE });
          console.log(`工单 ${order.orderNo} 已标记为超期`);
        }
      }

      console.log(`[定时任务] 共处理 ${overdueOrders.length} 个超期工单`);
    } catch (error) {
      console.error('[定时任务] 检查超期工单失败:', error);
    }
  });

  // 每天凌晨1点检查需要养护的绿植
  cron.schedule('0 1 * * *', async () => {
    console.log('[定时任务] 开始检查需要养护的绿植...');
    try {
      const plantsNeedingMaintenance = await Plant.findAll({
        where: {
          nextMaintenanceDate: {
            [Op.lte]: dayjs().add(3, 'day').toDate()
          },
          isActive: true
        }
      });

      console.log(`[定时任务] 发现 ${plantsNeedingMaintenance.length} 株绿植需要在3天内养护`);
    } catch (error) {
      console.error('[定时任务] 检查养护计划失败:', error);
    }
  });

  // 每小时检查库存预警
  cron.schedule('0 * * * *', async () => {
    console.log('[定时任务] 检查库存预警...');
    try {
      const lowStockMaterials = await Material.count({
        where: {
          isActive: true,
          quantity: { [Op.lte]: sequelize.col('threshold') }
        }
      });
      console.log(`[定时任务] 有 ${lowStockMaterials} 种物资库存低于预警值`);
    } catch (error) {
      console.error('[定时任务] 检查库存预警失败:', error);
    }
  });
};

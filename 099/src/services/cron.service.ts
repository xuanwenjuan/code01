import cron from 'node-cron';
import { logger } from '../utils/logger';
import { forageApplicationService } from './application.service';
import { costService } from './cost.service';
import { sequelize, ForageApplication, ApplicationItem, ForageInventory } from '../models';
import { ApplicationStatus } from '../constants';
import dayjs from 'dayjs';
import { Op } from 'sequelize';

export const setupCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('[定时任务] 开始处理过期申领单');
      const expiredCount = await forageApplicationService.expireOverdueApplications();
      logger.info(`[定时任务] 处理了 ${expiredCount} 个过期申领单`);
    } catch (error) {
      logger.error('[定时任务] 处理过期申领单失败:', error);
    }
  });

  cron.schedule('0 1 * * *', async () => {
    try {
      logger.info('[定时任务] 开始生成每日成本报告');
      await costService.generateDailyReport();
      logger.info('[定时任务] 每日成本报告生成完成');
    } catch (error) {
      logger.error('[定时任务] 生成每日成本报告失败:', error);
    }
  });

  cron.schedule('0 2 1 * *', async () => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      logger.info(`[定时任务] 开始生成 ${lastMonth.getFullYear()}年${lastMonth.getMonth() + 1}月成本报告`);
      await costService.generateMonthlyReport(lastMonth.getFullYear(), lastMonth.getMonth() + 1);
      logger.info('[定时任务] 月度成本报告生成完成');
    } catch (error) {
      logger.error('[定时任务] 生成月度成本报告失败:', error);
    }
  });

  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('[定时任务] 开始清理已完成的申领单预留库存');
      const completedApps = await ForageApplication.findAll({
        where: {
          status: ApplicationStatus.COMPLETED,
          updatedAt: {
            [Op.lt]: dayjs().subtract(7, 'day').toDate()
          }
        }
      });

      for (const app of completedApps) {
        const items = await ApplicationItem.findAll({
          where: { applicationId: app.id }
        });

        const t = await sequelize.transaction();
        try {
          for (const item of items) {
            const inventory = await ForageInventory.findOne({
              where: { categoryId: item.categoryId },
              transaction: t
            });

            if (inventory && (item.approvedQuantity || 0) > 0) {
              await inventory.update({
                reservedQuantity: Math.max(0, (inventory.reservedQuantity || 0) - (item.approvedQuantity || 0))
              }, { transaction: t });
            }
          }
          await t.commit();
        } catch (error) {
          await t.rollback();
          throw error;
        }
      }

      logger.info(`[定时任务] 清理了 ${completedApps.length} 个申领单的预留库存`);
    } catch (error) {
      logger.error('[定时任务] 清理预留库存失败:', error);
    }
  });

  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('[定时任务] 开始检查即将到期的申领单');
      const upcomingDeadline = dayjs().add(6, 'hour').toDate();
      
      const pendingApps = await ForageApplication.findAll({
        where: {
          status: ApplicationStatus.PENDING,
          expireAt: {
            [Op.lt]: upcomingDeadline,
            [Op.gt]: new Date()
          }
        },
        include: [{ model: ForageApplication.associations.stable }]
      });

      for (const app of pendingApps) {
        const hoursLeft = Math.ceil(dayjs(app.expireAt).diff(dayjs(), 'hour'));
        logger.warn(`[申领单提醒] 申领单 ${app.id} (马舍: ${app.stable?.name}) 将于 ${hoursLeft} 小时后过期，请及时审批`);
      }

      logger.info(`[定时任务] 检查到 ${pendingApps.length} 个即将到期的申领单`);
    } catch (error) {
      logger.error('[定时任务] 检查即将到期申领单失败:', error);
    }
  });

  cron.schedule('0 4 * * *', async () => {
    try {
      logger.info('[定时任务] 开始清理作废申领单的预留库存');
      
      const cancelledApps = await ForageApplication.findAll({
        where: {
          status: ApplicationStatus.CANCELLED,
          updatedAt: {
            [Op.lt]: dayjs().subtract(1, 'day').toDate()
          }
        }
      });

      for (const app of cancelledApps) {
        const items = await ApplicationItem.findAll({
          where: { applicationId: app.id }
        });

        const t = await sequelize.transaction();
        try {
          for (const item of items) {
            if (item.approvedQuantity && item.approvedQuantity > 0) {
              const inventory = await ForageInventory.findOne({
                where: { categoryId: item.categoryId },
                transaction: t
              });

              if (inventory) {
                await inventory.update({
                  reservedQuantity: Math.max(0, (inventory.reservedQuantity || 0) - item.approvedQuantity)
                }, { transaction: t });
              }
            }
          }
          await t.commit();
        } catch (error) {
          await t.rollback();
          throw error;
        }
      }

      logger.info(`[定时任务] 清理了 ${cancelledApps.length} 个作废申领单的预留库存`);
    } catch (error) {
      logger.error('[定时任务] 清理作废申领单预留库存失败:', error);
    }
  });

  logger.info('[定时任务] 定时任务已启动');
};

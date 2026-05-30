import schedule from 'node-schedule';
import { orderService } from './order.service';
import { settlementService } from './settlement.service';
import { commissionTierService } from './commissionTier.service';
import { Distributor } from '../database/models/distributor.model';
import { logger } from '../utils/logger';

export class SchedulerService {
  private jobs: Map<string, schedule.Job> = new Map();

  startAll() {
    this.startOrderExpiryJob();
    this.startMonthlySettlementJob();
    this.startMonthlyResetJob();
    logger.info('所有定时任务已启动');
  }

  stopAll() {
    for (const [name, job] of this.jobs) {
      job.cancel();
      logger.info(`定时任务 ${name} 已停止`);
    }
    this.jobs.clear();
  }

  private startOrderExpiryJob() {
    const job = schedule.scheduleJob('0 */15 * * * *', async () => {
      try {
        logger.info('开始处理过期订单...');
        const result = await orderService.processExpiredOrders();
        logger.info(`过期订单处理完成，共处理 ${result.processed} 个订单`);
      } catch (error) {
        logger.error('处理过期订单失败:', error);
      }
    });

    this.jobs.set('orderExpiry', job);
    logger.info('订单过期定时任务已启动（每15分钟执行一次）');
  }

  private startMonthlySettlementJob() {
    const job = schedule.scheduleJob('0 0 1 * *', async () => {
      try {
        logger.info('开始生成月度结算单...');
        const distributors = await Distributor.findAll({
          where: { status: 'active' },
        });

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

        let successCount = 0;
        for (const distributor of distributors) {
          try {
            await settlementService.generateMonthlySettlement(distributor.id, period);
            successCount++;
          } catch (error) {
            logger.error(`生成分销商 ${distributor.id} 结算单失败:`, error);
          }
        }

        logger.info(`月度结算单生成完成，成功 ${successCount}/${distributors.length} 个`);
      } catch (error) {
        logger.error('生成月度结算单失败:', error);
      }
    });

    this.jobs.set('monthlySettlement', job);
    logger.info('月度结算定时任务已启动（每月1日凌晨执行）');
  }

  private startMonthlyResetJob() {
    const job = schedule.scheduleJob('0 0 1 * *', async () => {
      try {
        logger.info('开始重置分销商月度销售额...');
        await commissionTierService.resetMonthlySales();
        logger.info('分销商月度销售额重置完成');
      } catch (error) {
        logger.error('重置分销商月度销售额失败:', error);
      }
    });

    this.jobs.set('monthlyReset', job);
    logger.info('月度销售额重置任务已启动（每月1日凌晨执行）');
  }

  async triggerJob(name: string) {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`定时任务 ${name} 不存在`);
    }

    await job.invoke();
    return { success: true, message: `定时任务 ${name} 已手动触发` };
  }

  getJobStatus() {
    const status: Record<string, boolean> = {};
    for (const [name, job] of this.jobs) {
      status[name] = !job.cancelNext;
    }
    return status;
  }
}

export const schedulerService = new SchedulerService();

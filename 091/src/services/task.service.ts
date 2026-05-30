import cron from 'node-cron';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import logger from '../config/logger';
import Material from '../models/material.model';
import InventoryLedger, { LedgerType } from '../models/inventory-ledger.model';
import { MaterialStatus } from '../constants/material.constants';

export interface AgingReminderFilter {
  page?: number;
  pageSize?: number;
  reminderStatus?: 'pending' | 'reminded' | 'archived';
  daysUntilExpiry?: number;
}

class TaskService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  startAllTasks(): void {
    this.startAgingReminderTask();
    this.startAgingAutoArchiveTask();
    logger.info('所有定时任务已启动');
  }

  stopAllTasks(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`定时任务 ${name} 已停止`);
    });
    this.tasks.clear();
  }

  private startAgingReminderTask(): void {
    const task = cron.schedule('0 9 * * *', async () => {
      logger.info('执行陈化到期提醒任务');
      try {
        const now = new Date();
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const expiringMaterials = await Material.findAll({
          where: {
            status: MaterialStatus.SEALED,
            agingEndDate: {
              [Op.between]: [now, threeDaysLater],
            },
            isAgingReminded: false,
            isArchived: false,
          },
        });

        for (const material of expiringMaterials) {
          await material.update({ 
            isAgingReminded: true,
            reminderSentAt: new Date(),
          });
          logger.info(`批次 ${material.batchNo} 陈化即将到期，已发送提醒`);
        }

        logger.info(`陈化到期提醒任务完成，共处理 ${expiringMaterials.length} 条记录`);
      } catch (error) {
        logger.error('陈化到期提醒任务执行失败:', error);
      }
    });

    this.tasks.set('agingReminder', task);
  }

  private startAgingAutoArchiveTask(): void {
    const task = cron.schedule('0 1 * * *', async () => {
      logger.info('执行陈化到期自动归档任务');
      try {
        const now = new Date();

        const expiredMaterials = await Material.findAll({
          where: {
            status: MaterialStatus.SEALED,
            agingEndDate: {
              [Op.lte]: now,
            },
            isArchived: false,
          },
        });

        for (const material of expiredMaterials) {
          await sequelize.transaction(async (t) => {
            await material.update(
              { 
                isArchived: true,
                archivedAt: new Date(),
                status: MaterialStatus.PROCESSED,
              },
              { transaction: t }
            );

            await InventoryLedger.create(
              {
                categoryId: material.categoryId,
                materialId: material.id,
                batchNo: material.batchNo,
                type: LedgerType.AGING_COMPLETE,
                quantity: material.quantity,
                beforeQuantity: material.quantity,
                afterQuantity: material.quantity,
                remarks: '陈化周期结束，自动归档',
              },
              { transaction: t }
            );

            logger.info(`批次 ${material.batchNo} 陈化周期结束，已自动归档`);
          });
        }

        logger.info(`陈化自动归档任务完成，共处理 ${expiredMaterials.length} 条记录`);
      } catch (error) {
        logger.error('陈化自动归档任务执行失败:', error);
      }
    });

    this.tasks.set('agingAutoArchive', task);
  }

  async getAgingReminders(filter: AgingReminderFilter): Promise<{ list: Material[]; total: number }> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const where: any = {
      status: MaterialStatus.SEALED,
    };

    if (filter.reminderStatus === 'pending') {
      where.isAgingReminded = false;
      where.isArchived = false;
    } else if (filter.reminderStatus === 'reminded') {
      where.isAgingReminded = true;
      where.isArchived = false;
    } else if (filter.reminderStatus === 'archived') {
      where.isArchived = true;
    }

    if (filter.daysUntilExpiry) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + filter.daysUntilExpiry * 24 * 60 * 60 * 1000);
      where.agingEndDate = {
        [Op.lte]: expiryDate,
      };
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      order: [['agingEndDate', 'ASC']],
      limit: pageSize,
      offset,
    });

    return { list: rows, total: count };
  }

  async manualArchive(materialId: number, operatorId: number): Promise<Material> {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw new Error('原料不存在');
    }

    if (material.isArchived) {
      throw new Error('该批次已归档');
    }

    return await sequelize.transaction(async (t) => {
      await material.update(
        {
          isArchived: true,
          archivedAt: new Date(),
          status: MaterialStatus.PROCESSED,
        },
        { transaction: t }
      );

      await InventoryLedger.create(
        {
          categoryId: material.categoryId,
          materialId: material.id,
          batchNo: material.batchNo,
          type: LedgerType.AGING_COMPLETE,
          quantity: material.quantity,
          beforeQuantity: material.quantity,
          afterQuantity: material.quantity,
          operatorId,
          remarks: '手动归档',
        },
        { transaction: t }
      );

      return material;
    });
  }

  async getExpiringMaterials(): Promise<Material[]> {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return await Material.findAll({
      where: {
        status: MaterialStatus.SEALED,
        agingEndDate: {
          [Op.between]: [now, weekLater],
        },
        isArchived: false,
      },
      order: [['agingEndDate', 'ASC']],
    });
  }
}

export default new TaskService();

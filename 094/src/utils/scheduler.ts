import cron from 'node-cron';
import { Op } from 'sequelize';
import { WorkOrder, Material } from '../models';
import { WORK_ORDER_STATUS } from '../config';
import logger from './logger';
import sequelize from '../config/database';

const expirePendingDepositOrders = async (): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const expireThreshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const expiredOrders = await WorkOrder.findAll({
      where: {
        status: WORK_ORDER_STATUS.PENDING_DEPOSIT,
        isDepositPaid: false,
        createdAt: {
          [Op.lte]: expireThreshold,
        },
      },
      transaction: t,
    });

    if (expiredOrders.length > 0) {
      for (const order of expiredOrders) {
        await order.update(
          {
            status: WORK_ORDER_STATUS.EXPIRED,
            cancelledReason: '超时未支付定金，系统自动作废',
            cancelledAt: new Date(),
          },
          { transaction: t }
        );
      }

      await t.commit();
      logger.info(`定时任务: 自动作废 ${expiredOrders.length} 个超时未支付定金的工单`);
    }
  } catch (error) {
    await t.rollback();
    logger.error('定时任务: 自动作废超时工单失败', error);
  }
};

const checkLowStockMaterials = async (): Promise<void> => {
  try {
    const lowStockMaterials = await Material.findAll({
      where: {
        currentStock: {
          [Op.lte]: sequelize.col('minStock'),
        },
        isPurchasable: true,
      },
    });

    if (lowStockMaterials.length > 0) {
      logger.warn(`定时任务: 发现 ${lowStockMaterials.length} 个物料库存不足`, {
        materials: lowStockMaterials.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          currentStock: m.currentStock,
          minStock: m.minStock,
        })),
      });
    }
  } catch (error) {
    logger.error('定时任务: 检查库存预警失败', error);
  }
};

const initScheduler = (): void => {
  cron.schedule('0 0 * * *', () => {
    logger.info('定时任务: 开始执行每日工单清理任务');
    expirePendingDepositOrders();
  });

  cron.schedule('0 9,15 * * *', () => {
    logger.info('定时任务: 开始执行库存检查任务');
    checkLowStockMaterials();
  });

  logger.info('定时任务管理器已启动');
};

export default initScheduler;

import cron from 'node-cron';
import { Collection } from '../models';
import { CollectionStatus } from '../types';
import logger from '../config/logger';
import { Op } from 'sequelize';

export const checkMaintenanceReminders = async (): Promise<void> => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const dueCollections = await Collection.findAll({
      where: {
        nextMaintenanceDate: {
          [Op.between]: [today, sevenDaysLater]
        },
        status: { [Op.ne]: CollectionStatus.ARCHIVED }
      }
    });

    if (dueCollections.length > 0) {
      logger.info(`发现 ${dueCollections.length} 件藏品需要保养提醒`);
      dueCollections.forEach((collection) => {
        logger.info(
          `藏品 ${collection.collectionNo} - ${collection.name} 将于 ${collection.nextMaintenanceDate} 到期保养`
        );
      });
    }
  } catch (error) {
    logger.error('检查保养提醒失败:', error);
  }
};

export const checkOverdueMaintenance = async (): Promise<void> => {
  try {
    const today = new Date();

    const overdueCollections = await Collection.findAll({
      where: {
        nextMaintenanceDate: {
          [Op.lt]: today
        },
        status: { [Op.ne]: CollectionStatus.ARCHIVED }
      }
    });

    if (overdueCollections.length > 0) {
      logger.warn(`发现 ${overdueCollections.length} 件藏品保养已逾期`);
      overdueCollections.forEach((collection) => {
        logger.warn(
          `藏品 ${collection.collectionNo} - ${collection.name} 保养已逾期，应保养日期: ${collection.nextMaintenanceDate}`
        );
      });
    }
  } catch (error) {
    logger.error('检查逾期保养失败:', error);
  }
};

export const initScheduledTasks = (): void => {
  logger.info('初始化定时任务...');

  cron.schedule('0 8 * * *', () => {
    logger.info('执行每日保养提醒检查...');
    checkMaintenanceReminders();
    checkOverdueMaintenance();
  });

  logger.info('定时任务已启动');
};

import cron from 'node-cron';
import { Op } from 'sequelize';
import WarehouseDocument from '../models/WarehouseDocument';
import { DocumentStatus } from '../types/common';
import logger from './logger';
import moment from 'moment';

export const startScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('执行超时单据检查任务');
      
      const timeoutThreshold = moment().subtract(24, 'hours').toDate();
      
      const { count, rows } = await WarehouseDocument.findAndCountAll({
        where: {
          status: DocumentStatus.PENDING,
          createdAt: { [Op.lt]: timeoutThreshold }
        }
      });

      if (count > 0) {
        const timeoutDocs = rows.map(doc => ({
          documentNo: doc.documentNo,
          type: doc.type
        }));

        await WarehouseDocument.update(
          { 
            status: DocumentStatus.REJECTED,
            isTimeout: true
          },
          {
            where: {
              status: DocumentStatus.PENDING,
              createdAt: { [Op.lt]: timeoutThreshold }
            }
          }
        );

        logger.info(`已自动驳回 ${count} 个超时单据`, { timeoutDocs });
      }
    } catch (error) {
      logger.error('超时单据检查任务执行失败:', error);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('执行每日库存统计任务');
    } catch (error) {
      logger.error('每日库存统计任务执行失败:', error);
    }
  });

  logger.info('定时任务调度器已启动');
};

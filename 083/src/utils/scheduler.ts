import cron from 'node-cron';
import { Supplier } from '../models/supplier.model';
import { Op } from 'sequelize';
import { logger } from './logger';

export const startScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    logger.info('执行资质到期检查任务');
    try {
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      const expiringSuppliers = await Supplier.findAll({
        where: {
          qualificationExpiryDate: {
            [Op.between]: [new Date(), thirtyDaysLater],
          },
        },
      });

      if (expiringSuppliers.length > 0) {
        logger.warn(
          `发现 ${expiringSuppliers.length} 个供应商资质即将到期:`,
          expiringSuppliers.map((s) => ({
            id: s.id,
            name: s.name,
            expiryDate: s.qualificationExpiryDate,
          }))
        );
      }
    } catch (error) {
      logger.error('资质到期检查任务执行失败', error);
    }
  });

  logger.info('定时任务已启动');
};

import cron from 'node-cron';
import { Op } from 'sequelize';
import Auction, { AuctionStatus } from './models/Auction';
import { createOrderFromAuction } from './controllers/orderController';
import logger from './utils/logger';
import dayjs from 'dayjs';

export const initScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = dayjs().toDate();
      
      const endedAuctions = await Auction.findAll({
        where: {
          endTime: { [Op.lte]: now },
          status: { [Op.in]: [AuctionStatus.ONGOING, AuctionStatus.PENDING] },
        },
      });
      
      for (const auction of endedAuctions) {
        try {
          await createOrderFromAuction(auction.id);
          logger.info(`自动处理竞拍: ${auction.id}`);
        } catch (error) {
          logger.error(`处理竞拍失败: ${auction.id}`, error);
        }
      }
    } catch (error) {
      logger.error('定时任务执行失败', error);
    }
  });
  
  logger.info('定时任务已启动');
};

import cron from 'node-cron';
import GroupBuy from '../models/GroupBuy.model';
import { GroupBuyStatus } from '../models/GroupBuy.model';
import { Op } from 'sequelize';

export const setupCronJobs = () => {
  // 每分钟检查拼团状态
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // 处理待开始的拼团
      const pendingToActive = await GroupBuy.update(
        { status: GroupBuyStatus.ACTIVE },
        {
          where: {
            status: GroupBuyStatus.PENDING,
            startTime: { [Op.lte]: now }
          }
        }
      );
      
      if (pendingToActive[0] > 0) {
        console.log(`[Cron] 已激活 ${pendingToActive[0]} 个拼团`);
      }

      // 处理已结束的拼团
      const expiredGroupBuys = await GroupBuy.findAll({
        where: {
          status: GroupBuyStatus.ACTIVE,
          endTime: { [Op.lte]: now }
        }
      });

      for (const groupBuy of expiredGroupBuys) {
        if (groupBuy.currentQuantity >= groupBuy.minQuantity) {
          await groupBuy.update({ status: GroupBuyStatus.LOCKED });
          console.log(`[Cron] 拼团 ${groupBuy.id} 已成团，已锁单`);
        } else {
          await groupBuy.update({ status: GroupBuyStatus.CANCELLED });
          console.log(`[Cron] 拼团 ${groupBuy.id} 未成团，已取消`);
        }
      }
    } catch (error) {
      console.error('[Cron] 拼团状态检查失败:', error);
    }
  });

  console.log('[Cron] 定时任务已启动');
};

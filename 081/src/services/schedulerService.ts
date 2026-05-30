import cron from 'node-cron';
import { Op, Sequelize } from 'sequelize';
import { Material, Inventory, Supplier } from '../models';

export const initScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] 执行每日库存预警检查...');
    try {
      const lowStockMaterials = await Inventory.findAll({
        where: {
          quantity: {
            [Op.lte]: Sequelize.col('Material.warningStock')
          }
        },
        include: [{ model: Material }]
      });
      
      if (lowStockMaterials.length > 0) {
        console.log(`[Scheduler] 发现 ${lowStockMaterials.length} 种原料库存低于预警值`);
      }
    } catch (error) {
      console.error('[Scheduler] 库存预警检查失败:', error);
    }
  });

  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] 执行每日供应商资质检查...');
    try {
      const today = new Date();
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const expiringSuppliers = await Supplier.findAll({
        where: {
          qualificationExpireDate: {
            [Op.between]: [today, thirtyDaysLater]
          }
        }
      });
      
      if (expiringSuppliers.length > 0) {
        console.log(`[Scheduler] 发现 ${expiringSuppliers.length} 家供应商资质即将到期`);
      }
    } catch (error) {
      console.error('[Scheduler] 供应商资质检查失败:', error);
    }
  });

  console.log('[Scheduler] 定时任务已启动');
};

export default { initScheduler };

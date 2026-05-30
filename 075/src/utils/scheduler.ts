
import cron from 'node-cron';
import moment from 'moment';
import { Op } from 'sequelize';
import { Asset } from '../models';
import { AssetStatus } from '../types';

export const calculateDepreciation = async () => {
  try {
    const assets = await Asset.findAll({
      where: {
        status: { [Op.ne]: AssetStatus.SCRAPPED }
      }
    });

    for (const asset of assets) {
      const purchaseDate = moment(asset.purchaseDate);
      const monthsUsed = moment().diff(purchaseDate, 'months');
      const monthlyDepreciationRate = Number(asset.depreciationRate) / 12;
      const totalDepreciationRate = Math.min(monthlyDepreciationRate * monthsUsed, 100);
      const currentValue = Number(asset.purchasePrice) * (1 - totalDepreciationRate / 100);
      
      await asset.update({
        currentValue: Math.max(0, currentValue)
      });
    }

    console.log(`资产折旧计算完成 - ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  } catch (error) {
    console.error('资产折旧计算失败:', error);
  }
};

export const checkWarrantyExpiry = async () => {
  try {
    const thirtyDaysLater = moment().add(30, 'days').toDate();
    const today = moment().toDate();

    const expiringAssets = await Asset.findAll({
      where: {
        warrantyDate: {
          [Op.between]: [today, thirtyDaysLater]
        },
        status: { [Op.ne]: AssetStatus.SCRAPPED }
      }
    });

    if (expiringAssets.length > 0) {
      console.log(`发现 ${expiringAssets.length} 个资产即将在30天内过保`);
    }

    console.log(`保修到期检查完成 - ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  } catch (error) {
    console.error('保修到期检查失败:', error);
  }
};

export const initScheduler = () => {
  cron.schedule('0 2 * * *', () => {
    console.log('开始执行每日定时任务...');
    calculateDepreciation();
    checkWarrantyExpiry();
  });

  console.log('定时任务调度器已启动');
};

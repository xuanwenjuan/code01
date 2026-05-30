import cron from 'node-cron';
import logger from '../utils/logger';
import Material from '../models/Material';
import Warehouse from '../models/Warehouse';
import Category from '../models/Category';
import LowStockAlert, { AlertStatus } from '../models/LowStockAlert';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export const checkLowStock = async () => {
  const t = await sequelize.transaction();
  
  try {
    logger.info('开始执行低库存预警检查...');

    const lowStockMaterials = await Material.findAll({
      where: {
        stockQuantity: {
          [Op.lte]: sequelize.col('minStockThreshold')
        },
        status: 1
      },
      include: [
        { model: Warehouse, as: 'warehouse' },
        { model: Category, as: 'category' }
      ],
      transaction: t
    });

    logger.info(`发现 ${lowStockMaterials.length} 个低库存物资`);

    for (const material of lowStockMaterials) {
      const existingAlert = await LowStockAlert.findOne({
        where: {
          materialId: material.id,
          status: AlertStatus.PENDING
        },
        transaction: t
      });

      if (!existingAlert) {
        const warehouse = material.getDataValue('warehouse');
        const category = material.getDataValue('category');

        await LowStockAlert.create(
          {
            materialId: material.id,
            materialName: material.name,
            materialCode: material.code,
            currentStock: material.stockQuantity,
            minThreshold: material.minStockThreshold,
            warehouseId: material.warehouseId,
            warehouseName: warehouse?.name || '未知',
            categoryId: material.categoryId,
            categoryName: category?.name || '未知',
            status: AlertStatus.PENDING
          },
          { transaction: t }
        );

        logger.warn(
          `【低库存预警】物资: ${material.name} (${material.code}), ` +
          `当前库存: ${material.stockQuantity}, 最低阈值: ${material.minStockThreshold}, ` +
          `仓库: ${warehouse?.name || '未知'}`
        );
      }
    }

    await t.commit();
    logger.info('低库存预警检查完成');
  } catch (error) {
    await t.rollback();
    logger.error('低库存预警检查失败:', error);
  }
};

cron.schedule('0 9 * * *', checkLowStock);
logger.info('定时任务初始化完成：每日9点低库存预警');

export default cron;

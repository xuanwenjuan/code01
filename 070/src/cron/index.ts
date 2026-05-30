import cron from 'node-cron';
import { Op } from 'sequelize';
import { Order, sequelize, Settlement, User, Category } from '../models';
import { OrderStatus, SettlementStatus, SettlementType, PLATFORM_COMMISSION_RATE, SERVICE_PROVIDER_SHARE_RATE } from '../utils/constants';
import logger from '../utils/logger';
import { logOperation } from '../middleware/operationLog';

const processExpiredOrders = async () => {
  const t = await sequelize.transaction();
  
  try {
    logger.info('开始处理超时订单...');

    const now = new Date();
    const expiredOrders = await Order.findAll({
      where: {
        status: OrderStatus.PUBLISHED,
        expireAt: {
          [Op.lte]: now,
        },
      },
      transaction: t,
    });

    logger.info(`发现 ${expiredOrders.length} 个超时订单需要处理`);

    for (const order of expiredOrders) {
      await order.update(
        { 
          status: OrderStatus.EXPIRED,
          cancelledAt: now,
        },
        { transaction: t }
      );

      logger.info(`订单 ${order.orderNo} 已超时失效`);
    }

    await t.commit();
    logger.info(`超时订单处理完成，共处理 ${expiredOrders.length} 个订单`);
  } catch (error) {
    await t.rollback();
    logger.error('超时订单处理失败:', error);
    throw error;
  }
};

const processAutoSettlement = async () => {
  const t = await sequelize.transaction();
  
  try {
    logger.info('开始执行订单自动结算...');

    const completedOrders = await Order.findAll({
      where: {
        status: OrderStatus.COMPLETED,
      },
      include: [
        {
          model: Settlement,
          as: 'settlements',
          required: false,
        },
      ],
      transaction: t,
    });

    const ordersToSettle = completedOrders.filter(
      order => !order.settlements || order.settlements.length === 0
    );

    logger.info(`发现 ${ordersToSettle.length} 个订单需要结算`);

    for (const order of ordersToSettle) {
      const budget = parseFloat(order.budget as any);
      const platformCommission = budget * PLATFORM_COMMISSION_RATE;
      const serviceProviderShare = budget * SERVICE_PROVIDER_SHARE_RATE;
      const influencerEarning = budget - platformCommission - serviceProviderShare;

      await Settlement.bulkCreate(
        [
          {
            settlementNo: `SET${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            orderId: order.id,
            userId: order.influencerId,
            type: SettlementType.INFLUENCER_EARNING,
            amount: influencerEarning,
            rate: 1 - PLATFORM_COMMISSION_RATE - SERVICE_PROVIDER_SHARE_RATE,
            status: SettlementStatus.PENDING,
            remark: '系统自动生成达人收益',
          },
          {
            settlementNo: `SET${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            orderId: order.id,
            userId: null,
            type: SettlementType.PLATFORM_COMMISSION,
            amount: platformCommission,
            rate: PLATFORM_COMMISSION_RATE,
            status: SettlementStatus.PENDING,
            remark: '系统自动生成平台佣金',
          },
          {
            settlementNo: `SET${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            orderId: order.id,
            userId: null,
            type: SettlementType.SERVICE_PROVIDER_SHARE,
            amount: serviceProviderShare,
            rate: SERVICE_PROVIDER_SHARE_RATE,
            status: SettlementStatus.PENDING,
            remark: '系统自动生成服务商分成',
          },
        ],
        { transaction: t }
      );

      logger.info(`订单 ${order.orderNo} 已创建结算记录，总金额: ${budget}, 达人收益: ${influencerEarning}, 平台佣金: ${platformCommission}, 服务商分成: ${serviceProviderShare}`);
    }

    await t.commit();
    logger.info(`订单自动结算完成，共处理 ${ordersToSettle.length} 个订单`);
  } catch (error) {
    await t.rollback();
    logger.error('订单自动结算失败:', error);
    throw error;
  }
};

const processOrderStatusFlow = async () => {
  const t = await sequelize.transaction();
  
  try {
    logger.info('开始检查订单状态流转...');

    const videoPublishedOrders = await Order.findAll({
      where: {
        status: OrderStatus.VIDEO_PUBLISHED,
      },
      transaction: t,
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const order of videoPublishedOrders) {
      if (order.updatedAt < sevenDaysAgo) {
        await order.update(
          { 
            status: OrderStatus.COMPLETED,
            completedAt: new Date(),
          },
          { transaction: t }
        );
        logger.info(`订单 ${order.orderNo} 已自动完成（发布满7天）`);
      }
    }

    await t.commit();
    logger.info('订单状态流转检查完成');
  } catch (error) {
    await t.rollback();
    logger.error('订单状态流转检查失败:', error);
    throw error;
  }
};

export const startCronJobs = () => {
  cron.schedule('*/30 * * * *', async () => {
    logger.info('========== 执行超时订单检查任务 ==========');
    try {
      await processExpiredOrders();
    } catch (error) {
      logger.error('定时任务执行失败:', error);
    }
  });

  cron.schedule('0 1 * * *', async () => {
    logger.info('========== 执行订单自动结算任务 ==========');
    try {
      await processAutoSettlement();
    } catch (error) {
      logger.error('定时任务执行失败:', error);
    }
  });

  cron.schedule('0 2 * * *', async () => {
    logger.info('========== 执行订单状态流转检查任务 ==========');
    try {
      await processOrderStatusFlow();
    } catch (error) {
      logger.error('定时任务执行失败:', error);
    }
  });

  logger.info('所有定时任务已启动');
};

import cron from 'node-cron';
import { Order, OrderItem, Product, Settlement, SettlementItem } from '../models';
import { OrderStatus, SettlementStatus } from '../types';
import { sequelize } from '../database';
import { Logger } from '../utils/logger';
import { Op } from 'sequelize';

export const closeExpiredOrders = async () => {
  Logger.info('Starting to close expired orders...');

  const t = await sequelize.transaction();

  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const expiredOrders = await Order.findAll({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: {
          [Op.lte]: thirtyMinutesAgo
        }
      },
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    });

    Logger.info(`Found ${expiredOrders.length} expired orders to close`);

    for (const order of expiredOrders) {
      for (const item of order.items!) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (product) {
          await product.update(
            { stock: product.stock + item.quantity },
            { transaction: t }
          );
        }
      }

      await order.update(
        {
          status: OrderStatus.CLOSED,
          cancelReason: '订单超时未支付，系统自动关闭',
          cancelTime: new Date()
        },
        { transaction: t }
      );

      Logger.info(`Order ${order.orderNo} has been closed automatically`);
    }

    await t.commit();
    Logger.info('Successfully closed expired orders');
  } catch (error) {
    await t.rollback();
    Logger.error('Failed to close expired orders:', error);
  }
};

export const autoConfirmDelivery = async () => {
  Logger.info('Starting auto confirm delivery...');

  const t = await sequelize.transaction();

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const shippedOrders = await Order.findAll({
      where: {
        status: OrderStatus.SHIPPED,
        shippingTime: {
          [Op.lte]: sevenDaysAgo
        }
      },
      transaction: t
    });

    Logger.info(`Found ${shippedOrders.length} orders to auto confirm delivery`);

    for (const order of shippedOrders) {
      await order.update(
        {
          status: OrderStatus.COMPLETED,
          receiveTime: new Date()
        },
        { transaction: t }
      );

      Logger.info(`Order ${order.orderNo} auto confirmed delivery`);
    }

    await t.commit();
    Logger.info('Successfully auto confirmed delivery');
  } catch (error) {
    await t.rollback();
    Logger.error('Failed to auto confirm delivery:', error);
  }
};

export const autoGenerateMonthlySettlements = async () => {
  Logger.info('Starting auto generate monthly settlements...');

  const t = await sequelize.transaction();

  try {
    const today = new Date();
    const isFirstDayOfMonth = today.getDate() === 1;
    
    if (!isFirstDayOfMonth) {
      Logger.info('Not first day of month, skipping auto settlement generation');
      return;
    }

    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;

    Logger.info(`Auto generating settlements for ${monthStr}`);

    const { Artist, User } = await import('../models');
    const { Role } = await import('../types');

    const artists = await Artist.findAll({
      where: { status: 'approved' },
      transaction: t
    });

    Logger.info(`Found ${artists.length} artists to generate settlements for`);

    for (const artist of artists) {
      const existingSettlement = await Settlement.findOne({
        where: { artistId: artist.id, month: monthStr },
        transaction: t
      });

      if (existingSettlement) {
        continue;
      }

      const completedOrderItems = await OrderItem.findAll({
        include: [
          {
            model: Order,
            as: 'order',
            where: {
              status: OrderStatus.COMPLETED,
              createdAt: {
                [Op.gte]: new Date(year, parseInt(month) - 1, 1),
                [Op.lt]: new Date(year, parseInt(month), 1)
              }
            },
            required: true
          }
        ],
        where: { artistId: artist.id },
        transaction: t
      });

      if (completedOrderItems.length === 0) {
        continue;
      }

      let totalAmount = 0;
      let platformFee = 0;
      let artistAmount = 0;
      const settlementItems: any[] = [];

      for (const item of completedOrderItems) {
        const itemAmount = Number(item.subtotal);
        const fee = itemAmount * 0.1;
        const artistShare = itemAmount - fee;

        totalAmount += itemAmount;
        platformFee += fee;
        artistAmount += artistShare;

        settlementItems.push({
          orderItemId: item.id,
          orderNo: (item as any).order.orderNo,
          productName: item.productName,
          orderAmount: itemAmount,
          platformFee: fee,
          artistAmount: artistShare
        });
      }

      const settlementNo = `SET${Date.now()}${Math.floor(Math.random() * 10000)}`;

      const settlement = await Settlement.create(
        {
          settlementNo,
          artistId: artist.id,
          month: monthStr,
          totalOrders: completedOrderItems.length,
          totalAmount,
          platformFee,
          artistAmount,
          status: SettlementStatus.PENDING
        },
        { transaction: t }
      );

      for (const si of settlementItems) {
        si.settlementId = settlement.id;
        await SettlementItem.create(si, { transaction: t });
      }

      Logger.info(`Generated settlement ${settlementNo} for artist ${artist.id}`);
    }

    await t.commit();
    Logger.info('Successfully auto generated monthly settlements');
  } catch (error) {
    await t.rollback();
    Logger.error('Failed to auto generate monthly settlements:', error);
  }
};

export const startOrderTasks = () => {
  cron.schedule('*/5 * * * *', () => {
    closeExpiredOrders().catch(error => {
      Logger.error('Error in order task:', error);
    });
  });

  cron.schedule('0 2 * * *', () => {
    autoConfirmDelivery().catch(error => {
      Logger.error('Error in auto confirm delivery:', error);
    });
  });

  cron.schedule('0 4 1 * *', () => {
    autoGenerateMonthlySettlements().catch(error => {
      Logger.error('Error in auto generate settlements:', error);
    });
  });

  Logger.info('Order tasks scheduled successfully');
};

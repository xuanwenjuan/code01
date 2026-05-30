import cron from 'node-cron';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';
import Order, { OrderStatus } from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import logger from './logger';

const ORDER_TIMEOUT_MINUTES = 30;

export const startScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('执行超时订单检查任务');

    const transaction: Transaction = await sequelize.transaction();

    try {
      const timeoutTime = new Date(Date.now() - ORDER_TIMEOUT_MINUTES * 60 * 1000);

      const unpaidOrders = await Order.findAll({
        where: {
          status: OrderStatus.UNPAID,
          createdAt: {
            [Op.lte]: timeoutTime,
          },
        },
        include: [{ model: OrderItem, as: 'items' }],
        transaction,
      });

      logger.info(`发现 ${unpaidOrders.length} 个超时未支付订单`);

      for (const order of unpaidOrders) {
        for (const item of order.items!) {
          const product = await Product.findByPk(item.productId, { transaction });
          if (product) {
            await product.update(
              { stock: product.stock + item.quantity },
              { transaction }
            );
          }
        }

        await order.update(
          {
            status: OrderStatus.CANCELLED,
            cancelReason: '订单超时未支付',
            cancelTime: new Date(),
          },
          { transaction }
        );

        logger.info(`订单 ${order.orderNo} 已超时取消`);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error('超时订单处理失败:', error);
    }
  });

  logger.info('定时任务已启动');
};

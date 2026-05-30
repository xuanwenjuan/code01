import cron from 'node-cron';
import { Op } from 'sequelize';
import moment from 'moment';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import Equipment from '../models/equipment.model';
import { OrderStatus, EquipmentStatus } from '../common/enums';
import sequelize from '../config/database';

export const initOrderJobs = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running order status update job...');

    const transaction = await sequelize.transaction();

    try {
      const now = new Date();

      const outboundToInUse = await Order.update(
        { status: OrderStatus.IN_USE },
        {
          where: {
            status: OrderStatus.OUTBOUND,
            startTime: { [Op.lte]: now },
          },
          transaction,
        }
      );

      const inUseToReturned = await Order.update(
        { status: OrderStatus.RETURNED },
        {
          where: {
            status: OrderStatus.IN_USE,
            endTime: { [Op.lte]: now },
          },
          transaction,
        }
      );

      const pendingOrders = await Order.findAll({
        where: {
          status: OrderStatus.PENDING_DEPOSIT,
          createdAt: {
            [Op.lte]: moment().subtract(24, 'hours').toDate(),
          },
        },
        transaction,
      });

      for (const order of pendingOrders) {
        await order.update(
          {
            status: OrderStatus.CLOSED,
            cancelReason: '超时未支付定金，系统自动关闭',
          },
          { transaction }
        );
      }

      const confirmedOrders = await Order.findAll({
        where: {
          status: OrderStatus.CONFIRMED,
          startTime: {
            [Op.lte]: moment().subtract(7, 'days').toDate(),
          },
          paidAmount: { [Op.lt]: sequelize.col('totalAmount') },
        },
        transaction,
      });

      for (const order of confirmedOrders) {
        await order.update(
          {
            status: OrderStatus.CLOSED,
            cancelReason: '活动已结束未支付尾款，系统自动关闭',
          },
          { transaction }
        );
      }

      const returnedOrderIds = await Order.findAll({
        where: {
          status: OrderStatus.RETURNED,
        },
        attributes: ['id'],
        transaction,
      });

      if (returnedOrderIds.length > 0) {
        const orderIds = returnedOrderIds.map(o => o.id);
        const orderItems = await OrderItem.findAll({
          where: { orderId: { [Op.in]: orderIds } },
          transaction,
        });

        const equipmentIds = orderItems.map(item => item.equipmentId);
        if (equipmentIds.length > 0) {
          await Equipment.update(
            { status: EquipmentStatus.IN_STOCK },
            {
              where: { id: { [Op.in]: equipmentIds } },
              transaction,
            }
          );
        }
      }

      await transaction.commit();
      console.log(
        `Order status update job completed. ` +
        `${outboundToInUse[0]} orders moved to IN_USE, ` +
        `${inUseToReturned[0]} orders moved to RETURNED, ` +
        `${pendingOrders.length + confirmedOrders.length} orders closed.`
      );
    } catch (error) {
      await transaction.rollback();
      console.error('Error in order status update job:', error);
    }
  });

  console.log('Order jobs initialized');
};
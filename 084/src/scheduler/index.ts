import cron from 'node-cron';
import WorkOrder, { WorkOrderStatus } from '../models/WorkOrder';
import Cleaner from '../models/Cleaner';
import { Op } from 'sequelize';
import moment from 'moment';
import sequelize from '../config/database';

export const initScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running timeout work order check...');
    await checkTimeoutWorkOrders();
  });

  console.log('Scheduler initialized');
};

const checkTimeoutWorkOrders = async () => {
  const t = await sequelize.transaction();
  try {
    const now = new Date();

    const timeoutOrders = await WorkOrder.findAll({
      where: {
        status: { [Op.in]: [WorkOrderStatus.ASSIGNED, WorkOrderStatus.REASSIGNED] },
        deadlineTime: { [Op.lt]: now },
        autoReassign: true,
        reassignCount: { [Op.lt]: 3 }
      },
      transaction: t
    });

    for (const order of timeoutOrders) {
      console.log(`Work order ${order.orderNo} timeout, reassigning...`);

      const availableCleaners = await Cleaner.findAll({
        where: {
          workAreaId: order.workAreaId,
          status: 'on_duty'
        },
        transaction: t
      });

      if (availableCleaners.length > 0) {
        const randomCleaner = availableCleaners[Math.floor(Math.random() * availableCleaners.length)];

        await order.update(
          {
            assignedTo: randomCleaner.id,
            reassignCount: order.reassignCount + 1,
            status: WorkOrderStatus.REASSIGNED
          },
          { transaction: t }
        );

        console.log(`Work order ${order.orderNo} reassigned to cleaner ${randomCleaner.name}`);
      }
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error('Error checking timeout work orders:', error);
  }
};

export default initScheduler;
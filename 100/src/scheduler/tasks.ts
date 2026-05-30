import cron from 'node-cron';
import { WorkOrder, MaterialStock } from '../models';
import { WorkOrderStatus, MaterialStatus } from '../types';
import dayjs from 'dayjs';

export function setupScheduledTasks() {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily status check task...');

    try {
      const pendingOrders = await WorkOrder.findAll({
        where: { status: WorkOrderStatus.PENDING }
      });

      const now = dayjs();
      for (const order of pendingOrders) {
        const createdDays = now.diff(dayjs(order.createdAt), 'day');
        if (createdDays > 3) {
          await order.update({ status: WorkOrderStatus.SUSPENDED });
          console.log(`Order ${order.orderNo} suspended due to inactivity`);
        }
      }

      const today = now.toDate();
      const expiredStocks = await MaterialStock.findAll({
        where: {
          expireDate: { [require('sequelize').Op.lte]: today },
          status: { [require('sequelize').Op.ne]: MaterialStatus.EXPIRED }
        }
      });

      for (const stock of expiredStocks) {
        await stock.update({ status: MaterialStatus.EXPIRED });
        console.log(`Stock ${stock.batchNo} marked as expired`);
      }

      console.log('Daily status check task completed');
    } catch (error) {
      console.error('Error in daily status check:', error);
    }
  });

  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily expiration warning...');

    try {
      const warningDate = dayjs().add(7, 'day').toDate();
      const expiringStocks = await MaterialStock.findAll({
        where: {
          expireDate: { [require('sequelize').Op.lte]: warningDate },
          status: { [require('sequelize').Op.ne]: MaterialStatus.EXPIRED }
        }
      });

      if (expiringStocks.length > 0) {
        console.log(`Found ${expiringStocks.length} expiring stocks`);
      }
    } catch (error) {
      console.error('Error in expiration warning:', error);
    }
  });

  console.log('Scheduled tasks initialized');
}

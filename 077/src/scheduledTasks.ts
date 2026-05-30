import cron from 'node-cron';
import { Op } from 'sequelize';
import moment from 'moment';
import RentalOrder from './database/models/RentalOrder.model';
import Equipment from './database/models/Equipment.model';
import OrderLog from './database/models/OrderLog.model';
import { OrderStatus, EquipmentStatus } from './types';
import { sequelize } from './database';
import { checkOverdueOrders, checkPendingPaymentOrders } from './jobs/overdue.job';

export const startScheduledTasks = () => {
  console.log('定时任务已启动');

  cron.schedule('0 * * * *', checkOverdueOrders);

  cron.schedule('0 2 * * *', checkPendingPaymentOrders);

  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('执行即将到期订单提醒任务:', new Date());

      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      const orders = await RentalOrder.findAll({
        where: {
          status: OrderStatus.IN_USE,
          endDate: { [Op.lte]: threeDaysLater }
        },
        include: [{ all: true }]
      });

      console.log(`发现 ${orders.length} 个订单即将到期，需要发送提醒`);
    } catch (error) {
      console.error('执行即将到期订单提醒任务失败:', error);
    }
  });

  cron.schedule('0 10 * * *', async () => {
    try {
      console.log('执行维保到期提醒任务:', new Date());

      const today = new Date();
      const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const equipments = await Equipment.findAll({
        where: {
          nextMaintenanceDate: {
            [Op.between]: [today, oneWeekLater]
          },
          status: { [Op.ne]: EquipmentStatus.SCRAPPED }
        }
      });

      console.log(`发现 ${equipments.length} 台设备即将需要维保，需要发送提醒`);
    } catch (error) {
      console.error('执行维保到期提醒任务失败:', error);
    }
  });

  cron.schedule('0 2 1 * *', async () => {
    try {
      console.log('执行上月报表自动生成任务:', new Date());

      const lastMonth = moment().subtract(1, 'month');
      const year = lastMonth.year();
      const month = lastMonth.month() + 1;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const PaymentRecord = (await import('./database/models/PaymentRecord.model')).default;
      const Customer = (await import('./database/models/Customer.model')).default;
      const FinancialReport = (await import('./database/models/FinancialReport.model')).default;

      const payments = await PaymentRecord.findAll({
        where: {
          createdAt: { [Op.between]: [startDate, endDate] }
        }
      });

      const totalRentIncome = payments
        .filter(p => p.paymentType === 'rent')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalDepositIncome = payments
        .filter(p => p.paymentType === 'deposit')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalOverdueIncome = payments
        .filter(p => p.paymentType === 'overdue')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalDamageIncome = payments
        .filter(p => p.paymentType === 'damage')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalIncome = totalRentIncome + totalOverdueIncome + totalDamageIncome;

      const orderCount = await RentalOrder.count({
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
          status: ['COMPLETED']
        }
      });

      const equipmentCount = await Equipment.count({
        where: { status: ['IN_STOCK', 'RENTED'] }
      });

      const customerCount = await Customer.count({ where: { status: 1 } });

      const reportDate = `${year}-${month.toString().padStart(2, '0')}`;

      await FinancialReport.findOrCreate({
        where: { reportDate, reportType: 'monthly' },
        defaults: {
          reportDate,
          reportType: 'monthly',
          totalRentIncome,
          totalDepositIncome,
          totalDepositRefund: 0,
          totalOverdueIncome,
          totalDamageIncome,
          totalMaintenanceCost: 0,
          totalIncome,
          totalExpense: 0,
          netProfit: totalIncome,
          orderCount,
          equipmentCount,
          customerCount
        }
      });

      console.log(`已生成 ${year}年${month}月 的月度报表`);
    } catch (error) {
      console.error('执行月度报表自动生成任务失败:', error);
    }
  });
};

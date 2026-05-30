import cron from 'node-cron';
import Vehicle from '../models/Vehicle';
import Settlement, { SettlementStatus } from '../models/Settlement';
import Order, { OrderStatus } from '../models/Order';
import Branch from '../models/Branch';
import { Logger } from '../utils/logger';
import dayjs from 'dayjs';
import { Op } from 'sequelize';
import sequelize from '../config/database';

class SchedulerService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  startAllTasks(): void {
    this.startVehicleExpiryCheck();
    this.startAutoSettlement();
    this.startOrderStatusCleanup();
    Logger.info('所有定时任务已启动');
  }

  stopAllTasks(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      Logger.info(`定时任务 ${name} 已停止`);
    });
    this.tasks.clear();
  }

  private startVehicleExpiryCheck(): void {
    const task = cron.schedule('0 9 * * *', async () => {
      try {
        Logger.info('开始检查车辆证件到期情况');
        const thirtyDaysLater = dayjs().add(30, 'day').toDate();
        const today = dayjs().startOf('day').toDate();

        const expiringVehicles = await Vehicle.findAll({
          where: {
            licenseExpireDate: {
              [Op.between]: [today, thirtyDaysLater]
            }
          },
          include: [{ model: Branch, as: 'branch' }]
        });

        if (expiringVehicles.length > 0) {
          Logger.warn(`发现 ${expiringVehicles.length} 辆车辆证件即将到期`, {
            vehicles: expiringVehicles.map(v => ({
              plateNumber: v.plateNumber,
              driverName: v.driverName,
              expireDate: dayjs(v.licenseExpireDate).format('YYYY-MM-DD')
            }))
          });
        }

        Logger.info('车辆证件到期检查完成');
      } catch (error) {
        Logger.error('车辆证件到期检查失败', error);
      }
    });

    this.tasks.set('vehicleExpiryCheck', task);
    Logger.info('车辆证件到期检查定时任务已启动（每天9:00执行）');
  }

  private startAutoSettlement(): void {
    const task = cron.schedule('0 2 1 * *', async () => {
      const t = await sequelize.transaction();
      try {
        Logger.info('开始自动月度结算');

        const lastMonth = dayjs().subtract(1, 'month');
        const startDate = lastMonth.startOf('month').toDate();
        const endDate = lastMonth.endOf('month').toDate();

        const branches = await Branch.findAll();

        for (const branch of branches) {
          const orders = await Order.findAll({
            where: {
              createdAt: { [Op.between]: [startDate, endDate] },
              status: [OrderStatus.SIGNED, OrderStatus.DELIVERED],
              [Op.or]: [{ shipperBranchId: branch.id }, { receiverBranchId: branch.id }]
            },
            transaction: t
          });

          if (orders.length === 0) continue;

          let totalFreight = 0;
          let branchCommission = 0;
          let driverFreight = 0;

          orders.forEach(order => {
            const freight = parseFloat(order.freightAmount.toString());
            totalFreight += freight;
            branchCommission += freight * 0.1;
            driverFreight += freight * 0.6;
          });

          const netAmount = totalFreight - branchCommission - driverFreight;

          await Settlement.create(
            {
              settlementNo: `JS${dayjs().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 10000)}`,
              type: 'branch',
              branchId: branch.id,
              startDate,
              endDate,
              totalOrders: orders.length,
              totalFreight,
              branchCommission,
              driverFreight,
              otherCosts: 0,
              netAmount,
              status: SettlementStatus.PENDING
            },
            { transaction: t }
          );

          Logger.info(`网点 ${branch.name} 月度结算创建完成，订单数：${orders.length}`);
        }

        await t.commit();
        Logger.info('自动月度结算完成');
      } catch (error) {
        await t.rollback();
        Logger.error('自动月度结算失败', error);
      }
    });

    this.tasks.set('autoSettlement', task);
    Logger.info('自动月度结算定时任务已启动（每月1日2:00执行）');
  }

  private startOrderStatusCleanup(): void {
    const task = cron.schedule('0 3 * * *', async () => {
      try {
        Logger.info('开始清理异常订单状态');

        const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
        const result = await Order.update(
          { status: OrderStatus.SIGNED },
          {
            where: {
              status: OrderStatus.DELIVERED,
              updatedAt: { [Op.lte]: thirtyDaysAgo }
            }
          }
        );

        Logger.info(`订单状态清理完成，自动签收 ${result[0]} 个订单`);
      } catch (error) {
        Logger.error('订单状态清理失败', error);
      }
    });

    this.tasks.set('orderStatusCleanup', task);
    Logger.info('订单状态清理定时任务已启动（每天3:00执行）');
  }
}

export default new SchedulerService();

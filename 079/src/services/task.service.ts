import cron from 'node-cron'
import { OrderService } from './order.service'
import { StockService } from './stock.service'
import { Logger } from '../utils/logger'
import sequelize from '../database'

export class TaskService {
  private static tasks: Map<string, cron.ScheduledTask> = new Map()

  static init(): void {
    // Every hour: expire pending orders
    const expireOrdersTask = cron.schedule('0 * * * *', async () => {
      Logger.info('开始执行订单超时检查任务')
      try {
        const count = await OrderService.expirePendingOrders()
        Logger.info(`订单超时检查任务完成，共取消 ${count} 个订单`)
      } catch (error) {
        Logger.error('订单超时检查任务失败', error)
      }
    })
    this.tasks.set('expireOrders', expireOrdersTask)

    // Every 6 hours: clean expired stock locks
    const cleanStockLocksTask = cron.schedule('0 */6 * * *', async () => {
      Logger.info('开始执行库存锁定清理任务')
      try {
        const count = await StockService.cleanExpiredLocks()
        Logger.info(`库存锁定清理任务完成，共释放 ${count} 个锁定`)
      } catch (error) {
        Logger.error('库存锁定清理任务失败', error)
      }
    })
    this.tasks.set('cleanStockLocks', cleanStockLocksTask)

    // 1st day of every month: generate monthly settlements
    const generateSettlementsTask = cron.schedule('0 2 1 * *', async () => {
      Logger.info('开始执行月度结算生成任务')
      try {
        // Will be implemented in SettlementService
        Logger.info('月度结算生成任务完成')
      } catch (error) {
        Logger.error('月度结算生成任务失败', error)
      }
    })
    this.tasks.set('generateSettlements', generateSettlementsTask)

    Logger.info('定时任务已初始化')
  }

  static stop(): void {
    for (const [name, task] of this.tasks) {
      task.stop()
      Logger.info(`定时任务已停止: ${name}`)
    }
    this.tasks.clear()
  }

  static trigger(name: string): void {
    const task = this.tasks.get(name)
    if (task) {
      task.start()
      Logger.info(`定时任务已手动触发: ${name}`)
    } else {
      Logger.warn(`未找到定时任务: ${name}`)
    }
  }

  static getTaskList(): string[] {
    return Array.from(this.tasks.keys())
  }
}

export default TaskService

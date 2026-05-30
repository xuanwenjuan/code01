import { Transaction } from 'sequelize'
import { Settlement, Order, OrderItem, Dealer, User, Product } from '../models'
import { SettlementStatus, OrderStatus } from '../types'
import { AppError, NotFoundError, BadRequestError } from '../middlewares/error.middleware'
import { Logger } from '../utils/logger'
import sequelize from '../database'

interface SettlementPeriod {
  dealerId: number
  startDate: Date
  endDate: Date
}

export class SettlementService {
  static generateSettlementNo(): string {
    const now = new Date()
    const year = now.getFullYear().toString().padStart(4, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ST${year}${month}${day}${random}`
  }

  static calculateRebate(dealer: Dealer, totalAmount: number): number {
    const rebateRate = Number(dealer.rebateRate) || 0
    return totalAmount * (rebateRate / 100)
  }

  static async createSettlement(
    { dealerId, startDate, endDate }: SettlementPeriod,
    operatorId: number
  ): Promise<Settlement> {
    const transaction = await sequelize.transaction()

    try {
      const dealer = await Dealer.findByPk(dealerId, { transaction, lock: true })
      if (!dealer) {
        throw new NotFoundError('经销商不存在')
      }

      const orders = await Order.findAll({
        where: {
          dealerId,
          status: OrderStatus.SIGNED,
          createdAt: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        include: [{ model: OrderItem, as: 'items' }],
        transaction
      })

      if (orders.length === 0) {
        throw new BadRequestError('该时间段内没有已完成的订单')
      }

      const totalOrderAmount = orders.reduce((sum, order) => {
        return sum + Number(order.totalAmount)
      }, 0)

      const totalRebateAmount = this.calculateRebate(dealer, totalOrderAmount)
      const totalSettlementAmount = totalOrderAmount - totalRebateAmount

      const settlement = await Settlement.create(
        {
          settlementNo: this.generateSettlementNo(),
          dealerId,
          startDate,
          endDate,
          totalOrderAmount,
          totalRebateAmount,
          totalSettlementAmount,
          paidAmount: 0,
          status: SettlementStatus.PENDING,
          operatorId
        },
        { transaction }
      )

      await transaction.commit()

      Logger.info(`结算单创建成功`, { settlementId: settlement.id, dealerId })
      return settlement
    } catch (error) {
      await transaction.rollback()
      Logger.error(`结算单创建失败`, { dealerId, error })
      throw error
    }
  }

  static async getSettlementDetail(settlementId: number): Promise<{
    settlement: Settlement
    orders: Order[]
  }> {
    const settlement = await Settlement.findByPk(settlementId, {
      include: [{
        model: Dealer,
        as: 'dealer',
        include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }
      }]
    })

    if (!settlement) {
      throw new NotFoundError('结算单不存在')
    }

    const orders = await Order.findAll({
      where: {
        dealerId: settlement.dealerId,
        status: OrderStatus.SIGNED,
        createdAt: {
          [sequelize.Op.between]: [settlement.startDate, settlement.endDate]
        }
      },
      include: [{ model: OrderItem, as: 'items' }]
    })

    return { settlement, orders }
  }

  static async updateSettlementStatus(
    settlementId: number,
    status: SettlementStatus,
    paidAmount: number,
    remarks: string | undefined,
    operatorId: number
  ): Promise<void> {
    const transaction = await sequelize.transaction()

    try {
      const settlement = await Settlement.findByPk(settlementId, {
        transaction,
        lock: true
      })

      if (!settlement) {
        throw new NotFoundError('结算单不存在')
      }

      if (status === SettlementStatus.COMPLETED && paidAmount < settlement.totalSettlementAmount) {
        throw new BadRequestError('结算金额不足')
      }

      await settlement.update(
        {
          status,
          paidAmount,
          remarks,
          operatorId
        },
        { transaction }
      )

      await transaction.commit()

      Logger.info(`结算单状态更新成功`, { settlementId, status })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  static async getDealerStatistics(
    dealerId: number,
    year: number,
    quarter?: number,
    month?: number
  ): Promise<{
    totalOrderAmount: number
    orderCount: number
    rebateRate: number
    rebateAmount: number
    settlementAmount: number
    topProducts: { productId: number; productName: string; quantity: number; amount: number }[]
  }> {
    let startDate: Date, endDate: Date

    if (month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0)
    } else if (quarter) {
      switch (quarter) {
        case 1:
          startDate = new Date(year, 0, 1)
          endDate = new Date(year, 2, 31)
          break
        case 2:
          startDate = new Date(year, 3, 1)
          endDate = new Date(year, 5, 30)
          break
        case 3:
          startDate = new Date(year, 6, 1)
          endDate = new Date(year, 8, 30)
          break
        case 4:
          startDate = new Date(year, 9, 1)
          endDate = new Date(year, 11, 31)
          break
        default:
          startDate = new Date(year, 0, 1)
          endDate = new Date(year, 11, 31)
      }
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    }

    const orders = await Order.findAll({
      where: {
        dealerId,
        status: OrderStatus.SIGNED,
        createdAt: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: OrderItem, as: 'items' }]
    })

    const totalOrderAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const orderCount = orders.length

    const dealer = await Dealer.findByPk(dealerId)
    const rebateRate = dealer ? Number(dealer.rebateRate) : 0
    const rebateAmount = totalOrderAmount * (rebateRate / 100)
    const settlementAmount = totalOrderAmount - rebateAmount

    const productStats = new Map<number, { productName: string; quantity: number; amount: number }>()

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productStats.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.amount += Number(item.totalPrice)
        } else {
          productStats.set(item.productId, {
            productName: item.productName,
            quantity: item.quantity,
            amount: Number(item.totalPrice)
          })
        }
      }
    }

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        ...stats
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    return {
      totalOrderAmount,
      orderCount,
      rebateRate,
      rebateAmount,
      settlementAmount,
      topProducts
    }
  }

  static async generateMonthlySettlements(year: number, month: number, operatorId: number): Promise<Settlement[]> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const dealers = await Dealer.findAll({ where: { status: true } })
    const settlements: Settlement[] = []

    for (const dealer of dealers) {
      try {
        const settlement = await this.createSettlement(
          { dealerId: dealer.id, startDate, endDate },
          operatorId
        )
        settlements.push(settlement)
      } catch (error) {
        Logger.warn(`经销商结算单创建失败`, { dealerId: dealer.id, error })
      }
    }

    return settlements
  }

  static async getSettlementList(
    filters: {
      dealerId?: number
      status?: SettlementStatus
      startDate?: Date
      endDate?: Date
    },
    page: number,
    pageSize: number
  ): Promise<{ count: number; rows: Settlement[] }> {
    const where: any = {}

    if (filters.dealerId) where.dealerId = filters.dealerId
    if (filters.status) where.status = filters.status
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [sequelize.Op.between]: [filters.startDate, filters.endDate]
      }
    }

    return await Settlement.findAndCountAll({
      where,
      include: [
        {
          model: Dealer,
          as: 'dealer',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        }
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    })
  }
}

export default SettlementService

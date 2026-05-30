import { Transaction } from 'sequelize'
import { Product, StockLock } from '../models'
import { StockLockType, StockLockStatus } from '../types'
import { BadRequestError, NotFoundError, ConflictError } from '../middlewares/error.middleware'
import { Logger } from '../utils/logger'
import sequelize from '../database'

export class StockService {
  static async lockStock(
    productId: number,
    quantity: number,
    orderId: number,
    operatorId: number,
    lockType: StockLockType = StockLockType.ORDER,
    t?: Transaction
  ): Promise<StockLock> {
    const transaction = t || (await sequelize.transaction())

    try {
      const product = await Product.findByPk(productId, { transaction, lock: true })
      if (!product) {
        throw new NotFoundError(`商品ID ${productId} 不存在`)
      }

      if (!product.status) {
        throw new BadRequestError(`商品 ${product.name} 已下架`)
      }

      const availableStock = product.stock - product.lockedStock
      if (availableStock < quantity) {
        throw new ConflictError(`商品 ${product.name} 库存不足，可用库存: ${availableStock}`)
      }

      await Product.decrement(
        { lockedStock: quantity },
        { where: { id: productId }, transaction }
      )

      const expiredAt = new Date()
      expiredAt.setHours(expiredAt.getHours() + 24)

      const stockLock = await StockLock.create(
        {
          productId,
          orderId,
          lockType,
          lockQuantity: quantity,
          lockStatus: StockLockStatus.LOCKED,
          operatorId,
          expiredAt
        },
        { transaction }
      )

      if (!t) {
        await transaction.commit()
      }

      Logger.info(`库存锁定成功`, { productId, orderId, quantity })
      return stockLock
    } catch (error) {
      if (!t) {
        await transaction.rollback()
      }
      throw error
    }
  }

  static async unlockStock(
    stockLockId: number,
    t?: Transaction
  ): Promise<void> {
    const transaction = t || (await sequelize.transaction())

    try {
      const stockLock = await StockLock.findByPk(stockLockId, { transaction, lock: true })
      if (!stockLock) {
        throw new NotFoundError('库存锁定记录不存在')
      }

      if (stockLock.lockStatus !== StockLockStatus.LOCKED) {
        throw new BadRequestError('库存锁定记录状态无效')
      }

      await Product.increment(
        { lockedStock: -stockLock.lockQuantity },
        { where: { id: stockLock.productId }, transaction }
      )

      await stockLock.update(
        {
          lockStatus: StockLockStatus.RELEASED,
          unlockedAt: new Date()
        },
        { transaction }
      )

      if (!t) {
        await transaction.commit()
      }

      Logger.info(`库存解锁成功`, { stockLockId, productId: stockLock.productId, quantity: stockLock.lockQuantity })
    } catch (error) {
      if (!t) {
        await transaction.rollback()
      }
      throw error
    }
  }

  static async unlockStockByOrder(
    orderId: number,
    t?: Transaction
  ): Promise<void> {
    const transaction = t || (await sequelize.transaction())

    try {
      const stockLocks = await StockLock.findAll({
        where: { orderId, lockStatus: StockLockStatus.LOCKED },
        lock: true,
        transaction
      })

      for (const stockLock of stockLocks) {
        await Product.increment(
          { lockedStock: -stockLock.lockQuantity },
          { where: { id: stockLock.productId }, transaction }
        )

        await stockLock.update(
          {
            lockStatus: StockLockStatus.RELEASED,
            unlockedAt: new Date()
          },
          { transaction }
        )
      }

      if (!t) {
        await transaction.commit()
      }

      Logger.info(`订单库存批量解锁成功`, { orderId, count: stockLocks.length })
    } catch (error) {
      if (!t) {
        await transaction.rollback()
      }
      throw error
    }
  }

  static async consumeStock(
    orderId: number,
    t?: Transaction
  ): Promise<void> {
    const transaction = t || (await sequelize.transaction())

    try {
      const stockLocks = await StockLock.findAll({
        where: { orderId, lockStatus: StockLockStatus.LOCKED },
        lock: true,
        transaction
      })

      for (const stockLock of stockLocks) {
        await Product.decrement(
          { stock: stockLock.lockQuantity, lockedStock: stockLock.lockQuantity },
          { where: { id: stockLock.productId }, transaction }
        )

        await stockLock.update(
          {
            lockStatus: StockLockStatus.CONSUMED,
            unlockedAt: new Date()
          },
          { transaction }
        )
      }

      if (!t) {
        await transaction.commit()
      }

      Logger.info(`库存扣减成功`, { orderId, count: stockLocks.length })
    } catch (error) {
      if (!t) {
        await transaction.rollback()
      }
      throw error
    }
  }

  static async cleanExpiredLocks(): Promise<number> {
    const transaction = await sequelize.transaction()

    try {
      const now = new Date()
      const expiredLocks = await StockLock.findAll({
        where: {
          lockStatus: StockLockStatus.LOCKED,
          expiredAt: { [sequelize.Op.lte]: now }
        },
        lock: true,
        transaction
      })

      for (const stockLock of expiredLocks) {
        await Product.increment(
          { lockedStock: -stockLock.lockQuantity },
          { where: { id: stockLock.productId }, transaction }
        )

        await stockLock.update(
          {
            lockStatus: StockLockStatus.RELEASED,
            unlockedAt: now
          },
          { transaction }
        )
      }

      await transaction.commit()

      Logger.info(`过期库存锁定清理完成`, { count: expiredLocks.length })
      return expiredLocks.length
    } catch (error) {
      await transaction.rollback()
      Logger.error(`过期库存锁定清理失败`, error)
      throw error
    }
  }

  static async getProductStock(productId: number): Promise<{
    totalStock: number
    lockedStock: number
    availableStock: number
  }> {
    const product = await Product.findByPk(productId, {
      attributes: ['stock', 'lockedStock']
    })

    if (!product) {
      throw new NotFoundError('商品不存在')
    }

    return {
      totalStock: product.stock,
      lockedStock: product.lockedStock,
      availableStock: product.stock - product.lockedStock
    }
  }

  static async addStock(
    productId: number,
    quantity: number,
    operatorId: number,
    t?: Transaction
  ): Promise<void> {
    const transaction = t || (await sequelize.transaction())

    try {
      const product = await Product.findByPk(productId, { transaction, lock: true })
      if (!product) {
        throw new NotFoundError('商品不存在')
      }

      await product.increment({ stock: quantity }, { transaction })

      if (!t) {
        await transaction.commit()
      }

      Logger.info(`库存增加成功`, { productId, quantity, operatorId })
    } catch (error) {
      if (!t) {
        await transaction.rollback()
      }
      throw error
    }
  }
}

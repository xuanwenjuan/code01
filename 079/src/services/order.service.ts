import { Transaction } from 'sequelize'
import { Order, OrderItem, Product, Dealer, User } from '../models'
import { OrderStatus, OperationModule, OperationAction } from '../types'
import { AppError, NotFoundError, BadRequestError } from '../middlewares/error.middleware'
import { Logger } from '../utils/logger'
import sequelize from '../database'
import { v4 as uuidv4 } from 'uuid'
import { StockService } from './stock.service'

interface OrderItemData {
  items: { productId: number; quantity: number }[]
  shippingAddress: string
  shippingContact: string
  shippingPhone: string
  remarks?: string
}

export class OrderService {
  static generateOrderNo(): string {
    const now = new Date()
    const year = now.getFullYear().toString().padStart(4, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `OR${year}${month}${day}${random}`
  }

  static async createOrder(
    dealerId: number,
    orderData: OrderItemData,
    operatorId: number
  ): Promise<Order> {
    const transaction = await sequelize.transaction()

    try {
      const dealer = await Dealer.findByPk(dealerId, {
      transaction,
      lock: true
    })
    if (!dealer) {
      throw new NotFoundError('经销商不存在')
    }

    const { items, shippingAddress, shippingContact, shippingPhone, remarks } = orderData

    let productAmount = 0
    const orderItems: any[] = []

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: true
      })
      if (!product) {
        throw new NotFoundError(`商品ID ${item.productId} 不存在`)
      }
      if (!product.status) {
        throw new BadRequestError(`商品 ${product.name} 已下架`)
      }
      if (item.quantity < product.minOrderQuantity) {
        throw new BadRequestError(`商品 ${product.name} 未达到起订量 ${product.minOrderQuantity}`)
      }

      const availableStock = product.stock - product.lockedStock
      if (availableStock < item.quantity) {
        throw new BadRequestError(`商品 ${product.name} 库存不足，可用库存: ${availableStock}`)
      }

      const itemTotal = Number(product.wholesalePrice) * item.quantity
      productAmount += itemTotal

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        productImage: product.image,
        specification: product.specification,
        unit: product.unit,
        unitPrice: product.wholesalePrice,
        quantity: item.quantity,
        totalPrice: itemTotal
      })
    }

    const order = await Order.create(
      {
        orderNo: this.generateOrderNo(),
        dealerId,
        productAmount,
        totalAmount: productAmount,
        discountAmount: 0,
        shippingFee: 0,
        paidAmount: 0,
        rebateAmount: 0,
        status: OrderStatus.PENDING_PAYMENT,
        shippingAddress,
        shippingContact,
        shippingPhone,
        remarks,
        operatorId
      },
      { transaction }
    )

    for (const item of orderItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          ...item
        },
        { transaction }
      )
    }

    for (const item of items) {
      await StockService.lockStock(
        item.productId,
        item.quantity,
        order.id,
        operatorId,
        undefined,
        transaction
      )
    }

    await transaction.commit()

    Logger.info(`订单创建成功`, { orderId: order.id, dealerId })

    const fullOrder = await Order.findByPk(order.id, {
      include: [
      { model: OrderItem, as: 'items' },
      { model: Dealer, as: 'dealer', include: [{ model: User, as: 'user' } }
    ]
    })

    return fullOrder!
  } catch (error) {
    await transaction.rollback()
    Logger.error(`订单创建失败`, { dealerId, error })
    throw error
  }
}

static async cancelOrder(
  orderId: number,
  reason: string,
  operatorId: number
): Promise<void> {
  const transaction = await sequelize.transaction()

  try {
    const order = await Order.findByPk(orderId, { transaction, lock: true })
    if (!order) {
      throw new NotFoundError('订单不存在')
    }

    if (order.status === OrderStatus.SIGNED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError('订单状态不允许取消')
    }

    await StockService.unlockStockByOrder(orderId, transaction)

    await order.update(
      {
        status: OrderStatus.CANCELLED,
        cancelledTime: new Date(),
        cancelledReason: reason,
        operatorId
      },
      { transaction }
    )

    await transaction.commit()

    Logger.info(`订单取消成功`, { orderId, reason })
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

static async payOrder(
  orderId: number,
  operatorId: number
): Promise<void> {
  const transaction = await sequelize.transaction()

  try {
    const order = await Order.findByPk(orderId, { transaction, lock: true })
    if (!order) {
      throw new NotFoundError('订单不存在')
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestError('订单状态不允许支付')
    }

    await order.update(
      {
        status: OrderStatus.PAID,
        paidAmount: order.totalAmount,
        paymentTime: new Date(),
        operatorId
      },
      { transaction }
    )

    await transaction.commit()

    Logger.info(`订单支付成功`, { orderId })
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

static async shipOrder(
  orderId: number,
  trackingNumber: string,
  operatorId: number
): Promise<void> {
  const transaction = await sequelize.transaction()

  try {
    const order = await Order.findByPk(orderId, { transaction, lock: true })
    if (!order) {
      throw new NotFoundError('订单不存在')
    }

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.ALLOCATING) {
      throw new BadRequestError('订单状态不允许发货')
    }

    await order.update(
      {
        status: OrderStatus.SHIPPED,
        trackingNumber,
        shippingTime: new Date(),
        operatorId
      },
      { transaction }
    )

    await transaction.commit()

    Logger.info(`订单发货成功`, { orderId, trackingNumber })
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

static async signOrder(
  orderId: number,
  operatorId: number
): Promise<void> {
  const transaction = await sequelize.transaction()

  try {
    const order = await Order.findByPk(orderId, { transaction, lock: true })
    if (!order) {
      throw new NotFoundError('订单不存在')
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestError('订单状态不允许签收')
    }

    await order.update(
      {
        status: OrderStatus.SIGNED,
        signedTime: new Date(),
        operatorId
      },
      { transaction }
    )

    await StockService.consumeStock(orderId, transaction)

    await transaction.commit()

    Logger.info(`订单签收成功`, { orderId })
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

static async getOrderDetail(orderId: number): Promise<Order> {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: Dealer, as: 'dealer', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } } }
    ]
  })

  if (!order) {
    throw new NotFoundError('订单不存在')
  }

  return order
}

static async getOrderList(
  filters: {
    dealerId?: number
    status?: OrderStatus
    startDate?: Date
    endDate?: Date
    keyword?: string
  },
  page: number,
  pageSize: number
): Promise<{ count: number; rows: Order[] }> {
  const where: any = {}

  if (filters.dealerId) where.dealerId = filters.dealerId
  if (filters.status) where.status = filters.status
  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      [sequelize.Op.between]: [filters.startDate, filters.endDate]
    }
  }
  if (filters.keyword) {
    where[sequelize.Op.or] = [
      { orderNo: { [sequelize.Op.like]: `%${filters.keyword}%` } },
      { shippingContact: { [sequelize.Op.like]: `%${filters.keyword}%` } }
    ]
  }

  return await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: 'items' },
      { model: Dealer, as: 'dealer', include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } } }
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  })
}

static async expirePendingOrders(): Promise<number> {
  const twentyFourHoursAgo = new Date()
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

  const pendingOrders = await Order.findAll({
    where: {
      status: OrderStatus.PENDING_PAYMENT,
      createdAt: { [sequelize.Op.lte]: twentyFourHoursAgo }
    }
  })

  for (const order of pendingOrders) {
    try {
      await this.cancelOrder(order.id, '订单超时自动取消', 0)
    } catch (error) {
      Logger.error(`订单自动取消失败`, { orderId: order.id })
    }
  }

  return pendingOrders.length
}
}

export default OrderService

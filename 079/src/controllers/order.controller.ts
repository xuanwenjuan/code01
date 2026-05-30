import { Response } from 'express'
import { ResponseUtil } from '../utils/response'
import { AuthRequest } from '../middlewares/auth.middleware'
import { OperationModule, OperationAction, OrderStatus, UserRole } from '../types'
import { OrderService } from '../services/order.service'
import { logOperation } from '../middlewares/log.middleware'
import { Dealer, User } from '../models'
import { BadRequestError, ForbiddenError, NotFoundError } from '../middlewares/error.middleware'

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { items, shippingAddress, shippingContact, shippingPhone, remarks } = req.body

  try {
    const dealer = await Dealer.findOne({ where: { userId: req.user!.userId } })
    if (!dealer) {
      throw new BadRequestError('经销商信息不存在')
    }

    const order = await OrderService.createOrder(
      dealer.id,
      { items, shippingAddress, shippingContact, shippingPhone, remarks },
      req.user!.userId
    )

    await logOperation(OperationModule.ORDER, OperationAction.CREATE, req, true, {
      params: { items, shippingAddress },
      result: JSON.stringify({ orderId: order.id, orderNo: order.orderNo }),
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(order, '下单成功'))
  } catch (error) {
    await logOperation(OperationModule.ORDER, OperationAction.CREATE, req, false, {
      params: { items, shippingAddress },
      errorMsg: error instanceof Error ? error.message : '下单失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { id } = req.params
  const { status, trackingNumber, reason } = req.body
  const operatorId = req.user!.userId

  try {
    switch (status) {
      case OrderStatus.PAID:
        await OrderService.payOrder(Number(id), operatorId)
        break
      case OrderStatus.SHIPPED:
        if (!trackingNumber) {
          throw new BadRequestError('物流单号不能为空')
        }
        await OrderService.shipOrder(Number(id), trackingNumber, operatorId)
        break
      case OrderStatus.SIGNED:
        await OrderService.signOrder(Number(id), operatorId)
        break
      case OrderStatus.CANCELLED:
        await OrderService.cancelOrder(Number(id), reason || '手动取消', operatorId)
        break
      default:
        throw new BadRequestError('不支持的订单状态')
    }

    await logOperation(OperationModule.ORDER, OperationAction.UPDATE, req, true, {
      params: { id, status, trackingNumber, reason },
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(null, '状态更新成功'))
  } catch (error) {
    await logOperation(OperationModule.ORDER, OperationAction.UPDATE, req, false, {
      params: { id, status, trackingNumber, reason },
      errorMsg: error instanceof Error ? error.message : '状态更新失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const getOrderList = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, pageSize = 10, status, startDate, endDate, keyword } = req.query

  const filters: any = {}
  if (status) filters.status = status
  if (startDate) filters.startDate = new Date(startDate as string)
  if (endDate) filters.endDate = new Date(endDate as string)
  if (keyword) filters.keyword = keyword

  if (req.user!.role === UserRole.DEALER) {
    const dealer = await Dealer.findOne({ where: { userId: req.user!.userId } })
    if (!dealer) {
      throw new BadRequestError('经销商信息不存在')
    }
    filters.dealerId = dealer.id
  }

  const { count, rows } = await OrderService.getOrderList(filters, Number(page), Number(pageSize))

  res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)))
}

export const getOrderDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const order = await OrderService.getOrderDetail(Number(id))

  if (req.user!.role === UserRole.DEALER) {
    const dealer = await Dealer.findOne({ where: { userId: req.user!.userId } })
    if (!dealer || order.dealerId !== dealer.id) {
      throw new ForbiddenError('无权查看此订单')
    }
  }

  res.json(ResponseUtil.success(order, '获取成功'))
}

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { id } = req.params
  const { reason } = req.body

  try {
    const order = await OrderService.getOrderDetail(Number(id))

    if (req.user!.role === UserRole.DEALER) {
      const dealer = await Dealer.findOne({ where: { userId: req.user!.userId } })
      if (!dealer || order.dealerId !== dealer.id) {
        throw new ForbiddenError('无权取消此订单')
      }
    }

    await OrderService.cancelOrder(Number(id), reason || '用户取消', req.user!.userId)

    await logOperation(OperationModule.ORDER, OperationAction.CANCEL, req, true, {
      params: { id, reason },
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(null, '取消成功'))
  } catch (error) {
    await logOperation(OperationModule.ORDER, OperationAction.CANCEL, req, false, {
      params: { id, reason },
      errorMsg: error instanceof Error ? error.message : '取消失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

import { Router } from 'express'
import { createOrder, updateOrderStatus, getOrderList, getOrderDetail, cancelOrder } from '../controllers/order.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate, validateParams } from '../middlewares/validation.middleware'
import { createOrderSchema, updateOrderStatusSchema, cancelOrderSchema, orderIdSchema } from '../validations/order.validation'
import { UserRole } from '../types'

const router = Router()

router.use(authenticate)

router.post('/', authorize(UserRole.DEALER), validate(createOrderSchema), createOrder)
router.get('/', getOrderList)
router.get('/:id', validateParams(orderIdSchema), getOrderDetail)
router.put('/:id/status', validateParams(orderIdSchema), validate(updateOrderStatusSchema), authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE), updateOrderStatus)
router.delete('/:id/cancel', validateParams(orderIdSchema), validate(cancelOrderSchema), authorize(UserRole.DEALER, UserRole.ADMIN), cancelOrder)

export default router

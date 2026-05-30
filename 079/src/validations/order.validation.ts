import Joi from 'joi'
import { OrderStatus } from '../types'

const orderItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    'number.base': '商品ID必须是数字',
    'number.integer': '商品ID必须是整数',
    'number.positive': '商品ID必须是正整数',
    'any.required': '商品ID是必填项'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': '数量必须是数字',
    'number.integer': '数量必须是整数',
    'number.min': '数量不能小于1',
    'any.required': '数量是必填项'
  })
})

export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'array.base': '商品列表必须是数组',
    'array.min': '至少选择一个商品',
    'any.required': '商品列表是必填项'
  }),
  shippingAddress: Joi.string().min(5).max(500).required().messages({
    'string.base': '收货地址必须是字符串',
    'string.empty': '收货地址不能为空',
    'string.min': '收货地址至少5个字符',
    'string.max': '收货地址最多500个字符',
    'any.required': '收货地址是必填项'
  }),
  shippingContact: Joi.string().min(2).max(50).required().messages({
    'string.base': '收货人必须是字符串',
    'string.empty': '收货人不能为空',
    'string.min': '收货人至少2个字符',
    'string.max': '收货人最多50个字符',
    'any.required': '收货人是必填项'
  }),
  shippingPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.base': '收货电话必须是字符串',
    'string.empty': '收货电话不能为空',
    'string.pattern.base': '收货电话格式不正确',
    'any.required': '收货电话是必填项'
  }),
  remarks: Joi.string().allow(null, '').messages({
    'string.base': '备注必须是字符串'
  })
})

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(OrderStatus)).required().messages({
    'string.base': '订单状态必须是字符串',
    'any.only': `订单状态必须是: ${Object.values(OrderStatus).join(', ')}`,
    'any.required': '订单状态是必填项'
  }),
  trackingNumber: Joi.string().max(100).allow(null, '').messages({
    'string.base': '物流单号必须是字符串',
    'string.max': '物流单号最多100个字符'
  }),
  cancelledReason: Joi.string().max(500).allow(null, '').messages({
    'string.base': '取消原因必须是字符串',
    'string.max': '取消原因最多500个字符'
  })
})

export const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).allow(null, '').messages({
    'string.base': '取消原因必须是字符串',
    'string.max': '取消原因最多500个字符'
  })
})

export const orderIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '订单ID必须是数字',
    'number.integer': '订单ID必须是整数',
    'number.positive': '订单ID必须是正整数',
    'any.required': '订单ID是必填项'
  })
})

import Joi from 'joi';
import { OrderStatus } from '../types';

export const createOrderSchema = Joi.object({
  body: Joi.object({
    serviceCategoryId: Joi.string().uuid().required().messages({
      'string.uuid': '服务类目ID格式无效',
      'any.required': '服务类目ID不能为空'
    }),
    serviceAddress: Joi.string().min(5).max(255).required().messages({
      'string.min': '服务地址至少5个字符',
      'any.required': '服务地址不能为空'
    }),
    serviceTime: Joi.date().iso().greater('now').required().messages({
      'date.greater': '服务时间必须晚于当前时间',
      'any.required': '服务时间不能为空'
    }),
    serviceDuration: Joi.number().integer().min(1).optional(),
    serviceContent: Joi.string().max(1000).optional(),
    contactName: Joi.string().min(1).max(50).required().messages({
      'string.min': '联系人姓名至少1个字符',
      'any.required': '联系人姓名不能为空'
    }),
    contactPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入有效的联系电话',
      'any.required': '联系电话不能为空'
    }),
    totalAmount: Joi.number().min(0).required().messages({
      'number.min': '订单金额不能小于0',
      'any.required': '订单金额不能为空'
    }),
    discountAmount: Joi.number().min(0).default(0),
    remark: Joi.string().max(500).optional()
  })
});

export const assignOrderSchema = Joi.object({
  params: Joi.object({
    orderId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    workerId: Joi.string().uuid().required().messages({
      'string.uuid': '师傅ID格式无效',
      'any.required': '师傅ID不能为空'
    })
  })
});

export const updateOrderStatusSchema = Joi.object({
  params: Joi.object({
    orderId: Joi.string().uuid().required(),
    status: Joi.string().valid(...Object.values(OrderStatus)).required()
  }),
  body: Joi.object({
    remark: Joi.string().max(500).optional()
  })
});

export const getOrderListSchema = Joi.object({
  query: Joi.object({
    status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  })
});

export const orderIdSchema = Joi.object({
  params: Joi.object({
    orderId: Joi.string().uuid().required().messages({
      'string.uuid': '订单ID格式无效',
      'any.required': '订单ID不能为空'
    })
  })
});

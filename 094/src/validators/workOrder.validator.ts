import Joi from 'joi';

export const createWorkOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(50).required().messages({
    'string.empty': '客户姓名不能为空',
    'string.min': '客户姓名长度不能少于2位',
    'string.max': '客户姓名长度不能超过50位',
    'any.required': '客户姓名是必填项',
  }),
  customerPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确',
  }),
  customerAddress: Joi.string().max(500).optional().messages({
    'string.max': '地址长度不能超过500位',
  }),
  productName: Joi.string().min(2).max(100).required().messages({
    'string.empty': '产品名称不能为空',
    'string.min': '产品名称长度不能少于2位',
    'string.max': '产品名称长度不能超过100位',
    'any.required': '产品名称是必填项',
  }),
  patternDesign: Joi.string().max(2000).optional().messages({
    'string.max': '纹样设计描述长度不能超过2000位',
  }),
  patternImage: Joi.string().uri().optional().allow('').messages({
    'string.uri': '纹样图片URL格式不正确',
  }),
  quantity: Joi.number().integer().positive().optional().default(1).messages({
    'number.base': '数量必须是数字',
    'number.integer': '数量必须是整数',
    'number.positive': '数量必须是正数',
  }),
  unitPrice: Joi.number().precision(2).min(0).optional().default(0).messages({
    'number.base': '单价必须是数字',
    'number.min': '单价不能为负数',
  }),
  depositAmount: Joi.number().precision(2).min(0).optional().default(0).messages({
    'number.base': '定金金额必须是数字',
    'number.min': '定金金额不能为负数',
  }),
  deadline: Joi.date().optional().messages({
    'date.base': '工期格式不正确',
  }),
  artisanId: Joi.number().integer().positive().optional().messages({
    'number.base': '匠人ID必须是数字',
    'number.integer': '匠人ID必须是整数',
    'number.positive': '匠人ID必须是正数',
  }),
  remark: Joi.string().max(1000).optional().allow('').messages({
    'string.max': '备注长度不能超过1000位',
  }),
});

export const updateWorkOrderSchema = Joi.object({
  customerName: Joi.string().min(2).max(50).optional().messages({
    'string.min': '客户姓名长度不能少于2位',
    'string.max': '客户姓名长度不能超过50位',
  }),
  customerPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().allow(null, '').messages({
    'string.pattern.base': '手机号格式不正确',
  }),
  customerAddress: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': '地址长度不能超过500位',
  }),
  productName: Joi.string().min(2).max(100).optional().messages({
    'string.min': '产品名称长度不能少于2位',
    'string.max': '产品名称长度不能超过100位',
  }),
  patternDesign: Joi.string().max(2000).optional().allow(null, '').messages({
    'string.max': '纹样设计描述长度不能超过2000位',
  }),
  patternImage: Joi.string().uri().optional().allow(null, '').messages({
    'string.uri': '纹样图片URL格式不正确',
  }),
  quantity: Joi.number().integer().positive().optional().messages({
    'number.base': '数量必须是数字',
    'number.integer': '数量必须是整数',
    'number.positive': '数量必须是正数',
  }),
  unitPrice: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '单价必须是数字',
    'number.min': '单价不能为负数',
  }),
  depositAmount: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '定金金额必须是数字',
    'number.min': '定金金额不能为负数',
  }),
  isDepositPaid: Joi.boolean().optional().messages({
    'boolean.base': 'isDepositPaid 必须是布尔值',
  }),
  deadline: Joi.date().optional().allow(null).messages({
    'date.base': '工期格式不正确',
  }),
  status: Joi.string()
    .valid('pending_deposit', 'confirmed', 'design_finalized', 'material_collected', 'in_production', 'quality_inspection', 'completed', 'delivered', 'cancelled', 'expired')
    .optional()
    .messages({
      'any.only': '无效的工单状态',
    }),
  artisanId: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': '匠人ID必须是数字',
    'number.integer': '匠人ID必须是整数',
    'number.positive': '匠人ID必须是正数',
  }),
  remark: Joi.string().max(1000).optional().allow(null, '').messages({
    'string.max': '备注长度不能超过1000位',
  }),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending_deposit', 'confirmed', 'design_finalized', 'material_collected', 'in_production', 'quality_inspection', 'completed', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': '无效的工单状态',
      'any.required': '状态是必填项',
    }),
  remark: Joi.string().max(1000).optional().allow('').messages({
    'string.max': '备注长度不能超过1000位',
  }),
  cancelledReason: Joi.string().when('status', {
    is: 'cancelled',
    then: Joi.string().min(5).max(500).required().messages({
      'string.min': '取消原因长度不能少于5位',
      'string.max': '取消原因长度不能超过500位',
      'any.required': '取消原因是必填项',
    }),
    otherwise: Joi.optional(),
  }),
  inspectorId: Joi.number().integer().positive().when('status', {
    is: 'quality_inspection',
    then: Joi.required().messages({
      'any.required': '质检员ID是必填项',
    }),
    otherwise: Joi.optional(),
  }),
});

export const payDepositSchema = Joi.object({
  depositAmount: Joi.number().precision(2).positive().required().messages({
    'number.base': '定金金额必须是数字',
    'number.positive': '定金金额必须是正数',
    'any.required': '定金金额是必填项',
  }),
  payMethod: Joi.string().valid('cash', 'wechat', 'alipay', 'bank_transfer').required().messages({
    'any.only': '支付方式只能是 cash、wechat、alipay、bank_transfer',
    'any.required': '支付方式是必填项',
  }),
  payRemark: Joi.string().max(500).optional().allow('').messages({
    'string.max': '支付备注长度不能超过500位',
  }),
});

import Joi from 'joi';
import { WorkOrderType, WorkOrderStatus } from '../models/WorkOrder';

export const createWorkOrderSchema = Joi.object({
  type: Joi.string().valid(...Object.values(WorkOrderType)).required().messages({
    'any.only': '工单类型不合法',
    'any.required': '工单类型不能为空'
  }),
  collectionId: Joi.number().integer().positive().required().messages({
    'number.base': '藏品ID必须是数字',
    'number.positive': '藏品ID必须是正数',
    'any.required': '藏品ID不能为空'
  }),
  customerName: Joi.string().min(1).max(50).required().messages({
    'string.base': '客户姓名必须是字符串',
    'string.min': '客户姓名至少1个字符',
    'string.max': '客户姓名最多50个字符',
    'any.required': '客户姓名不能为空'
  }),
  customerPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号格式不正确',
    'any.required': '客户电话不能为空'
  }),
  customerAddress: Joi.string().max(500).allow('').optional().messages({
    'string.max': '客户地址最多500个字符'
  }),
  faultDescription: Joi.string().allow('').optional().messages({
    'string.base': '故障描述必须是字符串'
  }),
  priority: Joi.number().integer().valid(0, 1, 2).default(1).messages({
    'any.only': '优先级只能是0(低)、1(中)、2(高)'
  })
});

export const updateWorkOrderSchema = Joi.object({
  type: Joi.string().valid(...Object.values(WorkOrderType)).optional().messages({
    'any.only': '工单类型不合法'
  }),
  collectionId: Joi.number().integer().positive().optional().messages({
    'number.base': '藏品ID必须是数字',
    'number.positive': '藏品ID必须是正数'
  }),
  customerName: Joi.string().min(1).max(50).optional().messages({
    'string.base': '客户姓名必须是字符串',
    'string.min': '客户姓名至少1个字符',
    'string.max': '客户姓名最多50个字符'
  }),
  customerPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确'
  }),
  customerAddress: Joi.string().max(500).allow('').optional().messages({
    'string.max': '客户地址最多500个字符'
  }),
  faultDescription: Joi.string().allow('').optional().messages({
    'string.base': '故障描述必须是字符串'
  }),
  inspectionReport: Joi.string().allow('').optional().messages({
    'string.base': '检测报告必须是字符串'
  }),
  estimatedCost: Joi.number().precision(2).positive().optional().messages({
    'number.base': '预估费用必须是数字',
    'number.positive': '预估费用必须是正数'
  }),
  quotationExpireTime: Joi.date().iso().optional().messages({
    'date.base': '报价过期时间格式不正确',
    'date.iso': '报价过期时间必须是ISO格式'
  }),
  repairerId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '维修师ID必须是数字',
    'number.positive': '维修师ID必须是正数'
  }),
  repairDescription: Joi.string().allow('').optional().messages({
    'string.base': '维修描述必须是字符串'
  }),
  actualCost: Joi.number().precision(2).positive().allow(null).optional().messages({
    'number.base': '实际费用必须是数字',
    'number.positive': '实际费用必须是正数'
  }),
  laborFee: Joi.number().precision(2).positive().allow(null).optional().messages({
    'number.base': '工时费必须是数字',
    'number.positive': '工时费必须是正数'
  }),
  partsFee: Joi.number().precision(2).positive().allow(null).optional().messages({
    'number.base': '配件费必须是数字',
    'number.positive': '配件费必须是正数'
  }),
  commissionRate: Joi.number().precision(2).positive().max(100).allow(null).optional().messages({
    'number.base': '佣金率必须是数字',
    'number.positive': '佣金率必须是正数',
    'number.max': '佣金率最大100'
  }),
  commissionAmount: Joi.number().precision(2).positive().allow(null).optional().messages({
    'number.base': '佣金金额必须是数字',
    'number.positive': '佣金金额必须是正数'
  }),
  salePrice: Joi.number().precision(2).positive().allow(null).optional().messages({
    'number.base': '售出价格必须是数字',
    'number.positive': '售出价格必须是正数'
  }),
  priority: Joi.number().integer().valid(0, 1, 2).optional().messages({
    'any.only': '优先级只能是0(低)、1(中)、2(高)'
  })
});

export const getWorkOrderListSchema = Joi.object({
  page: Joi.number().integer().positive().optional().messages({
    'number.base': '页码必须是数字',
    'number.positive': '页码必须是正数'
  }),
  pageSize: Joi.number().integer().positive().max(100).optional().messages({
    'number.base': '每页数量必须是数字',
    'number.positive': '每页数量必须是正数',
    'number.max': '每页数量最多100条'
  }),
  orderNo: Joi.string().optional().messages({
    'string.base': '工单编号必须是字符串'
  }),
  type: Joi.string().valid(...Object.values(WorkOrderType)).optional().messages({
    'any.only': '工单类型不合法'
  }),
  customerName: Joi.string().optional().messages({
    'string.base': '客户姓名必须是字符串'
  }),
  repairerId: Joi.number().integer().positive().optional().messages({
    'number.base': '维修师ID必须是数字',
    'number.positive': '维修师ID必须是正数'
  })
});

export const workOrderIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '工单ID必须是数字',
    'number.positive': '工单ID必须是正数',
    'any.required': '工单ID不能为空'
  })
});

export const assignRepairerSchema = Joi.object({
  repairerId: Joi.number().integer().positive().required().messages({
    'number.base': '维修师ID必须是数字',
    'number.positive': '维修师ID必须是正数',
    'any.required': '维修师ID不能为空'
  })
});

export const submitQuotationSchema = Joi.object({
  estimatedCost: Joi.number().precision(2).positive().required().messages({
    'number.base': '预估费用必须是数字',
    'number.positive': '预估费用必须是正数',
    'any.required': '预估费用不能为空'
  }),
  quotationExpireTime: Joi.date().iso().optional().messages({
    'date.base': '报价过期时间格式不正确',
    'date.iso': '报价过期时间必须是ISO格式'
  })
});

export const completeRepairSchema = Joi.object({
  repairDescription: Joi.string().required().messages({
    'string.base': '维修描述必须是字符串',
    'any.required': '维修描述不能为空'
  }),
  actualCost: Joi.number().precision(2).positive().required().messages({
    'number.base': '实际费用必须是数字',
    'number.positive': '实际费用必须是正数',
    'any.required': '实际费用不能为空'
  }),
  laborFee: Joi.number().precision(2).positive().optional().messages({
    'number.base': '工时费必须是数字',
    'number.positive': '工时费必须是正数'
  }),
  partsFee: Joi.number().precision(2).positive().optional().messages({
    'number.base': '配件费必须是数字',
    'number.positive': '配件费必须是正数'
  })
});

export const submitInspectionSchema = Joi.object({
  inspectionReport: Joi.string().required().messages({
    'string.base': '检测报告必须是字符串',
    'any.required': '检测报告不能为空'
  })
});

export const putOnConsignSchema = Joi.object({
  commissionRate: Joi.number().precision(2).positive().max(100).required().messages({
    'number.base': '佣金率必须是数字',
    'number.positive': '佣金率必须是正数',
    'number.max': '佣金率最大100',
    'any.required': '佣金率不能为空'
  })
});

export const markAsSoldSchema = Joi.object({
  salePrice: Joi.number().precision(2).positive().required().messages({
    'number.base': '售出价格必须是数字',
    'number.positive': '售出价格必须是正数',
    'any.required': '售出价格不能为空'
  }),
  commissionAmount: Joi.number().precision(2).positive().required().messages({
    'number.base': '佣金金额必须是数字',
    'number.positive': '佣金金额必须是正数',
    'any.required': '佣金金额不能为空'
  })
});

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';
import { BadRequestException } from '../exceptions/HttpException';

export const commonSchemas = {
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID必须是数字',
    'number.integer': 'ID必须是整数',
    'number.positive': 'ID必须是正数',
    'any.required': 'ID是必填项'
  }),
  
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.min': '页码最小为1'
  }),
  
  pageSize: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': '每页条数必须是数字',
    'number.integer': '每页条数必须是整数',
    'number.min': '每页条数最小为1',
    'number.max': '每页条数最大为100'
  }),
  
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.base': '名称必须是字符串',
    'string.empty': '名称不能为空',
    'string.min': '名称至少2个字符',
    'string.max': '名称最多50个字符',
    'any.required': '名称是必填项'
  }),
  
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({
    'string.pattern.base': '请输入正确的手机号码'
  }),
  
  email: Joi.string().email().messages({
    'string.email': '请输入正确的邮箱格式'
  }),
  
  status: Joi.string().valid('active', 'inactive').default('active'),
  
  code: Joi.string().trim().uppercase().min(3).max(30).required().messages({
    'string.base': '编码必须是字符串',
    'string.empty': '编码不能为空',
    'string.min': '编码至少3个字符',
    'string.max': '编码最多30个字符',
    'any.required': '编码是必填项'
  }),
  
  quantity: Joi.number().integer().min(0).required().messages({
    'number.base': '数量必须是数字',
    'number.integer': '数量必须是整数',
    'number.min': '数量不能小于0',
    'any.required': '数量是必填项'
  }),
  
  price: Joi.number().precision(2).min(0).messages({
    'number.base': '价格必须是数字',
    'number.min': '价格不能小于0',
    'number.precision': '价格最多保留2位小数'
  }),
  
  areaId: Joi.number().integer().positive().allow(null).messages({
    'number.base': '片区ID必须是数字',
    'number.integer': '片区ID必须是整数',
    'number.positive': '片区ID必须是正数'
  }),
  
  categoryId: Joi.number().integer().positive().allow(null).messages({
    'number.base': '分类ID必须是数字',
    'number.integer': '分类ID必须是整数',
    'number.positive': '分类ID必须是正数'
  }),
  
  userId: Joi.number().integer().positive().messages({
    'number.base': '用户ID必须是数字',
    'number.integer': '用户ID必须是整数',
    'number.positive': '用户ID必须是正数'
  }),
  
  dateRange: {
    startDate: Joi.date().iso().messages({
      'date.base': '开始日期格式不正确',
      'date.iso': '开始日期请使用ISO格式'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
      'date.base': '结束日期格式不正确',
      'date.iso': '结束日期请使用ISO格式',
      'date.min': '结束日期不能早于开始日期'
    })
  },

  healthStatus: Joi.string().valid('excellent', 'good', 'fair', 'poor').allow(null).messages({
    'any.only': '健康状态只能是 excellent, good, fair, poor 之一'
  }),

  workOrderStatus: Joi.string().valid('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'verified', 'cancelled', 'overdue').allow(null),
  
  workOrderType: Joi.string().valid('watering', 'pruning', 'pest_control', 'fertilizing', 'transplanting', 'other').allow(null)
};

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(d => d.message);
      return ResponseUtil.validationError(res, errors);
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(d => d.message);
      return ResponseUtil.validationError(res, errors);
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(d => d.message);
      return ResponseUtil.validationError(res, errors);
    }

    req.params = value;
    next();
  };
};

export const validateId = validateParams(
  Joi.object({
    id: commonSchemas.id
  })
);

export const validatePagination = validateQuery(
  Joi.object({
    page: commonSchemas.page,
    pageSize: commonSchemas.pageSize
  })
);

export const validationSchemas = {
  createPlant: Joi.object({
    code: commonSchemas.code,
    name: commonSchemas.name,
    categoryId: commonSchemas.categoryId.required(),
    areaId: commonSchemas.areaId,
    location: Joi.string().max(200).required(),
    age: Joi.number().integer().min(0),
    specification: Joi.string().max(200),
    maintenanceCycle: Joi.number().integer().min(1).default(30),
    healthStatus: commonSchemas.healthStatus,
    hasPestWarning: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true)
  }),

  updatePlant: Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(30),
    name: Joi.string().trim().min(2).max(50),
    categoryId: commonSchemas.categoryId,
    areaId: commonSchemas.areaId,
    location: Joi.string().max(200),
    age: Joi.number().integer().min(0),
    specification: Joi.string().max(200),
    maintenanceCycle: Joi.number().integer().min(1),
    healthStatus: commonSchemas.healthStatus,
    hasPestWarning: Joi.boolean(),
    isActive: Joi.boolean()
  }),

  plantFilter: Joi.object({
    page: commonSchemas.page,
    pageSize: commonSchemas.pageSize,
    areaId: commonSchemas.areaId,
    categoryId: commonSchemas.categoryId,
    healthStatus: commonSchemas.healthStatus,
    hasPestWarning: Joi.boolean(),
    isActive: Joi.boolean(),
    keyword: Joi.string().trim().allow('')
  }),

  createWorkOrder: Joi.object({
    plantId: Joi.number().integer().positive().allow(null),
    areaId: commonSchemas.areaId,
    type: commonSchemas.workOrderType.required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    title: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().min(10).max(1000).required(),
    dueDate: Joi.date().iso().min('now').required(),
    assignedTo: Joi.number().integer().positive().allow(null),
    materials: Joi.array().items(Joi.object({
      materialId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })).default([])
  }),

  assignWorkOrder: Joi.object({
    assignedTo: commonSchemas.userId.required(),
    remark: Joi.string().max(500)
  }),

  completeWorkOrder: Joi.object({
    completionReport: Joi.string().trim().min(10).max(2000).required(),
    actualDuration: Joi.number().integer().min(0),
    usedMaterials: Joi.array().items(Joi.object({
      materialId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required()
    })).default([])
  }),

  workOrderFilter: Joi.object({
    page: commonSchemas.page,
    pageSize: commonSchemas.pageSize,
    areaId: commonSchemas.areaId,
    assignedTo: commonSchemas.userId,
    status: commonSchemas.workOrderStatus,
    type: commonSchemas.workOrderType,
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    startDate: commonSchemas.dateRange.startDate,
    endDate: commonSchemas.dateRange.endDate,
    keyword: Joi.string().trim().allow('')
  }),

  createMaterial: Joi.object({
    code: commonSchemas.code,
    name: commonSchemas.name,
    type: Joi.string().valid('fertilizer', 'pesticide', 'tool', 'seedling', 'other').required(),
    specification: Joi.string().max(200),
    unit: Joi.string().max(20).required(),
    quantity: Joi.number().integer().min(0).default(0),
    unitPrice: commonSchemas.price.default(0),
    totalValue: commonSchemas.price.default(0),
    threshold: Joi.number().integer().min(0).default(10),
    location: Joi.string().max(200),
    isActive: Joi.boolean().default(true)
  }),

  useMaterial: Joi.object({
    areaId: commonSchemas.areaId,
    workOrderId: Joi.number().integer().positive().allow(null),
    items: Joi.array().items(Joi.object({
      materialId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).required(),
      remark: Joi.string().max(500)
    })).min(1).required()
  }),

  materialFilter: Joi.object({
    page: commonSchemas.page,
    pageSize: commonSchemas.pageSize,
    type: Joi.string().valid('fertilizer', 'pesticide', 'tool', 'seedling', 'other'),
    isActive: Joi.boolean(),
    lowStock: Joi.boolean(),
    keyword: Joi.string().trim().allow('')
  }),

  createCategory: Joi.object({
    name: commonSchemas.name,
    type: Joi.string().valid('tree', 'shrub', 'aquatic', 'turf', 'other').required(),
    description: Joi.string().max(1000),
    parentId: Joi.number().integer().positive().allow(null),
    sortOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true)
  }),

  updateCategory: Joi.object({
    name: Joi.string().trim().min(2).max(50),
    type: Joi.string().valid('tree', 'shrub', 'aquatic', 'turf', 'other'),
    description: Joi.string().max(1000),
    parentId: Joi.number().integer().positive().allow(null),
    sortOrder: Joi.number().integer().min(0),
    isActive: Joi.boolean()
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required().messages({
      'any.required': '旧密码是必填项'
    }),
    newPassword: Joi.string().min(6).max(50).required().messages({
      'string.min': '新密码至少6个字符',
      'string.max': '新密码最多50个字符',
      'any.required': '新密码是必填项'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': '确认密码与新密码不一致',
      'any.required': '确认密码是必填项'
    })
  })
};

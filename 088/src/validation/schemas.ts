import Joi from 'joi';
import { CategoryType, CollectionStatus, RestorationStatus, UserRole } from '../types';

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.base': '用户名必须是字符串',
    'string.empty': '用户名不能为空',
    'string.min': '用户名至少3个字符',
    'string.max': '用户名最多50个字符',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.base': '密码必须是字符串',
    'string.empty': '密码不能为空',
    'string.min': '密码至少6个字符',
    'string.max': '密码最多100个字符',
    'any.required': '密码是必填项'
  })
});

export const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
  realName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid(...Object.values(UserRole)).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': '邮箱格式不正确'
  })
});

export const updateUserSchema = Joi.object({
  realName: Joi.string().min(2).max(50).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  email: Joi.string().email().optional(),
  isActive: Joi.boolean().optional()
});

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.base': '类目名称必须是字符串',
    'string.empty': '类目名称不能为空',
    'string.max': '类目名称最多100个字符',
    'any.required': '类目名称是必填项'
  }),
  type: Joi.string().valid(...Object.values(CategoryType)).required().messages({
    'any.only': `类目类型必须是以下值之一: ${Object.values(CategoryType).join(', ')}`,
    'any.required': '类目类型是必填项'
  }),
  parentId: Joi.number().integer().positive().allow(null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(1000).optional()
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  type: Joi.string().valid(...Object.values(CategoryType)).optional(),
  parentId: Joi.number().integer().positive().allow(null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(1000).optional()
});

export const updateSortOrderSchema = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().positive().required(),
    sortOrder: Joi.number().integer().min(0).required()
  })
).min(1);

export const createCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'string.base': '藏品名称必须是字符串',
    'string.empty': '藏品名称不能为空',
    'string.max': '藏品名称最多200个字符',
    'any.required': '藏品名称是必填项'
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.base': '类目ID必须是数字',
    'number.integer': '类目ID必须是整数',
    'number.positive': '类目ID必须是正数',
    'any.required': '类目ID是必填项'
  }),
  era: Joi.string().max(100).optional(),
  material: Joi.string().max(100).optional(),
  origin: Joi.string().max(200).optional(),
  preservationLevel: Joi.number().integer().min(1).max(5).optional(),
  description: Joi.string().max(2000).optional(),
  location: Joi.string().max(200).optional(),
  maintenanceCycleDays: Joi.number().integer().min(1).max(3650).optional()
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  categoryId: Joi.number().integer().positive().optional(),
  era: Joi.string().max(100).optional(),
  material: Joi.string().max(100).optional(),
  origin: Joi.string().max(200).optional(),
  preservationLevel: Joi.number().integer().min(1).max(5).optional(),
  description: Joi.string().max(2000).optional(),
  location: Joi.string().max(200).optional(),
  maintenanceCycleDays: Joi.number().integer().min(1).max(3650).optional()
});

export const updateCollectionStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(CollectionStatus)).required().messages({
    'any.only': `藏品状态必须是以下值之一: ${Object.values(CollectionStatus).join(', ')}`,
    'any.required': '藏品状态是必填项'
  })
});

export const recordMaintenanceSchema = Joi.object({
  maintenanceType: Joi.string().min(1).max(100).required().messages({
    'string.base': '保养类型必须是字符串',
    'string.empty': '保养类型不能为空',
    'any.required': '保养类型是必填项'
  }),
  description: Joi.string().max(2000).optional(),
  cost: Joi.number().precision(2).min(0).optional()
});

export const queryCollectionsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).max(100).optional().default(10),
  categoryId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid(...Object.values(CollectionStatus)).optional(),
  keyword: Joi.string().max(100).optional()
});

export const createRestorationSchema = Joi.object({
  collectionId: Joi.number().integer().positive().required().messages({
    'any.required': '藏品ID是必填项'
  }),
  damageDescription: Joi.string().max(2000).optional()
});

export const approveRestorationPlanSchema = Joi.object({
  restorationPlan: Joi.string().min(10).max(5000).required().messages({
    'string.base': '修复方案必须是字符串',
    'string.empty': '修复方案不能为空',
    'string.min': '修复方案至少10个字符',
    'any.required': '修复方案是必填项'
  })
});

export const completeRestorationSchema = Joi.object({
  restorationNotes: Joi.string().min(10).max(5000).required().messages({
    'any.required': '修复备注是必填项'
  }),
  cost: Joi.number().precision(2).min(0).optional()
});

export const acceptRestorationSchema = Joi.object({
  验收Notes: Joi.string().max(2000).optional()
});

export const queryRestorationsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.string().valid(...Object.values(RestorationStatus)).optional()
});

export const createExhibitionSchema = Joi.object({
  name: Joi.string().min(1).max(200).required().messages({
    'string.base': '展览名称必须是字符串',
    'string.empty': '展览名称不能为空',
    'any.required': '展览名称是必填项'
  }),
  location: Joi.string().min(1).max(200).required().messages({
    'any.required': '展览地点是必填项'
  }),
  startDate: Joi.date().required().messages({
    'date.base': '开始日期必须是有效日期',
    'any.required': '开始日期是必填项'
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.greater': '结束日期必须晚于开始日期',
    'any.required': '结束日期是必填项'
  }),
  description: Joi.string().max(5000).optional()
});

export const updateExhibitionSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  location: Joi.string().min(1).max(200).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('startDate')),
    otherwise: Joi.date().optional()
  }),
  description: Joi.string().max(5000).optional()
});

export const queryExhibitionsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).max(100).optional().default(10)
});

export const getExhibitionLedgerSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('startDate')),
    otherwise: Joi.date().optional()
  })
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID必须是数字',
    'number.integer': 'ID必须是整数',
    'number.positive': 'ID必须是正数',
    'any.required': 'ID是必填项'
  })
});

export const collectionIdParamSchema = Joi.object({
  collectionId: Joi.number().integer().positive().required()
});

import Joi from 'joi';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10)
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const authValidation = {
  login: Joi.object({
    username: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名长度不能少于2个字符',
      'string.max': '用户名长度不能超过50个字符',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.empty': '密码不能为空',
      'string.min': '密码长度不能少于6个字符',
      'string.max': '密码长度不能超过100个字符',
      'any.required': '密码是必填项'
    })
  })
};

export const categoryValidation = {
  getCategories: paginationSchema.append({
    status: Joi.number().valid(0, 1),
    parentId: Joi.number().integer().min(0).allow(null)
  }),
  
  getCategory: idParamSchema,
  
  createCategory: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': '类目名称不能为空',
      'string.min': '类目名称长度不能少于2个字符',
      'string.max': '类目名称长度不能超过100个字符',
      'any.required': '类目名称是必填项'
    }),
    parentId: Joi.number().integer().min(0).allow(null),
    description: Joi.string().max(500).allow('', null),
    sort: Joi.number().integer().min(0).default(0),
    icon: Joi.string().max(255).allow('', null)
  }),
  
  updateCategory: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    parentId: Joi.number().integer().min(0).allow(null),
    description: Joi.string().max(500).allow('', null),
    sort: Joi.number().integer().min(0),
    status: Joi.number().valid(0, 1),
    icon: Joi.string().max(255).allow('', null)
  }),
  
  updateStatus: Joi.object({
    status: Joi.number().valid(0, 1).required().messages({
      'any.only': '状态值无效',
      'any.required': '状态是必填项'
    })
  }),
  
  deleteCategory: idParamSchema
};

export const merchantValidation = {
  getMerchants: paginationSchema.append({
    keyword: Joi.string().trim().max(100),
    status: Joi.number().valid(0, 1, 2),
    cooperationStatus: Joi.string().valid('active', 'expired'),
    serviceCategoryId: Joi.number().integer().positive(),
    hasAvailableSchedule: Joi.boolean(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    sortBy: Joi.string().valid('createdAt', 'name', 'cooperationEndDate'),
    sortOrder: Joi.string().valid('ASC', 'DESC')
  }),
  
  getMerchant: idParamSchema,
  
  createMerchant: Joi.object({
    name: Joi.string().trim().min(2).max(200).required().messages({
      'string.empty': '商家名称不能为空',
      'string.min': '商家名称长度不能少于2个字符',
      'string.max': '商家名称长度不能超过200个字符',
      'any.required': '商家名称是必填项'
    }),
    contactPerson: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': '联系人不能为空',
      'string.min': '联系人长度不能少于2个字符',
      'string.max': '联系人长度不能超过50个字符',
      'any.required': '联系人是必填项'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入有效的手机号码',
      'any.required': '手机号是必填项'
    }),
    email: Joi.string().email().max(100).allow('', null),
    address: Joi.string().max(500).allow('', null),
    businessLicense: Joi.string().max(255).allow('', null),
    serviceItems: Joi.string().max(500).allow('', null),
    cooperationStartDate: Joi.date().iso(),
    cooperationEndDate: Joi.date().iso().greater(Joi.ref('cooperationStartDate')).allow(null)
  }),
  
  updateMerchant: Joi.object({
    name: Joi.string().trim().min(2).max(200),
    contactPerson: Joi.string().trim().min(2).max(50),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
    email: Joi.string().email().max(100).allow('', null),
    address: Joi.string().max(500).allow('', null),
    businessLicense: Joi.string().max(255).allow('', null),
    serviceItems: Joi.string().max(500).allow('', null),
    cooperationStartDate: Joi.date().iso(),
    cooperationEndDate: Joi.date().iso().allow(null),
    status: Joi.number().valid(0, 1, 2)
  }),
  
  auditMerchant: idParamSchema.append({
    status: Joi.number().valid(1, 2, 3).required().messages({
      'any.only': '审核状态无效',
      'any.required': '审核状态是必填项'
    }),
    auditRemark: Joi.string().max(500).allow('', null)
  }),
  
  deleteMerchant: idParamSchema
};

export const scheduleValidation = {
  getSchedules: paginationSchema.append({
    merchantId: Joi.number().integer().positive().required(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    isLocked: Joi.boolean(),
    hasActivity: Joi.boolean()
  }),
  
  createSchedule: Joi.object({
    merchantId: Joi.number().integer().positive().required(),
    date: Joi.date().iso().required(),
    timeSlot: Joi.string().trim().max(50).required(),
    pricePackageId: Joi.number().integer().positive().allow(null),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    isLocked: Joi.boolean().default(false)
  }),
  
  updateSchedule: Joi.object({
    date: Joi.date().iso(),
    timeSlot: Joi.string().trim().max(50),
    pricePackageId: Joi.number().integer().positive().allow(null),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    isLocked: Joi.boolean()
  }),
  
  toggleLock: idParamSchema.append({
    isLocked: Joi.boolean().required()
  }),
  
  deleteSchedule: idParamSchema
};

export const pricePackageValidation = {
  getPackages: Joi.object({
    merchantId: Joi.number().integer().positive(),
    status: Joi.number().valid(0, 1),
    keyword: Joi.string().trim().max(100)
  }),
  
  createPackage: Joi.object({
    merchantId: Joi.number().integer().positive().required(),
    name: Joi.string().trim().min(2).max(200).required().messages({
      'string.empty': '套餐名称不能为空',
      'string.min': '套餐名称长度不能少于2个字符',
      'string.max': '套餐名称长度不能超过200个字符',
      'any.required': '套餐名称是必填项'
    }),
    description: Joi.string().max(1000).allow('', null),
    basePrice: Joi.number().min(0).default(0),
    pricePerPerson: Joi.number().min(0).default(0),
    minParticipants: Joi.number().integer().min(1).default(1),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    includedServices: Joi.string().max(1000).allow('', null),
    status: Joi.number().valid(0, 1).default(1)
  }),
  
  updatePackage: Joi.object({
    name: Joi.string().trim().min(2).max(200),
    description: Joi.string().max(1000).allow('', null),
    basePrice: Joi.number().min(0),
    pricePerPerson: Joi.number().min(0),
    minParticipants: Joi.number().integer().min(1),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    includedServices: Joi.string().max(1000).allow('', null),
    status: Joi.number().valid(0, 1)
  }),
  
  deletePackage: idParamSchema
};

export const activityValidation = {
  getActivities: paginationSchema.append({
    keyword: Joi.string().trim().max(100),
    categoryId: Joi.number().integer().positive(),
    status: Joi.number().valid(0, 1, 2, 3, 4, 5),
    merchantId: Joi.number().integer().positive(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    departmentId: Joi.number().integer().positive(),
    sortBy: Joi.string().valid('createdAt', 'registrationStartDate', 'activityDate'),
    sortOrder: Joi.string().valid('ASC', 'DESC')
  }),
  
  getActivity: idParamSchema,
  
  createActivity: Joi.object({
    title: Joi.string().trim().min(2).max(200).required().messages({
      'string.empty': '活动标题不能为空',
      'string.min': '活动标题长度不能少于2个字符',
      'string.max': '活动标题长度不能超过200个字符',
      'any.required': '活动标题是必填项'
    }),
    description: Joi.string().max(5000).allow('', null),
    categoryId: Joi.number().integer().positive().required(),
    merchantId: Joi.number().integer().positive().required(),
    scheduleId: Joi.number().integer().positive().allow(null),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    registrationStartDate: Joi.date().iso().required(),
    registrationEndDate: Joi.date().iso().greater(Joi.ref('registrationStartDate')).required(),
    activityDate: Joi.date().iso().greater(Joi.ref('registrationEndDate')),
    location: Joi.string().max(500).allow('', null),
    pricePackageId: Joi.number().integer().positive().allow(null),
    departmentIds: Joi.string().max(500).allow('', null),
    needApproval: Joi.boolean().default(true),
    coverImage: Joi.string().max(500).allow('', null)
  }),
  
  updateActivity: Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().max(5000).allow('', null),
    categoryId: Joi.number().integer().positive(),
    merchantId: Joi.number().integer().positive(),
    scheduleId: Joi.number().integer().positive().allow(null),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    registrationStartDate: Joi.date().iso(),
    registrationEndDate: Joi.date().iso(),
    activityDate: Joi.date().iso(),
    location: Joi.string().max(500).allow('', null),
    pricePackageId: Joi.number().integer().positive().allow(null),
    departmentIds: Joi.string().max(500).allow('', null),
    needApproval: Joi.boolean(),
    coverImage: Joi.string().max(500).allow('', null)
  }),
  
  updateStatus: idParamSchema.append({
    status: Joi.number().valid(1, 2, 3, 4, 5).required().messages({
      'any.only': '活动状态无效',
      'any.required': '活动状态是必填项'
    })
  }),
  
  deleteActivity: idParamSchema,
  
  register: Joi.object({
    activityId: Joi.number().integer().positive().required(),
    remark: Joi.string().max(500).allow('', null)
  }),
  
  getRegistrations: paginationSchema.append({
    status: Joi.number().valid(0, 1, 2, 3, 4),
    activityId: Joi.number().integer().positive()
  }),
  
  approveRegistration: idParamSchema.append({
    approved: Joi.boolean().required(),
    reason: Joi.string().max(500).allow('', null)
  }),
  
  cancelRegistration: idParamSchema,
  
  checkIn: idParamSchema,
  
  getStatistics: Joi.object({
    activityId: Joi.number().integer().positive(),
    departmentId: Joi.number().integer().positive(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate'))
  })
};

export default {
  auth: authValidation,
  category: categoryValidation,
  merchant: merchantValidation,
  schedule: scheduleValidation,
  pricePackage: pricePackageValidation,
  activity: activityValidation,
  pagination: paginationSchema,
  idParam: idParamSchema
};

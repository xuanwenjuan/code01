import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': '用户名不能为空',
    'string.min': '用户名长度不能少于3个字符',
    'string.max': '用户名长度不能超过50个字符',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6个字符',
    'string.max': '密码长度不能超过100个字符',
    'any.required': '密码是必填项'
  })
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
  realName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('admin', 'material_admin', 'engraver', 'typesetter').required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': '邮箱格式不正确'
  })
});

export const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '类目名称不能为空',
    'any.required': '类目名称是必填项'
  }),
  code: Joi.string().min(1).max(50).pattern(/^[A-Za-z0-9_-]+$/).required().messages({
    'string.empty': '类目编码不能为空',
    'string.pattern.base': '类目编码只能包含字母、数字、下划线和横杠',
    'any.required': '类目编码是必填项'
  }),
  parentId: Joi.number().integer().min(1).optional(),
  level: Joi.number().integer().min(1).default(1),
  sort: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).optional()
});

export const stockSchema = Joi.object({
  categoryId: Joi.number().integer().min(1).required().messages({
    'any.required': '类目ID是必填项'
  }),
  name: Joi.string().min(1).max(100).required(),
  origin: Joi.string().max(100).optional(),
  weight: Joi.number().precision(2).min(0).optional(),
  grade: Joi.string().max(50).optional(),
  storageYears: Joi.number().integer().min(0).default(0),
  quantity: Joi.number().precision(2).min(0).required(),
  unit: Joi.string().max(20).required(),
  unitPrice: Joi.number().precision(2).min(0).required(),
  expireDate: Joi.date().optional(),
  location: Joi.string().max(100).optional(),
  remark: Joi.string().max(500).optional()
});

export const workOrderSchema = Joi.object({
  bookName: Joi.string().min(1).max(200).required().messages({
    'string.empty': '书目名称不能为空',
    'any.required': '书目名称是必填项'
  }),
  bookCode: Joi.string().max(50).optional(),
  edition: Joi.string().max(100).optional(),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': '制作数量必须大于0',
    'any.required': '制作数量是必填项'
  }),
  priority: Joi.number().integer().valid(1, 2, 3).default(1),
  deadline: Joi.date().optional(),
  remark: Joi.string().max(500).optional(),
  typesetterId: Joi.number().integer().min(1).optional(),
  engraverId: Joi.number().integer().min(1).optional(),
  printerId: Joi.number().integer().min(1).optional(),
  binderId: Joi.number().integer().min(1).optional()
});

export const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'typesetting', 'engraving', 'printing', 'binding', 'completed', 'suspended')
    .required()
    .messages({
      'any.only': '无效的工单状态',
      'any.required': '状态是必填项'
    }),
  remark: Joi.string().max(500).optional()
});

export const orderMaterialSchema = Joi.object({
  materialStockId: Joi.number().integer().min(1).required().messages({
    'any.required': '物料库存ID是必填项'
  }),
  quantity: Joi.number().precision(2).min(0.01).required().messages({
    'number.min': '使用数量必须大于0',
    'any.required': '使用数量是必填项'
  }),
  unit: Joi.string().max(20).optional()
});

export const costLedgerSchema = Joi.object({
  workOrderId: Joi.number().integer().min(1).optional(),
  categoryId: Joi.number().integer().min(1).optional(),
  statisticsDate: Joi.date().required().messages({
    'any.required': '统计日期是必填项'
  }),
  remark: Joi.string().max(500).optional()
}).xor('workOrderId', 'categoryId');

export const queryListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  keyword: Joi.string().max(100).optional(),
  status: Joi.string().optional(),
  categoryId: Joi.number().integer().min(1).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  groupBy: Joi.string().valid('day', 'month', 'year').default('month')
});

import Joi from 'joi';
import { UserRole, OrderStatus, CategoryStatus } from '../types';

export const authSchemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多50个字符'
    }),
    password: Joi.string().min(6).max(50).required().messages({
      'string.empty': '密码不能为空',
      'string.min': '密码至少6个字符'
    }),
    realName: Joi.string().max(50).optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '手机号格式不正确'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': '邮箱格式不正确'
    }),
    role: Joi.string().valid(...Object.values(UserRole)).optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': '用户名不能为空'
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空'
    })
  }),
  changePassword: Joi.object({
    oldPassword: Joi.string().required().messages({
      'string.empty': '旧密码不能为空'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.empty': '新密码不能为空',
      'string.min': '新密码至少6个字符'
    })
  })
};

export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(50).required().messages({
      'string.empty': '分类名称不能为空'
    }),
    parentId: Joi.number().integer().min(0).optional(),
    icon: Joi.string().optional(),
    sort: Joi.number().integer().min(0).optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(CategoryStatus)).optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    parentId: Joi.number().integer().min(0).optional(),
    icon: Joi.string().optional(),
    sort: Joi.number().integer().min(0).optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(CategoryStatus)).optional()
  }),
  idParam: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      'number.base': 'ID必须是数字',
      'number.positive': 'ID必须是正数'
    })
  }),
  query: Joi.object({
    status: Joi.string().valid(...Object.values(CategoryStatus), 'all').optional(),
    keyword: Joi.string().optional(),
    parentId: Joi.number().integer().min(0).optional()
  })
};

export const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': '产品名称不能为空'
    }),
    categoryId: Joi.number().integer().positive().required().messages({
      'number.base': '分类ID必须是数字',
      'number.positive': '分类ID必须是正数'
    }),
    description: Joi.string().optional(),
    images: Joi.string().optional(),
    basePrice: Joi.number().positive().required().messages({
      'number.base': '价格必须是数字',
      'number.positive': '价格必须大于0'
    }),
    sizes: Joi.array().optional(),
    flavors: Joi.array().optional(),
    minProductionTime: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('on_shelf', 'off_shelf').optional(),
    sort: Joi.number().integer().min(0).optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    categoryId: Joi.number().integer().positive().optional(),
    description: Joi.string().optional(),
    images: Joi.string().optional(),
    basePrice: Joi.number().positive().optional(),
    sizes: Joi.array().optional(),
    flavors: Joi.array().optional(),
    minProductionTime: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('on_shelf', 'off_shelf').optional(),
    sort: Joi.number().integer().min(0).optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  query: Joi.object({
    categoryId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('on_shelf', 'off_shelf').optional(),
    keyword: Joi.string().optional(),
    storeId: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional()
  })
};

export const orderSchemas = {
  create: Joi.object({
    productId: Joi.number().integer().positive().required().messages({
      'number.base': '产品ID必须是数字',
      'number.positive': '产品ID必须是正数'
    }),
    size: Joi.string().optional(),
    flavor: Joi.string().optional(),
    customization: Joi.string().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    deliveryAddress: Joi.string().required().messages({
      'string.empty': '配送地址不能为空'
    }),
    deliveryPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.empty': '配送电话不能为空',
      'string.pattern.base': '手机号格式不正确'
    }),
    deliveryName: Joi.string().required().messages({
      'string.empty': '收货人不能为空'
    }),
    deliveryTime: Joi.date().optional(),
    remark: Joi.string().optional(),
    storeId: Joi.number().integer().positive().required().messages({
      'number.base': '门店ID必须是数字',
      'number.positive': '门店ID必须是正数'
    })
  }),
  riderAssign: Joi.object({
    riderId: Joi.number().integer().positive().required().messages({
      'number.base': '骑手ID必须是数字',
      'number.positive': '骑手ID必须是正数'
    })
  }),
  query: Joi.object({
    status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
    storeId: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional()
  })
};

export const ingredientSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': '原料名称不能为空'
    }),
    category: Joi.string().optional(),
    unit: Joi.string().required().messages({
      'string.empty': '计量单位不能为空'
    }),
    currentStock: Joi.number().min(0).optional(),
    safetyStock: Joi.number().min(0).optional(),
    warningThreshold: Joi.number().min(0).optional(),
    unitPrice: Joi.number().positive().required().messages({
      'number.base': '单价必须是数字',
      'number.positive': '单价必须大于0'
    }),
    supplierId: Joi.number().integer().positive().optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    category: Joi.string().optional(),
    unit: Joi.string().optional(),
    currentStock: Joi.number().min(0).optional(),
    safetyStock: Joi.number().min(0).optional(),
    warningThreshold: Joi.number().min(0).optional(),
    unitPrice: Joi.number().positive().optional(),
    supplierId: Joi.number().integer().positive().optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  updateStock: Joi.object({
    quantity: Joi.number().required().messages({
      'number.base': '库存数量必须是数字'
    })
  }),
  loss: Joi.object({
    ingredientId: Joi.number().integer().positive().required().messages({
      'number.base': '原料ID必须是数字',
      'number.positive': '原料ID必须是正数'
    }),
    quantity: Joi.number().positive().required().messages({
      'number.base': '损耗数量必须是数字',
      'number.positive': '损耗数量必须大于0'
    }),
    unit: Joi.string().optional(),
    lossType: Joi.string().required().messages({
      'string.empty': '损耗类型不能为空'
    }),
    reason: Joi.string().optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  query: Joi.object({
    category: Joi.string().optional(),
    status: Joi.string().optional(),
    keyword: Joi.string().optional(),
    storeId: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional()
  })
};

export const recipeSchemas = {
  create: Joi.object({
    productId: Joi.number().integer().positive().required(),
    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': '配方名称不能为空'
    }),
    description: Joi.string().optional(),
    version: Joi.string().optional(),
    storeId: Joi.number().integer().positive().optional(),
    items: Joi.array().items(
      Joi.object({
        ingredientId: Joi.number().integer().positive().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().required(),
        remark: Joi.string().optional()
      })
    ).optional()
  }),
  update: Joi.object({
    productId: Joi.number().integer().positive().optional(),
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().optional(),
    version: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    items: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().optional(),
        ingredientId: Joi.number().integer().positive().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().required(),
        remark: Joi.string().optional()
      })
    ).optional()
  }),
  item: Joi.object({
    ingredientId: Joi.number().integer().positive().required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().required(),
    remark: Joi.string().optional()
  })
};

export const reportSchemas = {
  generate: Joi.object({
    date: Joi.date().required().messages({
      'date.base': '日期格式不正确'
    }),
    storeId: Joi.number().integer().positive().optional()
  }),
  query: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    storeId: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional()
  }),
  statistics: Joi.object({
    storeId: Joi.number().integer().positive().optional()
  })
};

export const storeSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': '门店名称不能为空'
    }),
    address: Joi.string().required().messages({
      'string.empty': '门店地址不能为空'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.empty': '联系电话不能为空',
      'string.pattern.base': '手机号格式不正确'
    }),
    businessHours: Joi.string().optional(),
    managerId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('active', 'closed').optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    address: Joi.string().optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    businessHours: Joi.string().optional(),
    managerId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('active', 'closed').optional()
  }),
  query: Joi.object({
    status: Joi.string().valid('active', 'closed').optional(),
    keyword: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).optional()
  })
};

export const supplierSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': '供应商名称不能为空'
    }),
    contact: Joi.string().optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    address: Joi.string().optional(),
    email: Joi.string().email().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    contact: Joi.string().optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    address: Joi.string().optional(),
    email: Joi.string().email().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    storeId: Joi.number().integer().positive().optional()
  }),
  query: Joi.object({
    status: Joi.string().valid('active', 'inactive').optional(),
    keyword: Joi.string().optional(),
    storeId: Joi.number().integer().positive().optional()
  })
};

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestException } from '../exceptions/http.exception';
import { EquipmentStatus, RentalType, OrderStatus, PaymentStatus, UserRole } from '../types';

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw new BadRequestException('参数校验失败', errors);
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw new BadRequestException('参数校验失败', errors);
    }

    next();
  };
};

export const schemas = {
  createCategory: Joi.object({
    name: Joi.string().required().max(100).messages({
      'string.empty': '类目名称不能为空',
      'string.max': '类目名称不能超过100个字符',
      'any.required': '类目名称是必填项'
    }),
    parentId: Joi.number().integer().min(0).allow(null).optional(),
    description: Joi.string().max(500).optional().messages({
      'string.max': '类目描述不能超过500个字符'
    }),
    sort: Joi.number().integer().min(0).default(0).optional(),
    status: Joi.number().integer().valid(0, 1).default(1).optional()
  }),

  updateCategory: Joi.object({
    name: Joi.string().max(100).optional().messages({
      'string.max': '类目名称不能超过100个字符'
    }),
    parentId: Joi.number().integer().min(0).allow(null).optional(),
    description: Joi.string().max(500).optional().messages({
      'string.max': '类目描述不能超过500个字符'
    }),
    sort: Joi.number().integer().min(0).optional(),
    status: Joi.number().integer().valid(0, 1).optional()
  }),

  createEquipment: Joi.object({
    name: Joi.string().required().max(200).messages({
      'string.empty': '设备名称不能为空',
      'string.max': '设备名称不能超过200个字符',
      'any.required': '设备名称是必填项'
    }),
    categoryId: Joi.number().integer().min(1).required().messages({
      'number.min': '请选择有效的类目',
      'any.required': '类目ID是必填项'
    }),
    model: Joi.string().max(100).optional().messages({
      'string.max': '型号不能超过100个字符'
    }),
    specification: Joi.string().max(200).optional().messages({
      'string.max': '规格不能超过200个字符'
    }),
    configuration: Joi.string().max(500).optional().messages({
      'string.max': '配置参数不能超过500个字符'
    }),
    purchaseCost: Joi.number().min(0).optional().messages({
      'number.min': '采购成本不能小于0'
    }),
    dailyPrice: Joi.number().min(0).required().messages({
      'number.min': '日租金不能小于0',
      'any.required': '日租金是必填项'
    }),
    monthlyPrice: Joi.number().min(0).required().messages({
      'number.min': '月租金不能小于0',
      'any.required': '月租金是必填项'
    }),
    deposit: Joi.number().min(0).default(0).optional().messages({
      'number.min': '押金不能小于0'
    }),
    maintenanceCycle: Joi.number().integer().min(0).optional().messages({
      'number.min': '维保周期不能小于0'
    }),
    lastMaintenanceDate: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(EquipmentStatus)).default(EquipmentStatus.IN_STOCK).optional(),
    remark: Joi.string().max(500).optional().messages({
      'string.max': '备注不能超过500个字符'
    })
  }),

  updateEquipment: Joi.object({
    name: Joi.string().max(200).optional().messages({
      'string.max': '设备名称不能超过200个字符'
    }),
    categoryId: Joi.number().integer().min(1).optional().messages({
      'number.min': '请选择有效的类目'
    }),
    model: Joi.string().max(100).optional().messages({
      'string.max': '型号不能超过100个字符'
    }),
    specification: Joi.string().max(200).optional().messages({
      'string.max': '规格不能超过200个字符'
    }),
    configuration: Joi.string().max(500).optional().messages({
      'string.max': '配置参数不能超过500个字符'
    }),
    purchaseCost: Joi.number().min(0).optional().messages({
      'number.min': '采购成本不能小于0'
    }),
    dailyPrice: Joi.number().min(0).optional().messages({
      'number.min': '日租金不能小于0'
    }),
    monthlyPrice: Joi.number().min(0).optional().messages({
      'number.min': '月租金不能小于0'
    }),
    deposit: Joi.number().min(0).optional().messages({
      'number.min': '押金不能小于0'
    }),
    maintenanceCycle: Joi.number().integer().min(0).optional().messages({
      'number.min': '维保周期不能小于0'
    }),
    lastMaintenanceDate: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(EquipmentStatus)).optional(),
    remark: Joi.string().max(500).optional().messages({
      'string.max': '备注不能超过500个字符'
    })
  }),

  equipmentFilter: Joi.object({
    keyword: Joi.string().max(100).optional(),
    categoryId: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid(...Object.values(EquipmentStatus)).optional(),
    minDailyPrice: Joi.number().min(0).optional(),
    maxDailyPrice: Joi.number().min(0).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(10).optional()
  }),

  createCustomer: Joi.object({
    name: Joi.string().required().max(100).messages({
      'string.empty': '客户名称不能为空',
      'string.max': '客户名称不能超过100个字符',
      'any.required': '客户名称是必填项'
    }),
    contactPerson: Joi.string().max(50).optional().messages({
      'string.max': '联系人姓名不能超过50个字符'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入有效的手机号码',
      'any.required': '联系电话是必填项'
    }),
    email: Joi.string().email().max(100).optional().messages({
      'string.email': '请输入有效的邮箱地址',
      'string.max': '邮箱地址不能超过100个字符'
    }),
    address: Joi.string().max(200).optional().messages({
      'string.max': '地址不能超过200个字符'
    }),
    idCard: Joi.string().pattern(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).optional().messages({
      'string.pattern.base': '请输入有效的身份证号码'
    }),
    businessLicense: Joi.string().max(100).optional().messages({
      'string.max': '营业执照号不能超过100个字符'
    }),
    status: Joi.number().integer().valid(0, 1).default(1).optional(),
    remark: Joi.string().max(500).optional().messages({
      'string.max': '备注不能超过500个字符'
    })
  }),

  updateCustomer: Joi.object({
    name: Joi.string().max(100).optional().messages({
      'string.max': '客户名称不能超过100个字符'
    }),
    contactPerson: Joi.string().max(50).optional().messages({
      'string.max': '联系人姓名不能超过50个字符'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '请输入有效的手机号码'
    }),
    email: Joi.string().email().max(100).optional().messages({
      'string.email': '请输入有效的邮箱地址',
      'string.max': '邮箱地址不能超过100个字符'
    }),
    address: Joi.string().max(200).optional().messages({
      'string.max': '地址不能超过200个字符'
    }),
    idCard: Joi.string().pattern(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).optional().messages({
      'string.pattern.base': '请输入有效的身份证号码'
    }),
    businessLicense: Joi.string().max(100).optional().messages({
      'string.max': '营业执照号不能超过100个字符'
    }),
    status: Joi.number().integer().valid(0, 1).optional(),
    remark: Joi.string().max(500).optional().messages({
      'string.max': '备注不能超过500个字符'
    })
  }),

  createOrder: Joi.object({
    customerId: Joi.number().integer().min(1).required().messages({
      'number.min': '请选择有效的客户',
      'any.required': '客户ID是必填项'
    }),
    equipmentId: Joi.number().integer().min(1).required().messages({
      'number.min': '请选择有效的设备',
      'any.required': '设备ID是必填项'
    }),
    rentalType: Joi.string().valid(...Object.values(RentalType)).required().messages({
      'any.only': '请选择有效的租赁类型',
      'any.required': '租赁类型是必填项'
    }),
    rentalDays: Joi.when('rentalType', {
      is: RentalType.DAILY,
      then: Joi.number().integer().min(1).required().messages({
        'number.min': '租赁天数不能小于1',
        'any.required': '租赁天数是必填项'
      }),
      otherwise: Joi.forbidden()
    }),
    rentalMonths: Joi.when('rentalType', {
      is: RentalType.MONTHLY,
      then: Joi.number().integer().min(1).required().messages({
        'number.min': '租赁月数不能小于1',
        'any.required': '租赁月数是必填项'
      }),
      otherwise: Joi.forbidden()
    }),
    startDate: Joi.date().required().messages({
      'any.required': '租赁开始日期是必填项'
    }),
    endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
      'date.greater': '租赁结束日期必须晚于开始日期',
      'any.required': '租赁结束日期是必填项'
    }),
    remark: Joi.string().max(500).optional().messages({
      'string.max': '备注不能超过500个字符'
    })
  }),

  updateOrder: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional().messages({
      'date.greater': '租赁结束日期必须晚于开始日期'
    }),
    remark: Joi.string().max(500).optional().messages({
      'string.max': '备注不能超过500个字符'
    })
  }),

  cancelOrder: Joi.object({
    reason: Joi.string().max(200).optional().messages({
      'string.max': '取消原因不能超过200个字符'
    })
  }),

  payDeposit: Joi.object({
    amount: Joi.number().min(0.01).required().messages({
      'number.min': '支付金额不能小于0.01',
      'any.required': '支付金额是必填项'
    }),
    paymentMethod: Joi.string().max(50).required().messages({
      'string.max': '支付方式不能超过50个字符',
      'any.required': '支付方式是必填项'
    }),
    transactionNo: Joi.string().max(100).optional().messages({
      'string.max': '交易单号不能超过100个字符'
    }),
    remark: Joi.string().max(200).optional().messages({
      'string.max': '备注不能超过200个字符'
    })
  }),

  returnEquipment: Joi.object({
    damageAmount: Joi.number().min(0).optional().messages({
      'number.min': '损坏赔偿金额不能小于0'
    }),
    damageDescription: Joi.string().max(200).optional().messages({
      'string.max': '损坏描述不能超过200个字符'
    })
  }),

  payRent: Joi.object({
    amount: Joi.number().min(0.01).required().messages({
      'number.min': '支付金额不能小于0.01',
      'any.required': '支付金额是必填项'
    }),
    paymentMethod: Joi.string().max(50).required().messages({
      'string.max': '支付方式不能超过50个字符',
      'any.required': '支付方式是必填项'
    }),
    transactionNo: Joi.string().max(100).optional().messages({
      'string.max': '交易单号不能超过100个字符'
    }),
    remark: Joi.string().max(200).optional().messages({
      'string.max': '备注不能超过200个字符'
    })
  }),

  orderFilter: Joi.object({
    orderNo: Joi.string().max(50).optional(),
    customerId: Joi.number().integer().min(1).optional(),
    equipmentId: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid(...Object.values(OrderStatus)).optional(),
    startDateFrom: Joi.date().optional(),
    startDateTo: Joi.date().optional(),
    endDateFrom: Joi.date().optional(),
    endDateTo: Joi.date().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(10).optional()
  }),

  createUser: Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
      'string.min': '用户名不能少于3个字符',
      'string.max': '用户名不能超过50个字符',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': '密码不能少于6个字符',
      'string.max': '密码不能超过100个字符',
      'any.required': '密码是必填项'
    }),
    realName: Joi.string().max(50).optional().messages({
      'string.max': '真实姓名不能超过50个字符'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '请输入有效的手机号码'
    }),
    email: Joi.string().email().max(100).optional().messages({
      'string.email': '请输入有效的邮箱地址',
      'string.max': '邮箱地址不能超过100个字符'
    }),
    role: Joi.string().valid(...Object.values(UserRole)).required().messages({
      'any.only': '请选择有效的角色',
      'any.required': '角色是必填项'
    }),
    status: Joi.number().integer().valid(0, 1).default(1).optional()
  }),

  updateUser: Joi.object({
    username: Joi.string().min(3).max(50).optional().messages({
      'string.min': '用户名不能少于3个字符',
      'string.max': '用户名不能超过50个字符'
    }),
    password: Joi.string().min(6).max(100).optional().messages({
      'string.min': '密码不能少于6个字符',
      'string.max': '密码不能超过100个字符'
    }),
    realName: Joi.string().max(50).optional().messages({
      'string.max': '真实姓名不能超过50个字符'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '请输入有效的手机号码'
    }),
    email: Joi.string().email().max(100).optional().messages({
      'string.email': '请输入有效的邮箱地址',
      'string.max': '邮箱地址不能超过100个字符'
    }),
    role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
      'any.only': '请选择有效的角色'
    }),
    status: Joi.number().integer().valid(0, 1).optional()
  }),

  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': '用户名不能为空',
      'any.required': '用户名是必填项'
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必填项'
    })
  }),

  settlementFilter: Joi.object({
    customerId: Joi.number().integer().min(1).optional(),
    equipmentId: Joi.number().integer().min(1).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(10).optional()
  })
};

export default validate;

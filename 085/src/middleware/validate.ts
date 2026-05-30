import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';

export const validate = (schema: Joi.ObjectSchema, location: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[location], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json(ResponseUtil.validationError(errorMessages));
    }

    req[location] = value;
    next();
  };
};

export const schemas = {
  auth: {
    register: Joi.object({
      username: Joi.string().min(3).max(50).required().messages({
        'string.base': '用户名必须是字符串',
        'string.empty': '用户名不能为空',
        'string.min': '用户名长度不能少于3个字符',
        'string.max': '用户名长度不能超过50个字符',
        'any.required': '用户名是必填项'
      }),
      email: Joi.string().email().required().messages({
        'string.email': '请输入有效的邮箱地址',
        'string.empty': '邮箱不能为空',
        'any.required': '邮箱是必填项'
      }),
      password: Joi.string().min(6).max(100).required().messages({
        'string.min': '密码长度不能少于6个字符',
        'string.max': '密码长度不能超过100个字符',
        'string.empty': '密码不能为空',
        'any.required': '密码是必填项'
      }),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '请输入有效的手机号码'
      })
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
    changePassword: Joi.object({
      oldPassword: Joi.string().required().messages({
        'string.empty': '原密码不能为空',
        'any.required': '原密码是必填项'
      }),
      newPassword: Joi.string().min(6).max(100).required().messages({
        'string.min': '新密码长度不能少于6个字符',
        'string.max': '新密码长度不能超过100个字符',
        'string.empty': '新密码不能为空',
        'any.required': '新密码是必填项'
      })
    })
  },
  category: {
    create: Joi.object({
      name: Joi.string().min(1).max(100).required().messages({
        'string.empty': '分类名称不能为空',
        'string.max': '分类名称长度不能超过100个字符',
        'any.required': '分类名称是必填项'
      }),
      parentId: Joi.number().integer().positive().optional(),
      icon: Joi.string().max(255).optional(),
      sortOrder: Joi.number().integer().min(0).default(0),
      description: Joi.string().optional()
    }),
    update: Joi.object({
      name: Joi.string().min(1).max(100).optional(),
      parentId: Joi.number().integer().positive().allow(null).optional(),
      icon: Joi.string().max(255).optional(),
      sortOrder: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid('active', 'inactive').optional(),
      description: Joi.string().optional()
    }),
    tree: Joi.object({
      status: Joi.string().valid('active', 'inactive').optional()
    })
  },
  artist: {
    apply: Joi.object({
      name: Joi.string().min(1).max(100).required().messages({
        'string.empty': '艺术家名称不能为空',
        'any.required': '艺术家名称是必填项'
      }),
      avatar: Joi.string().max(255).optional(),
      bio: Joi.string().optional(),
      specialties: Joi.string().max(255).required().messages({
        'string.empty': '擅长品类不能为空',
        'any.required': '擅长品类是必填项'
      }),
      style: Joi.string().max(100).optional(),
      representativeWorks: Joi.array().optional()
    }),
    review: Joi.object({
      status: Joi.string().valid('approved', 'rejected').required().messages({
        'any.required': '审核状态是必填项',
        'any.only': '审核状态只能是 approved 或 rejected'
      }),
      rejectionReason: Joi.string().when('status', {
        is: 'rejected',
        then: Joi.required(),
        otherwise: Joi.optional()
      }).messages({
        'any.required': '拒绝原因是必填项'
      })
    }),
    suspend: Joi.object({
      suspensionReason: Joi.string().optional()
    }),
    getList: Joi.object({
      page: Joi.number().integer().positive().default(1),
      pageSize: Joi.number().integer().positive().max(100).default(10),
      status: Joi.string().valid('pending', 'approved', 'rejected', 'suspended').optional(),
      keyword: Joi.string().optional(),
      specialties: Joi.string().optional()
    })
  },
  product: {
    create: Joi.object({
      name: Joi.string().min(1).max(200).required().messages({
        'string.empty': '商品名称不能为空',
        'any.required': '商品名称是必填项'
      }),
      description: Joi.string().optional(),
      categoryId: Joi.number().integer().positive().required().messages({
        'any.required': '分类ID是必填项'
      }),
      price: Joi.number().positive().precision(2).required().messages({
        'number.positive': '价格必须大于0',
        'any.required': '价格是必填项'
      }),
      stock: Joi.number().integer().min(0).default(0),
      images: Joi.array().items(Joi.string()).optional(),
      coverImage: Joi.string().max(255).optional(),
      isCustomizable: Joi.boolean().default(false),
      sortOrder: Joi.number().integer().min(0).default(0)
    }),
    update: Joi.object({
      name: Joi.string().min(1).max(200).optional(),
      description: Joi.string().optional(),
      categoryId: Joi.number().integer().positive().optional(),
      price: Joi.number().positive().precision(2).optional(),
      stock: Joi.number().integer().min(0).optional(),
      images: Joi.array().items(Joi.string()).optional(),
      coverImage: Joi.string().max(255).optional(),
      isCustomizable: Joi.boolean().optional(),
      sortOrder: Joi.number().integer().min(0).optional(),
      isActive: Joi.boolean().optional()
    }),
    getList: Joi.object({
      page: Joi.number().integer().positive().default(1),
      pageSize: Joi.number().integer().positive().max(100).default(10),
      categoryId: Joi.number().integer().positive().optional(),
      artistId: Joi.number().integer().positive().optional(),
      keyword: Joi.string().optional(),
      isActive: Joi.boolean().optional(),
      sortBy: Joi.string().valid('sales', 'price_asc', 'price_desc', 'newest').optional(),
      minPrice: Joi.number().positive().optional(),
      maxPrice: Joi.number().positive().optional()
    }),
    batchUpdateStatus: Joi.object({
      ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        'array.min': '至少选择一个商品',
        'any.required': '商品ID列表是必填项'
      }),
      isActive: Joi.boolean().required().messages({
        'any.required': '状态是必填项'
      })
    })
  },
  order: {
    create: Joi.object({
      items: Joi.array().items(
        Joi.object({
          productId: Joi.number().integer().positive().required(),
          quantity: Joi.number().integer().positive().required()
        })
      ).min(1).required().messages({
        'array.min': '订单至少包含一个商品',
        'any.required': '商品列表是必填项'
      }),
      shippingAddress: Joi.string().optional(),
      shippingPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '请输入有效的手机号码'
      }),
      shippingName: Joi.string().optional(),
      customNote: Joi.string().optional()
    }),
    pay: Joi.object({
      paymentMethod: Joi.string().valid('online', 'wechat', 'alipay', 'bank_transfer').default('online')
    }),
    ship: Joi.object({
      trackingNumber: Joi.string().optional(),
      shippingCompany: Joi.string().optional()
    }),
    cancel: Joi.object({
      cancelReason: Joi.string().optional()
    }),
    getList: Joi.object({
      page: Joi.number().integer().positive().default(1),
      pageSize: Joi.number().integer().positive().max(100).default(10),
      status: Joi.string().valid('pending_payment', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'closed').optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      orderNo: Joi.string().optional(),
      userId: Joi.number().integer().positive().optional()
    })
  },
  settlement: {
    generate: Joi.object({
      month: Joi.string().pattern(/^\d{4}-\d{2}$/).required().messages({
        'string.pattern.base': '月份格式必须是 YYYY-MM',
        'any.required': '月份是必填项'
      }),
      artistId: Joi.number().integer().positive().optional()
    }),
    confirm: Joi.object({}),
    pay: Joi.object({
      remark: Joi.string().optional(),
      paymentMethod: Joi.string().valid('bank_transfer', 'wechat', 'alipay').default('bank_transfer')
    }),
    cancel: Joi.object({
      cancelReason: Joi.string().optional()
    }),
    getList: Joi.object({
      page: Joi.number().integer().positive().default(1),
      pageSize: Joi.number().integer().positive().max(100).default(10),
      status: Joi.string().valid('pending', 'settled', 'paid', 'cancelled').optional(),
      artistId: Joi.number().integer().positive().optional(),
      month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional()
    }),
    getStatistics: Joi.object({
      artistId: Joi.number().integer().positive().optional(),
      month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional()
    })
  }
};

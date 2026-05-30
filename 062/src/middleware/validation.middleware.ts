import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return ResponseUtil.badRequest(res, errors as any);
    }

    next();
  };
};

export const schemas = {
  login: Joi.object({
    body: Joi.object({
      username: Joi.string().required().messages({
        'string.empty': '用户名不能为空',
        'any.required': '用户名是必填项'
      }),
      password: Joi.string().min(6).required().messages({
        'string.empty': '密码不能为空',
        'string.min': '密码长度不能少于6位',
        'any.required': '密码是必填项'
      })
    })
  }),

  roomType: Joi.object({
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': '房型名称不能为空',
        'any.required': '房型名称是必填项'
      }),
      basePrice: Joi.number().positive().required().messages({
        'number.base': '价格必须是数字',
        'number.positive': '价格必须大于0',
        'any.required': '基础价格是必填项'
      }),
      maxGuests: Joi.number().integer().min(1).optional(),
      bedCount: Joi.number().integer().min(0).optional(),
      area: Joi.number().min(0).optional(),
      sortOrder: Joi.number().integer().optional(),
      parentId: Joi.number().integer().allow(null).optional()
    })
  }),

  room: Joi.object({
    body: Joi.object({
      roomNumber: Joi.string().required().messages({
        'string.empty': '房间号不能为空',
        'any.required': '房间号是必填项'
      }),
      roomTypeId: Joi.number().integer().positive().required().messages({
        'number.base': '房型ID必须是数字',
        'any.required': '房型是必填项'
      }),
      floor: Joi.number().integer().required().messages({
        'number.base': '楼层必须是数字',
        'any.required': '楼层是必填项'
      }),
      orientation: Joi.string().optional(),
      remark: Joi.string().allow('').optional()
    })
  }),

  reservation: Joi.object({
    body: Joi.object({
      roomTypeId: Joi.number().integer().positive().required().messages({
        'any.required': '房型是必填项'
      }),
      guestName: Joi.string().required().messages({
        'string.empty': '客人姓名不能为空',
        'any.required': '客人姓名是必填项'
      }),
      guestPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.pattern.base': '请输入有效的手机号码',
        'any.required': '客人电话是必填项'
      }),
      guestIdCard: Joi.string().pattern(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).optional().messages({
        'string.pattern.base': '请输入有效的身份证号码'
      }),
      checkInDate: Joi.date().required().messages({
        'date.base': '请输入有效的入住日期',
        'any.required': '入住日期是必填项'
      }),
      checkOutDate: Joi.date().greater(Joi.ref('checkInDate')).required().messages({
        'date.base': '请输入有效的离店日期',
        'date.greater': '离店日期必须晚于入住日期',
        'any.required': '离店日期是必填项'
      }),
      guestCount: Joi.number().integer().min(1).default(1),
      deposit: Joi.number().min(0).default(0),
      source: Joi.string().valid('online', 'offline', 'walk_in', 'third_party').default('offline'),
      remark: Joi.string().allow('').optional()
    })
  }),

  checkIn: Joi.object({
    body: Joi.object({
      reservationId: Joi.number().integer().positive().required().messages({
        'any.required': '预订ID是必填项'
      }),
      roomId: Joi.number().integer().positive().required().messages({
        'any.required': '房间是必填项'
      }),
      guestName: Joi.string().required().messages({
        'string.empty': '客人姓名不能为空',
        'any.required': '客人姓名是必填项'
      }),
      guestPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.pattern.base': '请输入有效的手机号码',
        'any.required': '客人电话是必填项'
      }),
      guestIdCard: Joi.string().pattern(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).required().messages({
        'string.pattern.base': '请输入有效的身份证号码',
        'any.required': '身份证号是必填项'
      }),
      checkInDate: Joi.date().optional(),
      remark: Joi.string().allow('').optional()
    })
  }),

  checkOut: Joi.object({
    body: Joi.object({
      checkInRecordId: Joi.number().integer().positive().required().messages({
        'any.required': '入住记录ID是必填项'
      }),
      extraCharges: Joi.number().min(0).default(0),
      paymentMethod: Joi.string().valid('cash', 'wechat', 'alipay', 'credit_card', 'debit_card', 'transfer').required().messages({
        'any.required': '支付方式是必填项'
      }),
      remark: Joi.string().allow('').optional()
    })
  }),

  renew: Joi.object({
    body: Joi.object({
      checkInRecordId: Joi.number().integer().positive().required().messages({
        'any.required': '入住记录ID是必填项'
      }),
      days: Joi.number().integer().min(1).required().messages({
        'number.min': '续住天数至少1天',
        'any.required': '续住天数是必填项'
      }),
      roomPrice: Joi.number().positive().optional()
    })
  }),

  roomStatus: Joi.object({
    body: Joi.object({
      status: Joi.string().valid('vacant', 'occupied', 'maintenance', 'cleaning').required().messages({
        'any.required': '房间状态是必填项',
        'any.only': '无效的房间状态'
      }),
      remark: Joi.string().allow('').optional()
    })
  }),

  batchRoomStatus: Joi.object({
    body: Joi.object({
      ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        'array.min': '请至少选择一个房间',
        'any.required': '房间ID列表是必填项'
      }),
      status: Joi.string().valid('vacant', 'occupied', 'maintenance', 'cleaning').required().messages({
        'any.required': '房间状态是必填项',
        'any.only': '无效的房间状态'
      }),
      remark: Joi.string().allow('').optional()
    })
  }),

  refund: Joi.object({
    body: Joi.object({
      reservationId: Joi.number().integer().positive().required().messages({
        'any.required': '预订ID是必填项'
      }),
      amount: Joi.number().positive().required().messages({
        'number.positive': '退款金额必须大于0',
        'any.required': '退款金额是必填项'
      }),
      method: Joi.string().valid('cash', 'wechat', 'alipay', 'credit_card', 'debit_card', 'transfer').required().messages({
        'any.required': '退款方式是必填项'
      }),
      reason: Joi.string().required().messages({
        'string.empty': '退款原因不能为空',
        'any.required': '退款原因是必填项'
      })
    })
  }),

  pagination: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20)
    })
  }),

  lockRoom: Joi.object({
    body: Joi.object({
      reason: Joi.string().required().messages({
        'string.empty': '锁定原因不能为空',
        'any.required': '锁定原因是必填项'
      }),
      lockedUntil: Joi.date().greater('now').optional().messages({
        'date.greater': '锁定到期时间必须晚于当前时间'
      })
    })
  }),

  unlockRoom: Joi.object({
    body: Joi.object({
      remark: Joi.string().allow('').optional()
    })
  }),

  completeCleaning: Joi.object({
    body: Joi.object({
      remark: Joi.string().allow('').optional()
    })
  }),

  startMaintenance: Joi.object({
    body: Joi.object({
      reason: Joi.string().required().messages({
        'string.empty': '维护原因不能为空',
        'any.required': '维护原因是必填项'
      })
    })
  }),

  reportDate: Joi.object({
    query: Joi.object({
      startDate: Joi.date().required().messages({
        'any.required': '开始日期是必填项'
      }),
      endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
        'any.required': '结束日期是必填项',
        'date.min': '结束日期不能早于开始日期'
      })
    })
  }),

  cancelTimeout: Joi.object({
    body: Joi.object({
      timeoutMinutes: Joi.number().integer().min(5).default(30)
    })
  }),

  guestUpdate: Joi.object({
    body: Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '请输入有效的手机号码'
      }),
      idCard: Joi.string().pattern(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).optional().messages({
        'string.pattern.base': '请输入有效的身份证号码'
      }),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      address: Joi.string().allow('').optional(),
      remark: Joi.string().allow('').optional()
    })
  })
};

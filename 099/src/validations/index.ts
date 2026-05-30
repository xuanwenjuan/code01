import Joi from 'joi';
import { ForageStatus, HorseStatus, ApplicationStatus, ForageCategoryType, UserRole } from '../constants';

export const commonSchemas = {
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID必须是数字',
    'number.integer': 'ID必须是整数',
    'number.positive': 'ID必须是正数',
    'any.required': 'ID是必填项'
  }),

  page: Joi.number().integer().positive().default(1).messages({
    'number.base': '页码必须是数字',
    'number.integer': '页码必须是整数',
    'number.positive': '页码必须是正数'
  }),

  pageSize: Joi.number().integer().positive().max(200).default(10).messages({
    'number.base': '每页数量必须是数字',
    'number.integer': '每页数量必须是整数',
    'number.positive': '每页数量必须是正数',
    'number.max': '每页数量最大为200'
  }),

  dateRange: Joi.object({
    startDate: Joi.date().optional().messages({
      'date.base': '开始日期格式不正确'
    }),
    endDate: Joi.date().optional().greater(Joi.ref('startDate')).messages({
      'date.base': '结束日期格式不正确',
      'date.greater': '结束日期必须大于开始日期'
    })
  }),

  quantity: Joi.number().positive().precision(2).required().messages({
    'number.base': '数量必须是数字',
    'number.positive': '数量必须是正数',
    'number.precision': '数量最多保留两位小数',
    'any.required': '数量是必填项'
  }),

  price: Joi.number().positive().precision(2).required().messages({
    'number.base': '价格必须是数字',
    'number.positive': '价格必须是正数',
    'number.precision': '价格最多保留两位小数',
    'any.required': '价格是必填项'
  })
};

export const categorySchemas = {
  create: Joi.object({
    body: Joi.object({
      name: Joi.string().required().max(100).messages({
        'string.empty': '类目名称不能为空',
        'string.max': '类目名称最大100个字符',
        'any.required': '类目名称是必填项'
      }),
      code: Joi.string().required().max(50).alphanum().messages({
        'string.empty': '类目编码不能为空',
        'string.max': '类目编码最大50个字符',
        'string.alphanum': '类目编码只能包含字母和数字',
        'any.required': '类目编码是必填项'
      }),
      type: Joi.string().valid(...Object.values(ForageCategoryType)).required().messages({
        'any.only': '类目类型必须是 concentrate、forage、supplement 或 medicine',
        'any.required': '类目类型是必填项'
      }),
      parentId: Joi.number().integer().positive().allow(null).optional(),
      level: Joi.number().integer().positive().default(1),
      sortOrder: Joi.number().integer().default(0),
      description: Joi.string().allow('').optional().max(500).messages({
        'string.max': '描述最大500个字符'
      }),
      unit: Joi.string().default('kg').max(20).messages({
        'string.max': '单位最大20个字符'
      })
    })
  }),

  update: Joi.object({
    body: Joi.object({
      name: Joi.string().max(100).optional().messages({
        'string.max': '类目名称最大100个字符'
      }),
      code: Joi.string().max(50).alphanum().optional().messages({
        'string.max': '类目编码最大50个字符',
        'string.alphanum': '类目编码只能包含字母和数字'
      }),
      type: Joi.string().valid(...Object.values(ForageCategoryType)).optional().messages({
        'any.only': '类目类型必须是 concentrate、forage、supplement 或 medicine'
      }),
      parentId: Joi.number().integer().positive().allow(null).optional(),
      level: Joi.number().integer().positive().optional(),
      sortOrder: Joi.number().integer().optional(),
      status: Joi.string().valid(...Object.values(ForageStatus)).optional().messages({
        'any.only': '状态必须是 active、inactive 或 obsolete'
      }),
      description: Joi.string().allow('').optional().max(500).messages({
        'string.max': '描述最大500个字符'
      }),
      unit: Joi.string().max(20).optional().messages({
        'string.max': '单位最大20个字符'
      })
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  inventoryUpdate: Joi.object({
    body: Joi.object({
      quantity: commonSchemas.quantity,
      unitPrice: commonSchemas.price,
      remark: Joi.string().optional().max(200)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  list: Joi.object({
    query: Joi.object({
      page: commonSchemas.page,
      pageSize: commonSchemas.pageSize,
      type: Joi.string().valid(...Object.values(ForageCategoryType)).optional(),
      status: Joi.string().valid(...Object.values(ForageStatus)).optional(),
      keyword: Joi.string().optional()
    })
  })
};

export const horseSchemas = {
  create: Joi.object({
    body: Joi.object({
      horseNo: Joi.string().required().max(50).messages({
        'string.empty': '马匹编号不能为空',
        'string.max': '马匹编号最大50个字符',
        'any.required': '马匹编号是必填项'
      }),
      name: Joi.string().required().max(100).messages({
        'string.empty': '马匹名称不能为空',
        'string.max': '马匹名称最大100个字符',
        'any.required': '马匹名称是必填项'
      }),
      breed: Joi.string().required().max(100).messages({
        'string.empty': '品系不能为空',
        'string.max': '品系最大100个字符',
        'any.required': '品系是必填项'
      }),
      age: Joi.number().integer().positive().required().messages({
        'number.base': '年龄必须是数字',
        'number.integer': '年龄必须是整数',
        'number.positive': '年龄必须是正数',
        'any.required': '年龄是必填项'
      }),
      gender: Joi.string().valid('male', 'female').required().messages({
        'any.only': '性别必须是 male 或 female',
        'any.required': '性别是必填项'
      }),
      weight: Joi.number().positive().optional().messages({
        'number.base': '体重必须是数字',
        'number.positive': '体重必须是正数'
      }),
      trainingLevel: Joi.number().integer().positive().default(1),
      status: Joi.string().valid(...Object.values(HorseStatus)).default(HorseStatus.HEALTHY),
      stableId: Joi.number().integer().positive().optional(),
      trainerId: Joi.number().integer().positive().optional(),
      dailyRationStandard: Joi.string().optional().max(500),
      lastVaccinationDate: Joi.date().optional(),
      nextVaccinationDate: Joi.date().optional(),
      notes: Joi.string().optional().max(500)
    })
  }),

  update: Joi.object({
    body: Joi.object({
      horseNo: Joi.string().max(50).optional(),
      name: Joi.string().max(100).optional(),
      breed: Joi.string().max(100).optional(),
      age: Joi.number().integer().positive().optional(),
      gender: Joi.string().valid('male', 'female').optional(),
      weight: Joi.number().positive().optional(),
      trainingLevel: Joi.number().integer().positive().optional(),
      status: Joi.string().valid(...Object.values(HorseStatus)).optional(),
      stableId: Joi.number().integer().positive().allow(null).optional(),
      trainerId: Joi.number().integer().positive().allow(null).optional(),
      dailyRationStandard: Joi.string().optional().max(500),
      lastVaccinationDate: Joi.date().optional(),
      nextVaccinationDate: Joi.date().optional(),
      notes: Joi.string().optional().max(500)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  list: Joi.object({
    query: Joi.object({
      page: commonSchemas.page,
      pageSize: commonSchemas.pageSize,
      status: Joi.string().valid(...Object.values(HorseStatus)).optional(),
      breed: Joi.string().optional(),
      stableId: Joi.number().integer().positive().optional(),
      trainerId: Joi.number().integer().positive().optional(),
      keyword: Joi.string().optional(),
      gender: Joi.string().valid('male', 'female').optional(),
      minAge: Joi.number().integer().positive().optional(),
      maxAge: Joi.number().integer().positive().optional()
    })
  }),

  vaccination: Joi.object({
    body: Joi.object({
      vaccinationDate: Joi.date().required().messages({
        'date.base': '防疫日期格式不正确',
        'any.required': '防疫日期是必填项'
      }),
      nextVaccinationDate: Joi.date().optional().greater(Joi.ref('vaccinationDate')).messages({
        'date.base': '下次防疫日期格式不正确',
        'date.greater': '下次防疫日期必须大于本次防疫日期'
      }),
      vaccineName: Joi.string().optional().max(100),
      veterinarian: Joi.string().optional().max(100),
      remarks: Joi.string().optional().max(500)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  })
};

export const applicationSchemas = {
  create: Joi.object({
    body: Joi.object({
      stableId: Joi.number().integer().positive().required().messages({
        'number.base': '马舍ID必须是数字',
        'number.integer': '马舍ID必须是整数',
        'number.positive': '马舍ID必须是正数',
        'any.required': '马舍ID是必填项'
      }),
      trainerId: Joi.number().integer().positive().required().messages({
        'number.base': '驯养员ID必须是数字',
        'number.integer': '驯养员ID必须是整数',
        'number.positive': '驯养员ID必须是正数',
        'any.required': '驯养员ID是必填项'
      }),
      feedingTime: Joi.date().optional(),
      items: Joi.array().items(
        Joi.object({
          categoryId: Joi.number().integer().positive().required().messages({
            'any.required': '饲草类目ID是必填项'
          }),
          requestedQuantity: commonSchemas.quantity,
          notes: Joi.string().optional().max(200)
        })
      ).min(1).required().messages({
        'array.min': '至少需要一个申领物料',
        'any.required': '申领物料列表是必填项'
      }),
      notes: Joi.string().optional().max(500)
    })
  }),

  approve: Joi.object({
    body: Joi.object({
      items: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          approvedQuantity: commonSchemas.quantity,
          notes: Joi.string().optional().max(200)
        })
      ).min(1).required(),
      reason: Joi.string().optional().max(500)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  deliver: Joi.object({
    body: Joi.object({
      items: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          actualQuantity: commonSchemas.quantity,
          notes: Joi.string().optional().max(200)
        })
      ).min(1).required(),
      warehouseRemark: Joi.string().optional().max(200)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  returnItems: Joi.object({
    body: Joi.object({
      items: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          returnedQuantity: commonSchemas.quantity,
          reason: Joi.string().optional().max(200)
        })
      ).min(1).required()
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  damage: Joi.object({
    body: Joi.object({
      items: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          damagedQuantity: commonSchemas.quantity,
          reason: Joi.string().required().max(200).messages({
            'any.required': '报损原因是必填项'
          })
        })
      ).min(1).required()
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  reject: Joi.object({
    body: Joi.object({
      reason: Joi.string().required().max(500).messages({
        'string.empty': '驳回原因不能为空',
        'any.required': '驳回原因是必填项'
      })
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  }),

  list: Joi.object({
    query: Joi.object({
      page: commonSchemas.page,
      pageSize: commonSchemas.pageSize,
      status: Joi.string().valid(...Object.values(ApplicationStatus)).optional(),
      stableId: Joi.number().integer().positive().optional(),
      trainerId: Joi.number().integer().positive().optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional()
    })
  }),

  complete: Joi.object({
    body: Joi.object({
      feedingDuration: Joi.number().positive().optional(),
      feedingEffect: Joi.string().optional().max(500),
      remarks: Joi.string().optional().max(500)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  })
};

export const costSchemas = {
  generateDaily: Joi.object({
    query: Joi.object({
      date: Joi.date().optional()
    })
  }),

  generateMonthly: Joi.object({
    query: Joi.object({
      year: Joi.number().integer().positive().required(),
      month: Joi.number().integer().min(1).max(12).required()
    })
  }),

  report: Joi.object({
    query: Joi.object({
      type: Joi.string().valid('daily', 'monthly', 'yearly').required(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      categoryId: Joi.number().integer().positive().optional(),
      stableId: Joi.number().integer().positive().optional(),
      page: commonSchemas.page,
      pageSize: commonSchemas.pageSize
    })
  }),

  statistics: Joi.object({
    query: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required().greater(Joi.ref('startDate')),
      groupBy: Joi.string().valid('category', 'stable', 'date').default('category')
    })
  })
};

export const stableSchemas = {
  create: Joi.object({
    body: Joi.object({
      name: Joi.string().required().max(100).messages({
        'string.empty': '马舍名称不能为空',
        'string.max': '马舍名称最大100个字符',
        'any.required': '马舍名称是必填项'
      }),
      code: Joi.string().required().max(50).alphanum().messages({
        'string.empty': '马舍编号不能为空',
        'string.max': '马舍编号最大50个字符',
        'string.alphanum': '马舍编号只能包含字母和数字',
        'any.required': '马舍编号是必填项'
      }),
      location: Joi.string().optional().max(200),
      capacity: Joi.number().integer().positive().required().messages({
        'number.base': '容量必须是数字',
        'number.integer': '容量必须是整数',
        'number.positive': '容量必须是正数',
        'any.required': '容量是必填项'
      }),
      managerId: Joi.number().integer().positive().optional(),
      status: Joi.string().valid('active', 'inactive').default('active'),
      notes: Joi.string().optional().max(500)
    })
  }),

  update: Joi.object({
    body: Joi.object({
      name: Joi.string().max(100).optional(),
      code: Joi.string().max(50).alphanum().optional(),
      location: Joi.string().optional().max(200),
      capacity: Joi.number().integer().positive().optional(),
      managerId: Joi.number().integer().positive().allow(null).optional(),
      status: Joi.string().valid('active', 'inactive').optional(),
      notes: Joi.string().optional().max(500)
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  })
};

export const userSchemas = {
  login: Joi.object({
    body: Joi.object({
      username: Joi.string().required().messages({
        'string.empty': '用户名不能为空',
        'any.required': '用户名是必填项'
      }),
      password: Joi.string().min(6).required().messages({
        'string.empty': '密码不能为空',
        'string.min': '密码长度不能少于6个字符',
        'any.required': '密码是必填项'
      })
    })
  }),

  register: Joi.object({
    body: Joi.object({
      username: Joi.string().required().alphanum().min(3).max(50).messages({
        'string.empty': '用户名不能为空',
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名最小3个字符',
        'string.max': '用户名最大50个字符',
        'any.required': '用户名是必填项'
      }),
      password: Joi.string().min(6).required().messages({
        'string.empty': '密码不能为空',
        'string.min': '密码长度不能少于6个字符',
        'any.required': '密码是必填项'
      }),
      realName: Joi.string().required().max(50).messages({
        'string.empty': '真实姓名不能为空',
        'string.max': '真实姓名最大50个字符',
        'any.required': '真实姓名是必填项'
      }),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '手机号格式不正确'
      }),
      role: Joi.string().valid(...Object.values(UserRole)).required().messages({
        'any.only': '角色必须是 super_admin、admin、trainer、warehouse 或 purchaser',
        'any.required': '角色是必填项'
      })
    })
  }),

  update: Joi.object({
    body: Joi.object({
      realName: Joi.string().max(50).optional(),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '手机号格式不正确'
      }),
      status: Joi.string().valid('active', 'inactive').optional()
    }),
    params: Joi.object({
      id: commonSchemas.id
    })
  })
};

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
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json(ResponseUtil.badRequest(errors.join('; ')));
    }

    next();
  };
};

export const categorySchemas = {
  create: Joi.object({
    body: Joi.object({
      name: Joi.string().required().max(50).messages({
        'string.empty': '分类名称不能为空',
        'string.max': '分类名称长度不能超过50个字符'
      }),
      code: Joi.string().required().max(20).messages({
        'string.empty': '分类编码不能为空',
        'string.max': '分类编码长度不能超过20个字符'
      }),
      parentId: Joi.number().allow(null),
      level: Joi.number().default(1),
      icon: Joi.string().allow(null),
      description: Joi.string().allow(null),
      sort: Joi.number().default(0),
      status: Joi.number().valid(0, 1).default(1),
      isStop: Joi.number().valid(0, 1).default(0)
    })
  }),
  update: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      name: Joi.string().max(50),
      code: Joi.string().max(20),
      parentId: Joi.number().allow(null),
      level: Joi.number(),
      icon: Joi.string().allow(null),
      description: Joi.string().allow(null),
      sort: Joi.number(),
      status: Joi.number().valid(0, 1),
      isStop: Joi.number().valid(0, 1)
    })
  }),
  query: Joi.object({
    query: Joi.object({
      name: Joi.string().allow(''),
      status: Joi.number().valid(0, 1).allow(''),
      page: Joi.number().default(1),
      pageSize: Joi.number().default(10)
    })
  })
};

export const supplierSchemas = {
  create: Joi.object({
    body: Joi.object({
      name: Joi.string().required().max(100),
      code: Joi.string().required().max(20),
      contactPerson: Joi.string().required().max(50),
      contactPhone: Joi.string().required().max(20),
      email: Joi.string().email().allow(null),
      address: Joi.string().allow(null),
      businessLicense: Joi.string().allow(null),
      qualificationExpireDate: Joi.date().allow(null),
      supplyCategories: Joi.alternatives().try(Joi.string(), Joi.array()).allow(null),
      coverageAreas: Joi.alternatives().try(Joi.string(), Joi.array()).allow(null),
      cooperationYears: Joi.number().default(0),
      performanceScore: Joi.number().min(0).max(5).default(5.0),
      sort: Joi.number().default(0),
      status: Joi.number().valid(0, 1).default(1)
    })
  }),
  update: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      name: Joi.string().max(100),
      code: Joi.string().max(20),
      contactPerson: Joi.string().max(50),
      contactPhone: Joi.string().max(20),
      email: Joi.string().email().allow(null),
      address: Joi.string().allow(null),
      businessLicense: Joi.string().allow(null),
      qualificationExpireDate: Joi.date().allow(null),
      supplyCategories: Joi.alternatives().try(Joi.string(), Joi.array()).allow(null),
      coverageAreas: Joi.alternatives().try(Joi.string(), Joi.array()).allow(null),
      cooperationYears: Joi.number(),
      performanceScore: Joi.number().min(0).max(5),
      sort: Joi.number(),
      status: Joi.number().valid(0, 1)
    })
  }),
  query: Joi.object({
    query: Joi.object({
      name: Joi.string().allow(''),
      status: Joi.number().valid(0, 1).allow(''),
      contactPerson: Joi.string().allow(''),
      phone: Joi.string().allow(''),
      minScore: Joi.number().allow(''),
      maxScore: Joi.number().allow(''),
      qualificationExpireStart: Joi.date().allow(null),
      qualificationExpireEnd: Joi.date().allow(null),
      page: Joi.number().default(1),
      pageSize: Joi.number().default(10)
    })
  }),
  score: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      score: Joi.number().min(0).max(5).required(),
      reason: Joi.string().allow(null)
    })
  })
};

export const claimSchemas = {
  create: Joi.object({
    body: Joi.object({
      batchId: Joi.number().required(),
      productId: Joi.number().required(),
      quantity: Joi.number().min(1).default(1),
      receiverName: Joi.string().required().max(50),
      receiverPhone: Joi.string().required().max(20),
      receiverAddress: Joi.string().required().max(255),
      remark: Joi.string().allow(null)
    })
  }),
  update: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      productId: Joi.number(),
      quantity: Joi.number().min(1),
      receiverName: Joi.string().max(50),
      receiverPhone: Joi.string().max(20),
      receiverAddress: Joi.string().max(255),
      remark: Joi.string().allow(null)
    })
  }),
  approve: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      status: Joi.string().valid('approved', 'rejected').required(),
      remark: Joi.string().allow(null)
    })
  }),
  batchApprove: Joi.object({
    body: Joi.object({
      ids: Joi.array().items(Joi.number()).min(1).required(),
      status: Joi.string().valid('approved', 'rejected').required(),
      remark: Joi.string().allow(null)
    })
  }),
  ship: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      logisticsNo: Joi.string().max(50),
      logisticsCompany: Joi.string().max(100).allow(null)
    })
  }),
  query: Joi.object({
    query: Joi.object({
      status: Joi.string().allow(''),
      departmentId: Joi.number().allow(''),
      batchId: Joi.number().allow(''),
      startDate: Joi.date().allow(null),
      endDate: Joi.date().allow(null),
      page: Joi.number().default(1),
      pageSize: Joi.number().default(10)
    })
  })
};

export const settlementSchemas = {
  create: Joi.object({
    body: Joi.object({
      departmentId: Joi.number().required(),
      batchId: Joi.number().required(),
      remark: Joi.string().allow(null)
    })
  }),
  query: Joi.object({
    query: Joi.object({
      departmentId: Joi.number().allow(''),
      batchId: Joi.number().allow(''),
      status: Joi.number().valid(0, 1).allow(''),
      startDate: Joi.date().allow(null),
      endDate: Joi.date().allow(null),
      page: Joi.number().default(1),
      pageSize: Joi.number().default(10)
    })
  }),
  confirm: Joi.object({
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      remark: Joi.string().allow(null)
    })
  }),
  ledger: Joi.object({
    query: Joi.object({
      departmentId: Joi.number().allow(''),
      batchId: Joi.number().allow(''),
      startDate: Joi.date().allow(null),
      endDate: Joi.date().allow(null)
    })
  })
};

export const authSchemas = {
  login: Joi.object({
    body: Joi.object({
      username: Joi.string().required().max(50),
      password: Joi.string().required().max(50)
    })
  }),
  register: Joi.object({
    body: Joi.object({
      username: Joi.string().required().max(50),
      password: Joi.string().required().min(6).max(50),
      realName: Joi.string().required().max(50),
      phone: Joi.string().max(20),
      email: Joi.string().email().allow(null),
      departmentId: Joi.number().allow(null)
    })
  })
};

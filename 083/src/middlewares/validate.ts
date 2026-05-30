import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';

export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return ResponseUtil.badRequest(res, errors[0].message);
    }

    next();
  };
};

export const schemas = {
  auth: {
    login: Joi.object({
      username: Joi.string().required().messages({
        'string.empty': '用户名不能为空',
        'any.required': '用户名是必填项',
      }),
      password: Joi.string().required().messages({
        'string.empty': '密码不能为空',
        'any.required': '密码是必填项',
      }),
    }),
    register: Joi.object({
      username: Joi.string().min(3).max(50).required().messages({
        'string.empty': '用户名不能为空',
        'string.min': '用户名长度不能少于3个字符',
        'string.max': '用户名长度不能超过50个字符',
        'any.required': '用户名是必填项',
      }),
      password: Joi.string().min(6).max(50).required().messages({
        'string.empty': '密码不能为空',
        'string.min': '密码长度不能少于6个字符',
        'string.max': '密码长度不能超过50个字符',
        'any.required': '密码是必填项',
      }),
      realName: Joi.string().required().messages({
        'string.empty': '真实姓名不能为空',
        'any.required': '真实姓名是必填项',
      }),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '手机号码格式不正确',
      }),
      roleCode: Joi.string().required().messages({
        'any.required': '角色编码是必填项',
      }),
    }),
  },
  category: {
    create: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': '类目名称不能为空',
        'any.required': '类目名称是必填项',
      }),
      description: Joi.string().optional(),
      parentId: Joi.number().integer().optional(),
      sort: Joi.number().integer().min(0).default(0).optional(),
    }),
    update: Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      parentId: Joi.number().integer().optional(),
      sort: Joi.number().integer().min(0).optional(),
      status: Joi.string().valid('ACTIVE', 'DISABLED').optional(),
    }),
  },
  supplier: {
    create: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': '供应商名称不能为空',
        'any.required': '供应商名称是必填项',
      }),
      code: Joi.string().required().messages({
        'string.empty': '供应商编码不能为空',
        'any.required': '供应商编码是必填项',
      }),
      address: Joi.string().optional(),
      contactPerson: Joi.string().optional(),
      contactPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '联系电话格式不正确',
      }),
      qualification: Joi.string().optional(),
      qualificationExpiryDate: Joi.date().optional(),
      supplyCategories: Joi.string().optional(),
      supplyCycle: Joi.number().integer().optional(),
      paymentTerm: Joi.string().optional(),
      remark: Joi.string().optional(),
    }),
    update: Joi.object({
      name: Joi.string().optional(),
      code: Joi.string().optional(),
      address: Joi.string().optional(),
      contactPerson: Joi.string().optional(),
      contactPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
        'string.pattern.base': '联系电话格式不正确',
      }),
      qualification: Joi.string().optional(),
      qualificationExpiryDate: Joi.date().optional(),
      supplyCategories: Joi.string().optional(),
      supplyCycle: Joi.number().integer().optional(),
      paymentTerm: Joi.string().optional(),
      status: Joi.string().valid('COOPERATING', 'SUSPENDED', 'TERMINATED').optional(),
      remark: Joi.string().optional(),
    }),
  },
  part: {
    create: Joi.object({
      code: Joi.string().required().messages({
        'string.empty': '配件编码不能为空',
        'any.required': '配件编码是必填项',
      }),
      name: Joi.string().required().messages({
        'string.empty': '配件名称不能为空',
        'any.required': '配件名称是必填项',
      }),
      specification: Joi.string().optional(),
      vehicleModel: Joi.string().optional(),
      categoryId: Joi.number().integer().required().messages({
        'any.required': '类目ID是必填项',
      }),
      supplierId: Joi.number().integer().optional(),
      unitPrice: Joi.number().precision(2).positive().required().messages({
        'number.positive': '单价必须大于0',
        'any.required': '单价是必填项',
      }),
      unit: Joi.string().default('个').optional(),
      safeStock: Joi.number().integer().min(0).default(0).optional(),
      remark: Joi.string().optional(),
    }),
    update: Joi.object({
      code: Joi.string().optional(),
      name: Joi.string().optional(),
      specification: Joi.string().optional(),
      vehicleModel: Joi.string().optional(),
      categoryId: Joi.number().integer().optional(),
      supplierId: Joi.number().integer().optional(),
      unitPrice: Joi.number().precision(2).positive().optional().messages({
        'number.positive': '单价必须大于0',
      }),
      unit: Joi.string().optional(),
      safeStock: Joi.number().integer().min(0).optional(),
      remark: Joi.string().optional(),
    }),
  },
  purchaseOrder: {
    create: Joi.object({
      supplierId: Joi.number().integer().required().messages({
        'any.required': '供应商ID是必填项',
      }),
      expectedDate: Joi.date().optional(),
      remark: Joi.string().optional(),
      items: Joi.array()
        .items(
          Joi.object({
            partId: Joi.number().integer().required().messages({
              'any.required': '配件ID是必填项',
            }),
            quantity: Joi.number().integer().min(1).required().messages({
              'number.min': '采购数量必须大于0',
              'any.required': '采购数量是必填项',
            }),
            unitPrice: Joi.number().precision(2).positive().required().messages({
              'number.positive': '单价必须大于0',
              'any.required': '单价是必填项',
            }),
            remark: Joi.string().optional(),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': '至少需要一个采购明细',
          'any.required': '采购明细是必填项',
        }),
    }),
    update: Joi.object({
      supplierId: Joi.number().integer().optional(),
      expectedDate: Joi.date().optional(),
      remark: Joi.string().optional(),
      items: Joi.array()
        .items(
          Joi.object({
            partId: Joi.number().integer().optional(),
            quantity: Joi.number().integer().min(1).optional(),
            unitPrice: Joi.number().precision(2).positive().optional(),
            remark: Joi.string().optional(),
          })
        )
        .optional(),
    }),
    inspect: Joi.object({
      inspectorId: Joi.number().integer().optional(),
      items: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().integer().required().messages({
              'any.required': '明细ID是必填项',
            }),
            qualifiedQuantity: Joi.number().integer().min(0).required().messages({
              'number.min': '合格数量不能小于0',
              'any.required': '合格数量是必填项',
            }),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': '至少需要一个质检明细',
          'any.required': '质检明细是必填项',
        }),
      remark: Joi.string().optional(),
    }),
    inbound: Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().integer().required().messages({
              'any.required': '明细ID是必填项',
            }),
            batchNo: Joi.string().required().messages({
              'string.empty': '批次号不能为空',
              'any.required': '批次号是必填项',
            }),
            warehouseLocation: Joi.string().optional(),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': '至少需要一个入库明细',
          'any.required': '入库明细是必填项',
        }),
    }),
  },
  outboundOrder: {
    create: Joi.object({
      repairOrderNo: Joi.string().optional(),
      vehiclePlate: Joi.string().optional(),
      vehicleModel: Joi.string().optional(),
      remark: Joi.string().optional(),
      items: Joi.array()
        .items(
          Joi.object({
            partId: Joi.number().integer().required().messages({
              'any.required': '配件ID是必填项',
            }),
            quantity: Joi.number().integer().min(1).required().messages({
              'number.min': '领用数量必须大于0',
              'any.required': '领用数量是必填项',
            }),
            unitPrice: Joi.number().precision(2).positive().required().messages({
              'number.positive': '单价必须大于0',
              'any.required': '单价是必填项',
            }),
            remark: Joi.string().optional(),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': '至少需要一个领用明细',
          'any.required': '领用明细是必填项',
        }),
    }),
    scrap: Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().integer().required().messages({
              'any.required': '明细ID是必填项',
            }),
            quantity: Joi.number().integer().min(1).required().messages({
              'number.min': '报废数量必须大于0',
              'any.required': '报废数量是必填项',
            }),
            reason: Joi.string().optional(),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': '至少需要一个报废明细',
          'any.required': '报废明细是必填项',
        }),
    }),
    return: Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            id: Joi.number().integer().required().messages({
              'any.required': '明细ID是必填项',
            }),
            quantity: Joi.number().integer().min(1).required().messages({
              'number.min': '退回数量必须大于0',
              'any.required': '退回数量是必填项',
            }),
            batchNo: Joi.string().required().messages({
              'string.empty': '批次号不能为空',
              'any.required': '批次号是必填项',
            }),
            reason: Joi.string().optional(),
          })
        )
        .min(1)
        .required()
        .messages({
          'array.min': '至少需要一个退回明细',
          'any.required': '退回明细是必填项',
        }),
    }),
  },
  stock: {
    adjust: Joi.object({
      partId: Joi.number().integer().required().messages({
        'any.required': '配件ID是必填项',
      }),
      quantity: Joi.number().integer().required().messages({
        'any.required': '调整数量是必填项',
      }),
      remark: Joi.string().optional(),
    }),
  },
};

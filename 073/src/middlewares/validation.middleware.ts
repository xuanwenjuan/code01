import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '../utils/response';
import { ReagentCategoryType, SupplierStatus, StockStatus, RequisitionStatus } from '../types';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate({
      params: req.params,
      query: req.query,
      body: req.body
    }, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/["']/g, '')
      }));
      return ResponseUtil.error(res, '参数验证失败', 400, errors);
    }

    next();
  };
};

export const schemas = {
  auth: {
    register: Joi.object({
      body: Joi.object({
        username: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(6).max(50).required(),
        realName: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().optional(),
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
        department: Joi.string().max(100).optional(),
        role: Joi.string().valid('admin', 'teacher', 'researcher', 'warehouse').optional()
      })
    }),
    login: Joi.object({
      body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
      })
    }),
    changePassword: Joi.object({
      body: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).max(50).required()
      })
    })
  },

  category: {
    create: Joi.object({
      body: Joi.object({
        name: Joi.string().min(1).max(100).required(),
        code: Joi.string().min(1).max(50).required(),
        type: Joi.string().valid(...Object.values(ReagentCategoryType)).required(),
        parentId: Joi.number().integer().optional().allow(null),
        sortOrder: Joi.number().integer().min(0).default(0),
        description: Joi.string().optional()
      })
    }),
    update: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        name: Joi.string().min(1).max(100).optional(),
        code: Joi.string().min(1).max(50).optional(),
        type: Joi.string().valid(...Object.values(ReagentCategoryType)).optional(),
        parentId: Joi.number().integer().optional().allow(null),
        sortOrder: Joi.number().integer().min(0).optional(),
        description: Joi.string().optional()
      })
    }),
    getById: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      })
    })
  },

  supplier: {
    create: Joi.object({
      body: Joi.object({
        name: Joi.string().min(1).max(200).required(),
        code: Joi.string().min(1).max(50).required(),
        contactPerson: Joi.string().max(50).optional(),
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
        email: Joi.string().email().optional(),
        address: Joi.string().max(500).optional(),
        businessLicense: Joi.string().optional(),
        qualificationCert: Joi.string().optional(),
        qualificationExpiry: Joi.date().optional(),
        businessScope: Joi.string().optional(),
        supplyCategories: Joi.string().optional(),
        remarks: Joi.string().optional()
      })
    }),
    update: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        name: Joi.string().min(1).max(200).optional(),
        code: Joi.string().min(1).max(50).optional(),
        contactPerson: Joi.string().max(50).optional(),
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
        email: Joi.string().email().optional(),
        address: Joi.string().max(500).optional(),
        businessLicense: Joi.string().optional(),
        qualificationCert: Joi.string().optional(),
        qualificationExpiry: Joi.date().optional(),
        businessScope: Joi.string().optional(),
        supplyCategories: Joi.string().optional(),
        status: Joi.string().valid(...Object.values(SupplierStatus)).optional(),
        remarks: Joi.string().optional()
      })
    })
  },

  reagent: {
    create: Joi.object({
      body: Joi.object({
        name: Joi.string().min(1).max(200).required(),
        code: Joi.string().min(1).max(50).required(),
        casNo: Joi.string().max(50).optional(),
        molecularFormula: Joi.string().max(100).optional(),
        specification: Joi.string().max(200).required(),
        unit: Joi.string().max(20).required(),
        categoryId: Joi.number().integer().required(),
        supplierId: Joi.number().integer().required(),
        price: Joi.number().min(0).default(0),
        safetyLevel: Joi.string().max(50).optional(),
        storageCondition: Joi.string().max(200).optional(),
        description: Joi.string().optional()
      })
    }),
    update: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        name: Joi.string().min(1).max(200).optional(),
        code: Joi.string().min(1).max(50).optional(),
        casNo: Joi.string().max(50).optional(),
        molecularFormula: Joi.string().max(100).optional(),
        specification: Joi.string().max(200).optional(),
        unit: Joi.string().max(20).optional(),
        categoryId: Joi.number().integer().optional(),
        supplierId: Joi.number().integer().optional(),
        price: Joi.number().min(0).optional(),
        safetyLevel: Joi.string().max(50).optional(),
        storageCondition: Joi.string().max(200).optional(),
        description: Joi.string().optional()
      })
    })
  },

  stock: {
    inbound: Joi.object({
      body: Joi.object({
        reagentId: Joi.number().integer().required(),
        batchNo: Joi.string().min(1).max(100).required(),
        quantity: Joi.number().min(0.01).required(),
        unitPrice: Joi.number().min(0).default(0),
        productionDate: Joi.date().optional(),
        expiryDate: Joi.date().optional(),
        location: Joi.string().max(200).optional(),
        remarks: Joi.string().optional()
      })
    }),
    inspect: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        passed: Joi.boolean().required(),
        inspectionRemark: Joi.string().optional()
      })
    }),
    getFlows: Joi.object({
      query: Joi.object({
        stockId: Joi.number().integer().optional(),
        reagentId: Joi.number().integer().optional(),
        flowType: Joi.string().optional(),
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(100).default(10)
      })
    })
  },

  requisition: {
    create: Joi.object({
      body: Joi.object({
        department: Joi.string().max(100).optional(),
        purpose: Joi.string().min(1).required(),
        remarks: Joi.string().optional(),
        items: Joi.array().items(
          Joi.object({
            stockId: Joi.number().integer().required(),
            quantity: Joi.number().min(0.01).required(),
            remarks: Joi.string().optional()
          })
        ).min(1).required()
      })
    }),
    approve: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        approvalRemark: Joi.string().optional()
      })
    }),
    reject: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        approvalRemark: Joi.string().required()
      })
    }),
    returnItem: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        returnItems: Joi.array().items(
          Joi.object({
            itemId: Joi.number().integer().required(),
            quantity: Joi.number().min(0.01).required()
          })
        ).min(1).required()
      })
    }),
    scrap: Joi.object({
      params: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        remark: Joi.string().optional()
      })
    })
  }
};

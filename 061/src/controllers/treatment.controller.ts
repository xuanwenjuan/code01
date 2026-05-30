import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import TreatmentItem from '../models/TreatmentItem';
import TreatmentCategory from '../models/TreatmentCategory';
import BillingItem from '../models/BillingItem';
import Billing from '../models/Billing';
import { BillingStatus } from '../types';
import { success, paginatedSuccess, ApiError } from '../utils/response';

export const createTreatmentSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '项目名称不能为空',
  }),
  code: Joi.string().required().messages({
    'any.required': '项目编码不能为空',
  }),
  categoryId: Joi.number().required().messages({
    'any.required': '分类ID不能为空',
  }),
  price: Joi.number().positive().required().messages({
    'any.required': '价格不能为空',
    'number.positive': '价格必须大于0',
  }),
  costPrice: Joi.number().allow(null),
  unit: Joi.string().default('次'),
  duration: Joi.number().allow(null),
  description: Joi.string().allow(null, ''),
});

export const updateTreatmentSchema = Joi.object({
  name: Joi.string(),
  code: Joi.string(),
  categoryId: Joi.number(),
  price: Joi.number().positive(),
  costPrice: Joi.number().allow(null),
  unit: Joi.string(),
  duration: Joi.number().allow(null),
  description: Joi.string().allow(null, ''),
  status: Joi.string().valid('active', 'inactive'),
});

export const createTreatment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const existing = await TreatmentItem.findOne({ where: { code: data.code } });
    if (existing) {
      throw new ApiError('项目编码已存在', 400);
    }

    const category = await TreatmentCategory.findByPk(data.categoryId);
    if (!category) {
      throw new ApiError('分类不存在', 400);
    }

    const treatment = await TreatmentItem.create({
      ...data,
      status: 'active',
    });

    success(res, treatment, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateTreatment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const treatment = await TreatmentItem.findByPk(id);
    if (!treatment) {
      throw new ApiError('项目不存在', 404);
    }

    if (data.code && data.code !== treatment.code) {
      const existing = await TreatmentItem.findOne({ where: { code: data.code } });
      if (existing) {
        throw new ApiError('项目编码已存在', 400);
      }
    }

    if (data.categoryId) {
      const category = await TreatmentCategory.findByPk(data.categoryId);
      if (!category) {
        throw new ApiError('分类不存在', 400);
      }
    }

    if (data.status === 'inactive' && treatment.status === 'active') {
      const pendingBills = await BillingItem.count({
        where: { itemId: id },
        include: [{
          model: Billing,
          as: 'billing',
          where: {
            status: {
              [Op.in]: [BillingStatus.PENDING, BillingStatus.PAID]
            }
          }
        }]
      });
      
      if (pendingBills > 0) {
        throw new ApiError('该诊疗项目存在未完成或已支付的账单，无法停诊', 400);
      }
    }

    await treatment.update(data);
    success(res, treatment, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteTreatment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const treatment = await TreatmentItem.findByPk(id);
    if (!treatment) {
      throw new ApiError('项目不存在', 404);
    }

    const billingCount = await BillingItem.count({
      where: { itemId: id }
    });
    
    if (billingCount > 0) {
      throw new ApiError('该诊疗项目已关联账单数据，无法删除，请先停用', 400);
    }

    await treatment.destroy();
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getTreatment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const treatment = await TreatmentItem.findByPk(id, {
      include: [{ model: TreatmentCategory, as: 'category' }],
    });

    if (!treatment) {
      throw new ApiError('项目不存在', 404);
    }

    success(res, treatment);
  } catch (error) {
    next(error);
  }
};

export const getTreatmentList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, categoryId } = req.query;

    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const { count, rows } = await TreatmentItem.findAndCountAll({
      where,
      include: [{ model: TreatmentCategory, as: 'category' }],
      order: [['id', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import Billing from '../models/Billing';
import BillingItem from '../models/BillingItem';
import Patient from '../models/Patient';
import Staff from '../models/Staff';
import TreatmentItem from '../models/TreatmentItem';
import TreatmentRecord from '../models/TreatmentRecord';
import { BillingStatus, UserRole } from '../types';
import { success, paginatedSuccess, ApiError } from '../utils/response';
import sequelize from '../database';
import logger from '../utils/logger';

const generateBillNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BIL${timestamp}${random}`;
};

export const billingItemSchema = Joi.object({
  itemId: Joi.number().allow(null),
  itemName: Joi.string().required().messages({
    'any.required': '项目名称不能为空',
  }),
  itemType: Joi.string().valid('treatment', 'medicine', 'material', 'other').required().messages({
    'any.required': '项目类型不能为空',
  }),
  quantity: Joi.number().positive().required().messages({
    'any.required': '数量不能为空',
    'number.positive': '数量必须大于0',
  }),
  unitPrice: Joi.number().positive().required().messages({
    'any.required': '单价不能为空',
    'number.positive': '单价必须大于0',
  }),
  totalPrice: Joi.number().positive().required().messages({
    'any.required': '总价不能为空',
    'number.positive': '总价必须大于0',
  }),
  remark: Joi.string().allow(null, ''),
});

export const createBillingSchema = Joi.object({
  patientId: Joi.number().required().messages({
    'any.required': '患者ID不能为空',
    'number.base': '患者ID必须是数字',
  }),
  appointmentId: Joi.number().allow(null),
  treatmentRecordId: Joi.number().allow(null),
  doctorId: Joi.number().allow(null),
  discountAmount: Joi.number().min(0).default(0).messages({
    'number.min': '优惠金额不能为负数',
  }),
  items: Joi.array().items(billingItemSchema).required().messages({
    'any.required': '账单明细不能为空',
    'array.base': '账单明细必须是数组格式',
  }),
  remark: Joi.string().max(500).allow(null, '').messages({
    'string.max': '备注不能超过500字',
  }),
});

export const updateBillingSchema = Joi.object({
  doctorId: Joi.number().allow(null),
  discountAmount: Joi.number().min(0).messages({
    'number.min': '优惠金额不能为负数',
  }),
  status: Joi.string().valid(...Object.values(BillingStatus)),
  paymentMethod: Joi.string().allow(null, ''),
  remark: Joi.string().max(500).allow(null, '').messages({
    'string.max': '备注不能超过500字',
  }),
});

export const payBillingSchema = Joi.object({
  paymentMethod: Joi.string().required().messages({
    'any.required': '支付方式不能为空',
  }),
  paidAmount: Joi.number().positive().allow(null).messages({
    'number.positive': '支付金额必须大于0',
  }),
});

const mergeAndCalculateItems = async (items: any[], t: Transaction) => {
  const itemMap = new Map<string, {
    itemId?: number;
    itemName: string;
    itemType: 'treatment' | 'medicine' | 'material' | 'other';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    remark?: string;
  }>();

  for (const item of items) {
    let unitPrice = item.unitPrice;
    let itemName = item.itemName;

    if (item.itemId && !item.unitPrice) {
      const treatmentItem = await TreatmentItem.findByPk(item.itemId, { transaction: t });
      if (treatmentItem) {
        unitPrice = treatmentItem.price;
        itemName = treatmentItem.name;
      }
    }

    const key = `${item.itemType}-${item.itemId || itemName}-${item.remark || ''}`;

    if (itemMap.has(key)) {
      const existing = itemMap.get(key)!;
      existing.quantity += item.quantity;
      existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
      itemMap.set(key, {
        itemId: item.itemId,
        itemName: itemName,
        itemType: item.itemType as 'treatment' | 'medicine' | 'material' | 'other',
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: item.quantity * unitPrice,
        remark: item.remark,
      });
    }
  }

  return Array.from(itemMap.values());
};

export const createBilling = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { patientId, appointmentId, treatmentRecordId, doctorId, discountAmount, items, remark } = req.body;

    const patient = await Patient.findByPk(patientId, { transaction: t });
    if (!patient) {
      throw new ApiError('患者不存在', 400);
    }

    if (appointmentId) {
      const existingBilling = await Billing.findOne({
        where: { appointmentId, status: { [Op.ne]: BillingStatus.CANCELLED } },
        transaction: t,
      });
      if (existingBilling) {
        throw new ApiError('该预约已有未完成的账单', 400);
      }
    }

    const mergedItems = await mergeAndCalculateItems(items, t);

    let totalAmount = 0;
    mergedItems.forEach(item => {
      totalAmount += item.totalPrice;
    });

    const actualAmount = totalAmount - (discountAmount || 0);
    if (actualAmount < 0) {
      throw new ApiError('优惠金额不能大于总金额', 400);
    }

    const billing = await Billing.create({
      patientId,
      appointmentId,
      treatmentRecordId,
      doctorId,
      totalAmount,
      discountAmount: discountAmount || 0,
      actualAmount,
      paidAmount: 0,
      status: BillingStatus.PENDING,
      billNo: generateBillNo(),
      remark,
      createdBy: req.user.userId,
    }, { transaction: t });

    const billingItems = mergedItems.map(item => ({
      ...item,
      billingId: billing.id,
    }));

    await BillingItem.bulkCreate(billingItems, { transaction: t });

    await t.commit();

    logger.info(`创建账单成功: 账单号=${billing.billNo}, 患者ID=${patientId}, 总金额=${totalAmount}`);

    const result = await Billing.findByPk(billing.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: BillingItem, as: 'items' },
      ],
    });

    success(res, result, '创建成功');
  } catch (error) {
    await t.rollback();
    logger.error('创建账单失败:', error);
    next(error);
  }
};

export const updateBilling = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const data = req.body;

    const billing = await Billing.findByPk(id, { transaction: t });
    if (!billing) {
      throw new ApiError('账单不存在', 404);
    }

    if (billing.status === BillingStatus.PAID) {
      throw new ApiError('已支付的账单不能修改', 400);
    }

    await billing.update(data, { transaction: t });
    await t.commit();

    logger.info(`更新账单成功: 账单ID=${id}`);
    success(res, billing, '更新成功');
  } catch (error) {
    await t.rollback();
    logger.error('更新账单失败:', error);
    next(error);
  }
};

export const payBilling = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { paymentMethod, paidAmount } = req.body;

    const billing = await Billing.findByPk(id, { transaction: t });
    if (!billing) {
      throw new ApiError('账单不存在', 404);
    }

    if (billing.status === BillingStatus.PAID) {
      throw new ApiError('账单已支付', 400);
    }

    const amount = paidAmount || billing.actualAmount;

    await billing.update({
      status: BillingStatus.PAID,
      paymentMethod,
      paidAmount: amount,
      paymentTime: new Date(),
    }, { transaction: t });

    await t.commit();

    logger.info(`账单支付成功: 账单号=${billing.billNo}, 支付金额=${amount}`);
    success(res, billing, '支付成功');
  } catch (error) {
    await t.rollback();
    logger.error('账单支付失败:', error);
    next(error);
  }
};

export const refundBilling = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { refundAmount, reason } = req.body;

    const billing = await Billing.findByPk(id, { transaction: t });
    if (!billing) {
      throw new ApiError('账单不存在', 404);
    }

    if (billing.status !== BillingStatus.PAID && billing.status !== BillingStatus.PARTIAL_REFUND) {
      throw new ApiError('只能退款已支付或部分退款的账单', 400);
    }

    if (!reason) {
      throw new ApiError('退款原因不能为空', 400);
    }

    if (refundAmount > billing.paidAmount!) {
      throw new ApiError('退款金额不能大于已支付金额', 400);
    }

    const remaining = billing.paidAmount! - refundAmount;
    const newStatus = remaining > 0 ? BillingStatus.PARTIAL_REFUND : BillingStatus.REFUNDED;

    await billing.update({
      status: newStatus,
      paidAmount: remaining,
      remark: billing.remark ? `${billing.remark}。退款原因：${reason}` : `退款原因：${reason}`,
    }, { transaction: t });

    await t.commit();

    logger.info(`账单退款成功: 账单号=${billing.billNo}, 退款金额=${refundAmount}`);
    success(res, billing, '退款成功');
  } catch (error) {
    await t.rollback();
    logger.error('账单退款失败:', error);
    next(error);
  }
};

export const deleteBilling = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const billing = await Billing.findByPk(id, { transaction: t });
    if (!billing) {
      throw new ApiError('账单不存在', 404);
    }

    if (billing.status === BillingStatus.PAID) {
      throw new ApiError('已支付的账单不能删除', 400);
    }

    await BillingItem.destroy({ where: { billingId: id }, transaction: t });
    await billing.destroy({ transaction: t });

    await t.commit();
    success(res, null, '删除成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getBilling = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const billing = await Billing.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Staff, as: 'doctor' },
        { model: BillingItem, as: 'items' },
        { model: TreatmentRecord, as: 'treatmentRecord' },
      ],
    });

    if (!billing) {
      throw new ApiError('账单不存在', 404);
    }

    success(res, billing);
  } catch (error) {
    next(error);
  }
};

export const getBillingList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, patientId, doctorId, startDate, endDate } = req.query;
    const userRole = req.user.role;
    const userId = req.user.userId;

    const where: any = {};
    
    if (userRole === UserRole.DOCTOR) {
      where.doctorId = userId;
    } else if (userRole !== UserRole.ADMIN && doctorId) {
      where.doctorId = doctorId;
    } else if (userRole === UserRole.ADMIN && doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }
    if (patientId) {
      where.patientId = patientId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const patientWhere: any = {};
    if (keyword) {
      patientWhere.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Billing.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', where: Object.keys(patientWhere).length > 0 ? patientWhere : undefined },
        { model: Staff, as: 'doctor' },
      ],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    logger.error('查询账单列表失败:', error);
    next(error);
  }
};

export const getRevenueStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, doctorId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.userId;

    const where: any = {
      status: BillingStatus.PAID,
    };

    if (userRole === UserRole.DOCTOR) {
      where.doctorId = userId;
    } else if (doctorId) {
      where.doctorId = doctorId;
    }

    if (startDate && endDate) {
      where.paymentTime = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const billings = await Billing.findAll({
      where,
      attributes: ['paymentTime', 'actualAmount', 'paidAmount', 'discountAmount'],
    });

    const totalRevenue = billings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalDiscount = billings.reduce((sum, b) => sum + Number(b.discountAmount || 0), 0);
    const totalCount = billings.length;

    success(res, {
      totalRevenue,
      totalDiscount,
      totalCount,
      averageAmount: totalCount > 0 ? totalRevenue / totalCount : 0,
    });
  } catch (error) {
    logger.error('查询营收统计失败:', error);
    next(error);
  }
};

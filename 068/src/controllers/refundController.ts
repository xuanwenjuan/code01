import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Refund, { RefundStatus, RefundType } from '../models/Refund';
import Order, { OrderStatus } from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { ResponseUtil } from '../utils/response';
import { BadRequestError, NotFoundError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';
import logger from '../utils/logger';
import {
  validateRefundStatusTransition,
  getRefundStatusText,
  getRefundTypeText,
  validateRefundTypeForOrderStatus,
} from '../utils/refundFlow';

const createRefundSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  type: Joi.string().valid(...Object.values(RefundType)).required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().required(),
  images: Joi.string().optional(),
});

const auditSchema = Joi.object({
  status: Joi.string().valid(RefundStatus.APPROVED, RefundStatus.REJECTED).required(),
  auditRemark: Joi.string().optional(),
});

export const createRefund = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { error, value } = createRefundSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const { orderId, type, amount, reason, images } = value;
    const userId = req.user!.id;

    const order = await Order.findOne({
      where: { id: orderId, userId },
      transaction,
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    const validation = validateRefundTypeForOrderStatus(order.status, type);
    if (!validation.valid) {
      throw new BadRequestError(validation.message!);
    }

    const existingRefund = await Refund.findOne({
      where: {
        orderId,
        status: {
          [Op.in]: [RefundStatus.PENDING, RefundStatus.APPROVED, RefundStatus.REFUNDING],
        },
      },
      transaction,
    });

    if (existingRefund) {
      throw new BadRequestError('该订单已有退款申请在处理中');
    }

    const refundNo = `REF${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const refund = await Refund.create(
      {
        refundNo,
        orderId,
        userId,
        type,
        amount,
        reason,
        images,
        status: RefundStatus.PENDING,
      },
      { transaction }
    );

    await order.update(
      { status: OrderStatus.REFUNDING },
      { transaction }
    );

    await transaction.commit();

    logger.info(
      `用户 ${req.user?.username} 提交${getRefundTypeText(type)}申请 ${refundNo}，订单：${order.orderNo}，金额：${amount}`
    );

    return ResponseUtil.success(
      res,
      refund,
      `${getRefundTypeText(type)}申请已提交，请等待审核`
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getRefundList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user!.id;

    const whereCondition: any = { userId };
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await Refund.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Order,
          as: 'order',
        },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['id', 'DESC']],
    });

    return ResponseUtil.paginated(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '获取退款列表成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getRefundById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const refund = await Refund.findOne({
      where: { id, userId },
      include: [
        {
          model: Order,
          as: 'order',
        },
      ],
    });

    if (!refund) {
      throw new NotFoundError('退款申请不存在');
    }

    return ResponseUtil.success(res, refund, '获取退款详情成功');
  } catch (error) {
    next(error);
  }
};

export const auditRefund = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { error, value } = auditSchema.validate(req.body);

    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const { status, auditRemark } = value;

    const refund = await Refund.findByPk(id, {
      include: [{ model: Order, as: 'order' }],
      transaction,
    });

    if (!refund) {
      throw new NotFoundError('退款申请不存在');
    }

    validateRefundStatusTransition(refund.status, status);

    const oldStatus = refund.status;
    await refund.update(
      {
        status,
        auditRemark,
        auditTime: new Date(),
        refundTime: status === RefundStatus.APPROVED ? new Date() : undefined,
      },
      { transaction }
    );

    if (status === RefundStatus.APPROVED) {
      await refund.order!.update(
        { status: OrderStatus.REFUNDED },
        { transaction }
      );

      if (refund.type === RefundType.RETURN_AFTER_DELIVERY) {
        const orderItems = await OrderItem.findAll({
          where: { orderId: refund.orderId },
          transaction,
        });

        for (const item of orderItems) {
          const product = await Product.findByPk(item.productId, { transaction });
          if (product) {
            await product.update(
              { stock: product.stock + item.quantity },
              { transaction }
            );
            logger.info(`退货回库：${product.name} +${item.quantity} 件`);
          }
        }
      }

      logger.info(
        `财务 ${req.user?.username} 审核通过退款 ${refund.refundNo}，金额：${refund.amount}`
      );
    } else if (status === RefundStatus.REJECTED) {
      await refund.order!.update(
        { status: OrderStatus.PAID },
        { transaction }
      );

      logger.info(
        `财务 ${req.user?.username} 驳回退款 ${refund.refundNo}`
      );
    }

    await transaction.commit();

    return ResponseUtil.success(
      res,
      refund,
      `审核成功：${getRefundStatusText(oldStatus)} -> ${getRefundStatusText(status)}`
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getAdminRefundList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      type,
      startDate,
      endDate,
    } = req.query;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    if (type) {
      whereCondition.type = type;
    }
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(String(startDate)), new Date(String(endDate))],
      };
    }

    const { count, rows } = await Refund.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Order,
          as: 'order',
        },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['id', 'DESC']],
    });

    return ResponseUtil.paginated(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '获取退款列表成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getRefundStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const whereCondition: any = {
      status: RefundStatus.COMPLETED,
    };

    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(String(startDate)), new Date(String(endDate))],
      };
    }

    const refunds = await Refund.findAll({
      where: whereCondition,
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                },
              ],
            },
          ],
        },
      ],
    });

    const totalRefundCount = refunds.length;
    const totalRefundAmount = refunds.reduce((sum, r) => sum + Number(r.amount), 0);

    const categoryStats: any = {};
    for (const refund of refunds) {
      const order = refund.order;
      if (order && order.items) {
        for (const item of order.items) {
          if (item.product) {
            const catId = item.product.categoryId;
            if (!categoryStats[catId]) {
              categoryStats[catId] = {
                count: 0,
                amount: 0,
              };
            }
            categoryStats[catId].count += 1;
            categoryStats[catId].amount += Number(refund.amount);
          }
        }
      }
    }

    return ResponseUtil.success(
      res,
      {
        totalRefundCount,
        totalRefundAmount,
        categoryStats,
      },
      '获取退款统计成功'
    );
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatusLog, OrderReview, AuntProfile, User, ServiceCategory, Settlement } from '../models';
import { OrderStatus, UserRole, SettlementStatus } from '../types';
import { ResponseUtil } from '../utils/response';
import { OperationLogger } from '../utils/operationLogger';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import { Op } from 'sequelize';
import { config } from '../config';
import { sequelize } from '../database';

export const createOrderSchema = Joi.object({
  body: Joi.object({
    categoryId: Joi.number().integer().required().messages({
      'any.required': '服务类目ID不能为空',
    }),
    serviceAddress: Joi.string().min(5).max(500).required().messages({
      'string.min': '服务地址长度不能少于5个字符',
      'string.max': '服务地址长度不能超过500个字符',
      'any.required': '服务地址不能为空',
    }),
    servicePhone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '手机号格式不正确',
      'any.required': '联系电话不能为空',
    }),
    serviceTime: Joi.date().greater('now').required().messages({
      'date.greater': '服务时间必须大于当前时间',
      'any.required': '服务时间不能为空',
    }),
    serviceDuration: Joi.number().integer().min(1).max(24).required().messages({
      'number.min': '服务时长不能少于1小时',
      'number.max': '服务时长不能超过24小时',
      'any.required': '服务时长不能为空',
    }),
    contactName: Joi.string().min(2).max(50).required().messages({
      'string.min': '联系人姓名长度不能少于2个字符',
      'string.max': '联系人姓名长度不能超过50个字符',
      'any.required': '联系人姓名不能为空',
    }),
    requirement: Joi.string().max(2000).optional(),
  }),
});

export const payOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
});

export const assignOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
  body: Joi.object({
    auntId: Joi.number().integer().required().messages({
      'any.required': '阿姨ID不能为空',
    }),
  }),
});

export const acceptOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
});

export const startServiceSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
});

export const completeOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
});

export const cancelOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
  body: Joi.object({
    reason: Joi.string().max(500).optional(),
  }),
});

export const reviewOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
  body: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.min': '评分不能小于1',
      'number.max': '评分不能大于5',
      'any.required': '评分不能为空',
    }),
    content: Joi.string().max(2000).optional(),
    images: Joi.array().items(Joi.string()).max(9).optional(),
    serviceScore: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': '服务评分不能小于1',
      'number.max': '服务评分不能大于5',
      'any.required': '服务评分不能为空',
    }),
    attitudeScore: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': '态度评分不能小于1',
      'number.max': '态度评分不能大于5',
      'any.required': '态度评分不能为空',
    }),
    punctualityScore: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': '准时评分不能小于1',
      'number.max': '准时评分不能大于5',
      'any.required': '准时评分不能为空',
    }),
  }),
});

export const getOrderByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
});

export const getOrderStatusLogsSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '订单ID不能为空',
    }),
  }),
});

const generateOrderNo = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
};

const recordStatusChange = async (orderId: number, oldStatus: OrderStatus | undefined, newStatus: OrderStatus, operatorId?: number, operatorRole?: string, remark?: string) => {
  await OrderStatusLog.create({
    orderId,
    oldStatus,
    newStatus,
    operatorId,
    operatorRole,
    remark,
  });
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, serviceAddress, servicePhone, serviceTime, serviceDuration, contactName, requirement } = req.body;
    const userId = req.user!.userId;

    const category = await ServiceCategory.findByPk(categoryId);
    if (!category) {
      throw new NotFoundException('服务类目不存在');
    }

    const totalAmount = category.basePrice * serviceDuration;

    const orderNo = generateOrderNo();

    const expireTime = new Date(Date.now() + 30 * 60 * 1000);

    const order = await Order.create({
      orderNo,
      userId,
      categoryId,
      serviceAddress,
      servicePhone,
      serviceTime,
      serviceDuration,
      contactName,
      totalAmount,
      requirement,
      status: OrderStatus.PENDING_PAYMENT,
      expireTime,
    });

    await recordStatusChange(order.id, undefined, OrderStatus.PENDING_PAYMENT, userId, req.user!.role, '创建订单');

    res.json(ResponseUtil.created(order, '订单创建成功'));
  } catch (error) {
    next(error);
  }
};

export const payOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权操作他人订单');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('订单状态不正确');
    }

    const oldStatus = order.status;
    await order.update({
      status: OrderStatus.PENDING_DISPATCH,
      actualAmount: order.totalAmount,
    });

    await recordStatusChange(order.id, oldStatus, OrderStatus.PENDING_DISPATCH, userId, req.user!.role, '支付成功');

    res.json(ResponseUtil.success(order, '支付成功'));
  } catch (error) {
    next(error);
  }
};

export const assignOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { auntId } = req.body;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING_DISPATCH) {
      throw new BadRequestException('订单状态不正确');
    }

    const aunt = await AuntProfile.findByPk(auntId, { transaction });
    if (!aunt) {
      throw new NotFoundException('阿姨不存在');
    }

    const oldStatus = order.status;
    await order.update(
      {
        auntId,
        status: OrderStatus.DISPATCHED,
      },
      { transaction }
    );

    await OrderStatusLog.create(
      {
        orderId: order.id,
        oldStatus,
        newStatus: OrderStatus.DISPATCHED,
        operatorId: userId,
        operatorRole: req.user!.role,
        remark: '平台派单',
      },
      { transaction }
    );

    await OperationLogger.logOrder('assign', req, order.id, `派单给阿姨: ${aunt.realName}`);

    await transaction.commit();

    res.json(ResponseUtil.success(order, '派单成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const acceptOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const aunt = await AuntProfile.findOne({ where: { userId } });
    if (!aunt) {
      throw new ForbiddenException('您不是阿姨身份');
    }

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.auntId !== aunt.id) {
      throw new ForbiddenException('无权操作他人订单');
    }

    if (order.status !== OrderStatus.DISPATCHED) {
      throw new BadRequestException('订单状态不正确');
    }

    const oldStatus = order.status;
    await order.update({
      status: OrderStatus.ACCEPTED,
      acceptTime: new Date(),
    });

    await recordStatusChange(order.id, oldStatus, OrderStatus.ACCEPTED, userId, req.user!.role, '阿姨接单');

    res.json(ResponseUtil.success(order, '接单成功'));
  } catch (error) {
    next(error);
  }
};

export const startService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const aunt = await AuntProfile.findOne({ where: { userId } });
    if (!aunt) {
      throw new ForbiddenException('您不是阿姨身份');
    }

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.auntId !== aunt.id) {
      throw new ForbiddenException('无权操作他人订单');
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('订单状态不正确');
    }

    const oldStatus = order.status;
    await order.update({
      status: OrderStatus.IN_SERVICE,
      startTime: new Date(),
    });

    await recordStatusChange(order.id, oldStatus, OrderStatus.IN_SERVICE, userId, req.user!.role, '开始服务');

    res.json(ResponseUtil.success(order, '开始服务'));
  } catch (error) {
    next(error);
  }
};

export const completeOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (req.user!.role !== UserRole.ADMIN && order.userId !== userId) {
      const aunt = await AuntProfile.findOne({ where: { userId }, transaction });
      if (!aunt || order.auntId !== aunt.id) {
        throw new ForbiddenException('无权操作他人订单');
      }
    }

    if (order.status !== OrderStatus.IN_SERVICE) {
      throw new BadRequestException('订单状态不正确');
    }

    const oldStatus = order.status;
    await order.update(
      {
        status: OrderStatus.COMPLETED,
        completeTime: new Date(),
      },
      { transaction }
    );

    await OrderStatusLog.create(
      {
        orderId: order.id,
        oldStatus,
        newStatus: OrderStatus.COMPLETED,
        operatorId: userId,
        operatorRole: req.user!.role,
        remark: '服务完成',
      },
      { transaction }
    );

    const commissionRate = config.platform.commissionRate;
    const platformCommission = Number((order.totalAmount * commissionRate).toFixed(2));
    const auntIncome = Number((order.totalAmount - platformCommission).toFixed(2));

    await order.update(
      {
        platformCommission,
        auntIncome,
      },
      { transaction }
    );

    if (order.auntId) {
      const settlementNo = `SET${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      await Settlement.create(
        {
          settlementNo,
          auntId: order.auntId,
          orderId: order.id,
          orderAmount: order.totalAmount,
          commissionRate,
          commissionAmount: platformCommission,
          auntAmount: auntIncome,
          status: SettlementStatus.PENDING,
        },
        { transaction }
      );

      await AuntProfile.increment('orderCount', {
        where: { id: order.auntId },
        transaction,
      });
    }

    await OperationLogger.logOrder('update', req, order.id, '订单完成服务');

    await transaction.commit();

    res.json(ResponseUtil.success(order, '订单完成'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId && req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('无权操作他人订单');
    }

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.EXPIRED].includes(order.status)) {
      throw new BadRequestException('订单已完成或已取消，无法再次取消');
    }

    const oldStatus = order.status;
    await order.update({
      status: OrderStatus.CANCELLED,
      cancelReason: reason,
    });

    await recordStatusChange(order.id, oldStatus, OrderStatus.CANCELLED, userId, req.user!.role, `取消订单: ${reason || '未填写原因'}`);

    res.json(ResponseUtil.success(order, '订单已取消'));
  } catch (error) {
    next(error);
  }
};

export const reviewOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating, content, images, serviceScore, attitudeScore, punctualityScore } = req.body;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权评价他人订单');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('订单未完成，无法评价');
    }

    const existingReview = await OrderReview.findOne({ where: { orderId: id } });
    if (existingReview) {
      throw new BadRequestException('订单已评价');
    }

    const review = await OrderReview.create({
      orderId: id,
      userId,
      auntId: order.auntId!,
      rating,
      content,
      images: images ? JSON.stringify(images) : undefined,
      serviceScore,
      attitudeScore,
      punctualityScore,
    });

    if (order.auntId) {
      const reviews = await OrderReview.findAll({ where: { auntId: order.auntId } });
      const avgRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;
      await AuntProfile.update({ avgRating }, { where: { id: order.auntId } });
    }

    res.json(ResponseUtil.success(review, '评价成功'));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: AuntProfile, as: 'aunt' },
        { model: ServiceCategory, as: 'category' },
        { model: OrderStatusLog, as: 'statusLogs', order: [['createdAt', 'ASC']] },
        { model: OrderReview, as: 'review' },
      ],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (req.user!.role !== UserRole.ADMIN && order.userId !== req.user!.userId) {
      const aunt = await AuntProfile.findOne({ where: { userId: req.user!.userId } });
      if (!aunt || order.auntId !== aunt.id) {
        throw new ForbiddenException('无权查看他人订单');
      }
    }

    res.json(ResponseUtil.success(order, '获取订单成功'));
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user!.userId;
    const role = req.user!.role;

    let whereCondition: any = {};

    if (role === UserRole.USER) {
      whereCondition.userId = userId;
    } else if (role === UserRole.AUNT) {
        const aunt = await AuntProfile.findOne({ where: { userId } });
        if (aunt) {
          whereCondition.auntId = aunt.id;
        } else {
          whereCondition.auntId = 0;
        }
    }

    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: AuntProfile, as: 'aunt' },
        { model: ServiceCategory, as: 'category' },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取订单列表成功'));
  } catch (error) {
    next(error);
  }
};

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: AuntProfile, as: 'aunt' },
        { model: ServiceCategory, as: 'category' },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取订单列表成功'));
  } catch (error) {
    next(error);
  }
};

export const getOrderStatusLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const logs = await OrderStatusLog.findAll({
      where: { orderId: id },
      order: [['createdAt', 'ASC']],
    });

    res.json(ResponseUtil.success(logs, '获取状态日志成功'));
  } catch (error) {
    next(error);
  }
};

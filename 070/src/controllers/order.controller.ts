import { Response } from 'express';
import { ApiResponse } from '../utils/response';
import { Order, User, Category, sequelize, OperationLog, Influencer } from '../models';
import { AuthRequest } from '../middleware/auth';
import { OrderStatus, ORDER_STATUS_FLOW, CategoryStatus, InfluencerStatus } from '../utils/constants';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Op } from 'sequelize';
import Joi from 'joi';

export const createOrderSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  budget: Joi.number().required(),
  deadline: Joi.date().allow(null),
  requirements: Joi.any(),
});

export const updateOrderSchema = Joi.object({
  categoryId: Joi.number().integer(),
  title: Joi.string(),
  description: Joi.string().allow(''),
  budget: Joi.number(),
  deadline: Joi.date().allow(null),
  requirements: Joi.any(),
});

export const matchInfluencerSchema = Joi.object({
  influencerId: Joi.number().integer().required(),
});

const generateOrderNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${timestamp}${random}`;
};

export const getOrderList = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, pageSize = 10, status, categoryId } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (req.user!.role === 'merchant') {
      where.merchantId = req.user!.id;
    } else if (req.user!.role === 'influencer') {
      where.influencerId = req.user!.id;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'merchant', attributes: ['id', 'username', 'nickname'] },
        { model: User, as: 'influencer', attributes: ['id', 'username', 'nickname'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    return ApiResponse.paginated(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    return ApiResponse.error(res, '获取订单列表失败');
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'merchant', attributes: ['id', 'username', 'nickname'] },
        { model: User, as: 'influencer', attributes: ['id', 'username', 'nickname'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    return ApiResponse.success(res, order);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '获取订单失败');
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { categoryId, title, description, budget, deadline, requirements } = req.body;

    const category = await Category.findByPk(categoryId, { transaction: t });
    if (!category) {
      throw new BadRequestError('分类不存在');
    }

    if (category.status !== CategoryStatus.ACTIVE) {
      throw new BadRequestError(`分类 "${category.name}" 未启用招商，无法创建订单`);
    }

    const expireDays = 7;
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expireDays);

    const order = await Order.create(
      {
        orderNo: generateOrderNo(),
        merchantId: req.user!.id,
        categoryId,
        title,
        description,
        budget,
        deadline,
        requirements,
        status: OrderStatus.PUBLISHED,
        expireAt,
      },
      { transaction: t }
    );

    await OperationLog.create(
      {
        userId: req.user!.id,
        username: req.user!.username,
        module: 'order',
        operation: 'create',
        method: 'POST',
        url: '/api/orders',
        params: { body: req.body },
        result: { orderId: order.id, orderNo: order.orderNo },
        status: true,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.created(res, order, '订单创建成功');
  } catch (error) {
    await t.rollback();
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '创建订单失败');
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (req.user!.role !== 'admin' && order.merchantId !== req.user!.id) {
      return ApiResponse.forbidden(res, '无权限修改');
    }

    if (![OrderStatus.PUBLISHED, OrderStatus.MATCHING].includes(order.status as OrderStatus)) {
      throw new BadRequestError('当前状态不允许修改');
    }

    await order.update(req.body);

    return ApiResponse.success(res, order, '订单更新成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '更新订单失败');
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    const currentStatus = order.status as OrderStatus;
    const allowedStatuses = ORDER_STATUS_FLOW[currentStatus];

    if (!allowedStatuses.includes(status as OrderStatus)) {
      throw new BadRequestError(`无法从 ${currentStatus} 变更为 ${status}`);
    }

    const updateData: any = { status };

    if (status === OrderStatus.SCRIPT_CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    if (notes) {
      if (status === OrderStatus.NEGOTIATING) {
        updateData.negotiationNotes = notes;
      } else if (status === OrderStatus.COMPLETED) {
        updateData.completionNotes = notes;
      }
    }

    await order.update(updateData);

    return ApiResponse.success(res, null, '订单状态更新成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '更新订单状态失败');
  }
};

export const matchInfluencer = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { influencerId } = req.body;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.status !== OrderStatus.PUBLISHED && order.status !== OrderStatus.MATCHING) {
      throw new BadRequestError('当前状态不允许匹配达人');
    }

    const influencer = await Influencer.findOne({
      where: { userId: influencerId },
      include: [{ model: User, as: 'user' }],
      transaction: t,
    });
    
    if (!influencer) {
      throw new BadRequestError('达人不存在');
    }

    if (influencer.status !== InfluencerStatus.APPROVED) {
      throw new BadRequestError('达人未通过审核，无法匹配');
    }

    if (influencer.categoryIds && Array.isArray(influencer.categoryIds)) {
      const categoryMatch = influencer.categoryIds.includes(order.categoryId);
      if (!categoryMatch) {
        throw new BadRequestError('该达人未绑定此订单所属分类');
      }
    }

    await order.update(
      {
        influencerId,
        status: OrderStatus.MATCHING,
      },
      { transaction: t }
    );

    await OperationLog.create(
      {
        userId: req.user!.id,
        username: req.user!.username,
        module: 'order',
        operation: 'match',
        method: 'PUT',
        url: `/api/orders/${id}/match`,
        params: { orderId: id, influencerId },
        result: { orderNo: order.orderNo },
        status: true,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.success(res, null, '达人匹配成功');
  } catch (error) {
    await t.rollback();
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '匹配达人失败');
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (req.user!.role !== 'admin' && order.merchantId !== req.user!.id) {
      return ApiResponse.forbidden(res, '无权限取消');
    }

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError('当前状态不允许取消');
    }

    await order.update({
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
    });

    return ApiResponse.success(res, null, '订单取消成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '取消订单失败');
  }
};

export const submitVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { videoUrl, publishUrl } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.influencerId !== req.user!.id) {
      return ApiResponse.forbidden(res, '无权限操作');
    }

    if (order.status !== OrderStatus.SCRIPT_CONFIRMED && order.status !== OrderStatus.SHOOTING) {
      throw new BadRequestError('当前状态不允许提交视频');
    }

    await order.update({
      videoUrl,
      publishUrl,
      status: OrderStatus.VIDEO_PUBLISHED,
    });

    return ApiResponse.success(res, null, '视频提交成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '提交视频失败');
  }
};

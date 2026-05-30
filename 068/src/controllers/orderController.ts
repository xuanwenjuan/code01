import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import Order, { OrderStatus } from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import Address from '../models/Address';
import { ResponseUtil } from '../utils/response';
import { BadRequestError, NotFoundError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database';
import logger from '../utils/logger';
import {
  validateOrderStatusTransition,
  getOrderStatusText,
  autoTransitionAfterPayment,
} from '../utils/orderFlow';

const createOrderSchema = Joi.object({
  addressId: Joi.number().integer().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  remark: Joi.string().optional(),
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const { addressId, items, remark } = value;
    const userId = req.user!.id;

    const address = await Address.findOne({
      where: { id: addressId, userId },
      transaction,
    });
    if (!address) {
      throw new BadRequestError('收货地址不存在');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: true,
      });
      if (!product) {
        throw new BadRequestError(`商品 ${item.productId} 不存在`);
      }
      if (product.status !== 1) {
        throw new BadRequestError(`商品 ${product.name} 已下架`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(`商品 ${product.name} 库存不足，剩余：${product.stock}`);
      }

      const itemPrice = Number(product.price);
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images ? JSON.parse(product.images)[0] : null,
        price: itemPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });

      await product.update(
        { stock: product.stock - item.quantity },
        { transaction }
      );

      logger.info(`锁定商品库存：${product.name} - ${item.quantity} 件，剩余：${product.stock - item.quantity}`);
    }

    const orderNo = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = await Order.create(
      {
        orderNo,
        userId,
        addressId,
        totalAmount,
        payAmount: totalAmount,
        status: OrderStatus.UNPAID,
        remark,
      },
      { transaction }
    );

    for (const item of orderItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          ...item,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const orderWithItems = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    logger.info(`用户 ${req.user?.username} 创建订单 ${orderNo} 成功，总金额：${totalAmount}`);

    return ResponseUtil.success(res, orderWithItems, '创建订单成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user!.id;

    const whereCondition: any = { userId };
    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: 'items',
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
      '获取订单列表成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: Address,
          as: 'address',
        },
      ],
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    return ResponseUtil.success(res, order, '获取订单成功');
  } catch (error) {
    next(error);
  }
};

export const payOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await Order.findOne({
      where: { id, userId },
      transaction,
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    validateOrderStatusTransition(order.status, OrderStatus.PAID);

    const transition = autoTransitionAfterPayment();
    await order.update(
      {
        status: transition.newStatus,
        payTime: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 支付订单 ${order.orderNo} 成功`);

    return ResponseUtil.success(res, order, transition.message);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;

    const order = await Order.findOne({
      where: { id, userId },
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    validateOrderStatusTransition(order.status, OrderStatus.CANCELLED);

    for (const item of order.items!) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (product) {
        await product.update(
          { stock: product.stock + item.quantity },
          { transaction }
        );
        logger.info(`释放商品库存：${product.name} +${item.quantity} 件`);
      }
    }

    await order.update(
      {
        status: OrderStatus.CANCELLED,
        cancelReason: reason || '用户取消',
        cancelTime: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`用户 ${req.user?.username} 取消订单 ${order.orderNo} 成功`);

    return ResponseUtil.success(res, order, '取消订单成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestError('无效的订单状态');
    }

    const order = await Order.findByPk(id);
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    validateOrderStatusTransition(order.status, status);

    const oldStatus = order.status;
    await order.update({ status });

    logger.info(
      `管理员 ${req.user?.username} 更新订单 ${order.orderNo} 状态：${getOrderStatusText(oldStatus)} -> ${getOrderStatusText(status)}`
    );

    return ResponseUtil.success(
      res,
      order,
      `订单状态更新成功：${getOrderStatusText(oldStatus)} -> ${getOrderStatusText(status)}`
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      orderNo,
      startDate,
      endDate,
    } = req.query;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    if (orderNo) {
      whereCondition.orderNo = { [Op.like]: `%${orderNo}%` };
    }
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [new Date(String(startDate)), new Date(String(endDate))],
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: Address,
          as: 'address',
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
      '获取订单列表成功'
    );
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { Order, OrderItem, Product, User, Artist } from '../models';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { OrderStatus, PaginatedResult, ArtistStatus, CategoryStatus } from '../types';
import { sequelize } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { Op, Transaction } from 'sequelize';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const userId = req.user!.userId;
    const { items, shippingAddress, customNote, shippingPhone, shippingName } = req.body;

    if (!items || items.length === 0) {
      throw new AppError('订单不能为空', 400, 400);
    }

    const orderNo = generateOrderNo();
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { 
        transaction: t,
        include: [{ model: Artist, as: 'artist' }]
      });

      if (!product) {
        throw new AppError(`商品 ${item.productId} 不存在`, 400, 400);
      }

      if (!product.isActive) {
        throw new AppError(`商品 ${product.name} 已下架`, 400, 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`商品 ${product.name} 库存不足`, 400, 400);
      }

      if (product.artist && product.artist.status !== ArtistStatus.APPROVED) {
        throw new AppError(`商品 ${product.name} 的艺术家未通过审核`, 400, 400);
      }

      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        artistId: product.artistId,
        productName: product.name,
        productPrice: product.price,
        quantity: item.quantity,
        subtotal
      });

      await product.update(
        { stock: product.stock - item.quantity, salesCount: product.salesCount + item.quantity },
        { transaction: t }
      );
    }

    const order = await Order.create(
      {
        orderNo,
        userId,
        totalAmount,
        status: OrderStatus.PENDING_PAYMENT,
        shippingAddress,
        shippingPhone,
        shippingName,
        customNote
      },
      { transaction: t }
    );

    for (const orderItem of orderItems) {
      orderItem.orderId = order.id;
      await OrderItem.create(orderItem, { transaction: t });
    }

    await t.commit();

    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    res.status(201).json(ResponseUtil.success(result, '订单创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, pageSize = 10, status, startDate, endDate } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Order> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      throw new AppError('订单不存在', 404, 404);
    }

    if (order.userId !== userId) {
      throw new AppError('无权查看此订单', 403, 403);
    }

    res.json(ResponseUtil.success(order));
  } catch (error) {
    next(error);
  }
};

export const payOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { paymentMethod } = req.body;

    const order = await Order.findByPk(id, { transaction: t });

    if (!order) {
      throw new AppError('订单不存在', 404, 404);
    }

    if (order.userId !== userId) {
      throw new AppError('无权操作此订单', 403, 403);
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new AppError('订单状态不正确，无法支付', 400, 400);
    }

    await order.update({
      status: OrderStatus.PAID,
      paymentMethod: paymentMethod || 'online',
      paymentTime: new Date()
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(order, '支付成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const shipOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { trackingNumber, shippingCompany } = req.body;

    const order = await Order.findByPk(id, { 
      transaction: t,
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      throw new AppError('订单不存在', 404, 404);
    }

    if (order.status !== OrderStatus.PAID) {
      throw new AppError('订单状态不正确，无法发货', 400, 400);
    }

    await order.update({
      status: OrderStatus.SHIPPED,
      trackingNumber,
      shippingCompany,
      shippingTime: new Date()
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(order, '发货成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const receiveOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const order = await Order.findByPk(id, { transaction: t });

    if (!order) {
      throw new AppError('订单不存在', 404, 404);
    }

    if (order.userId !== userId) {
      throw new AppError('无权操作此订单', 403, 403);
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new AppError('订单状态不正确，无法确认收货', 400, 400);
    }

    await order.update({
      status: OrderStatus.COMPLETED,
      receiveTime: new Date()
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(order, '收货成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { cancelReason } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    });

    if (!order) {
      throw new AppError('订单不存在', 404, 404);
    }

    if (order.userId !== userId) {
      throw new AppError('无权操作此订单', 403, 403);
    }

    if (![OrderStatus.PENDING_PAYMENT, OrderStatus.PAID].includes(order.status)) {
      throw new AppError('订单状态不正确，无法取消', 400, 400);
    }

    for (const item of order.items!) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        await product.update(
          { stock: product.stock + item.quantity },
          { transaction: t }
        );
      }
    }

    await order.update(
      {
        status: OrderStatus.CANCELLED,
        cancelReason: cancelReason || '用户取消',
        cancelTime: new Date()
      },
      { transaction: t }
    );

    await t.commit();
    res.json(ResponseUtil.success(order, '订单取消成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, orderNo, startDate, endDate, userId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (orderNo) {
      where.orderNo = { [Op.like]: `%${orderNo}%` };
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (userId) {
      where.userId = userId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Order> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getArtistOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, pageSize = 10, status } = req.query;

    const artist = await Artist.findOne({ where: { userId } });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 404, 404);
    }

    const orderItems = await OrderItem.findAll({
      where: { artistId: artist.id },
      attributes: ['orderId'],
      group: ['orderId']
    });

    const orderIds = orderItems.map(item => item.orderId);

    const where: any = { id: { [Op.in]: orderIds } };

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items', where: { artistId: artist.id } },
        { model: User, as: 'user', attributes: { exclude: ['password'] } }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Order> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalOrders = await Order.count();
    const pendingPayment = await Order.count({ where: { status: OrderStatus.PENDING_PAYMENT } });
    const paid = await Order.count({ where: { status: OrderStatus.PAID } });
    const shipped = await Order.count({ where: { status: OrderStatus.SHIPPED } });
    const completed = await Order.count({ where: { status: OrderStatus.COMPLETED } });
    const cancelled = await Order.count({ where: { status: OrderStatus.CANCELLED } });

    const totalAmount = await Order.sum('totalAmount', {
      where: { status: { [Op.in]: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.COMPLETED] } }
    }) || 0;

    res.json(ResponseUtil.success({
      totalOrders,
      pendingPayment,
      paid,
      shipped,
      completed,
      cancelled,
      totalAmount
    }));
  } catch (error) {
    next(error);
  }
};

function generateOrderNo(): string {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

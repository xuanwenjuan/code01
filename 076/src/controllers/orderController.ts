import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import { Order, OrderStatusLog, Product, User, Recipe, RecipeItem, Ingredient, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { OrderStatus, UserRole } from '../types';
import { validateTransition, getTransitionDescription } from '../utils/orderStatusFlow';

const generateOrderNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  const random = Math.random().toString(36).slice(-4).toUpperCase();
  return `ORD${timestamp}${random}`;
};

const logOrderStatus = async (
  orderId: number,
  orderNo: string,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
  operatorId: number | undefined,
  operatorName: string | undefined,
  remark?: string,
  transaction?: Transaction
) => {
  await OrderStatusLog.create(
    {
      orderId,
      orderNo,
      fromStatus,
      toStatus,
      operatorId,
      operatorName,
      remark: remark || getTransitionDescription(fromStatus, toStatus)
    },
    { transaction }
  );
};

export const createOrder = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { productId, size, flavor, customization, quantity, deliveryAddress, deliveryPhone, deliveryName, deliveryTime, remark, storeId } = req.body;

    if (!productId || !deliveryAddress || !deliveryPhone || !deliveryName || !storeId) {
      throw new BadRequestException('缺少必填参数');
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      throw new BadRequestException('产品不存在');
    }

    const recipe = await Recipe.findOne({
      where: { productId, status: 'active', storeId },
      transaction
    });

    if (!recipe) {
      throw new BadRequestException('该产品暂无配方信息');
    }

    const recipeItems = await RecipeItem.findAll({
      where: { recipeId: recipe.id },
      include: [{ model: Ingredient, as: 'ingredient' }],
      transaction
    });

    const stockErrors: string[] = [];
    for (const item of recipeItems) {
      const ingredient = item.ingredient;
      const requiredQty = Number(item.quantity) * (quantity || 1);
      
      if (!ingredient || Number(ingredient.currentStock) < requiredQty) {
        stockErrors.push(`${ingredient?.name || '未知原料'}库存不足，需求: ${requiredQty}${item.unit}，现有: ${ingredient?.currentStock || 0}${item.unit}`);
      }
    }

    if (stockErrors.length > 0) {
      throw new BadRequestException(stockErrors.join('; '));
    }

    for (const item of recipeItems) {
      const ingredient = item.ingredient;
      const requiredQty = Number(item.quantity) * (quantity || 1);
      
      await ingredient?.update(
        { currentStock: Number(ingredient.currentStock) - requiredQty },
        { transaction }
      );
    }

    const orderNo = generateOrderNo();
    const unitPrice = product.basePrice;
    const qty = quantity || 1;
    const totalAmount = unitPrice * qty;

    const order = await Order.create(
      {
        orderNo,
        userId: req.user?.userId,
        storeId,
        productId,
        productName: product.name,
        productImage: product.images?.split(',')[0],
        size,
        flavor,
        customization,
        quantity: qty,
        unitPrice,
        totalAmount,
        deliveryAddress,
        deliveryPhone,
        deliveryName,
        deliveryTime,
        status: OrderStatus.PENDING_PAYMENT,
        remark
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      null,
      OrderStatus.PENDING_PAYMENT,
      req.user?.userId,
      req.user?.username,
      undefined,
      transaction
    );

    await transaction.commit();

    res.status(201).json(ResponseUtil.created(order, '订单创建成功，原料已扣减'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const payOrder = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== req.user?.userId && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.PAID, req.user?.role || '');

    await order.update(
      {
        status: OrderStatus.PAID,
        paidAt: new Date()
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      order.status,
      OrderStatus.PAID,
      req.user?.userId,
      req.user?.username,
      undefined,
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '支付成功'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const startMaking = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.storeId !== req.user?.storeId && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.MAKING, req.user?.role || '');

    await order.update(
      {
        status: OrderStatus.MAKING,
        startedAt: new Date()
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      order.status,
      OrderStatus.MAKING,
      req.user?.userId,
      req.user?.username,
      undefined,
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '已开始制作'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const finishMaking = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.storeId !== req.user?.storeId && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.READY, req.user?.role || '');

    await order.update(
      {
        status: OrderStatus.READY
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      order.status,
      OrderStatus.READY,
      req.user?.userId,
      req.user?.username,
      undefined,
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '制作完成'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const assignRider = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { riderId } = req.body;

    if (!riderId) {
      throw new BadRequestException('请选择骑手');
    }

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.storeId !== req.user?.storeId && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.DELIVERING, req.user?.role || '');

    const rider = await User.findByPk(riderId, { transaction });
    if (!rider || rider.role !== UserRole.DELIVERY_RIDER) {
      throw new BadRequestException('骑手不存在或角色不正确');
    }

    await order.update(
      {
        riderId,
        status: OrderStatus.DELIVERING
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      order.status,
      OrderStatus.DELIVERING,
      req.user?.userId,
      req.user?.username,
      `已分配骑手: ${rider.realName || rider.username}`,
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '已分配骑手'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const completeDelivery = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.riderId !== req.user?.userId && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.DELIVERED, req.user?.role || '');

    await order.update(
      {
        status: OrderStatus.DELIVERED
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      order.status,
      OrderStatus.DELIVERED,
      req.user?.userId,
      req.user?.username,
      undefined,
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '配送完成'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== req.user?.userId && req.user?.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.COMPLETED, req.user?.role || '');

    await order.update(
      {
        status: OrderStatus.COMPLETED,
        completedAt: new Date()
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      order.status,
      OrderStatus.COMPLETED,
      req.user?.userId,
      req.user?.username,
      undefined,
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '订单已完成'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== req.user?.userId && req.user?.role !== UserRole.SUPER_ADMIN && req.user?.role !== UserRole.STORE_MANAGER) {
      throw new ForbiddenException('无权操作此订单');
    }

    validateTransition(order.status, OrderStatus.CANCELLED, req.user?.role || '');

    const oldStatus = order.status;
    await order.update(
      {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date()
      },
      { transaction }
    );

    await logOrderStatus(
      order.id,
      order.orderNo,
      oldStatus,
      OrderStatus.CANCELLED,
      req.user?.userId,
      req.user?.username,
      reason || '用户取消订单',
      transaction
    );

    await transaction.commit();

    res.json(ResponseUtil.success(order, '订单已取消'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findByPk(id, {
    include: [
      { model: OrderStatusLog, as: 'statusLogs', order: [['createdAt', 'ASC']] },
      { model: Product, as: 'product' }
    ]
  });

  if (!order) {
    throw new NotFoundException('订单不存在');
  }

  if (req.user?.role === UserRole.CUSTOMER && order.userId !== req.user?.userId) {
    throw new ForbiddenException('无权查看此订单');
  }

  if (req.user?.storeId && order.storeId !== req.user?.storeId && req.user?.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException('无权查看此订单');
  }

  if (req.user?.role === UserRole.DELIVERY_RIDER && order.riderId !== req.user?.userId) {
    throw new ForbiddenException('无权查看此订单');
  }

  res.json(ResponseUtil.success(order));
};

export const getOrderList = async (req: Request, res: Response) => {
  const { status, page = 1, pageSize = 10, storeId } = req.query;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  if (req.user?.role === UserRole.CUSTOMER) {
    where.userId = req.user.userId;
  } else if (req.user?.role === UserRole.DELIVERY_RIDER) {
    where.riderId = req.user.userId;
  } else if (req.user?.storeId) {
    where.storeId = req.user.storeId;
  } else if (storeId) {
    where.storeId = storeId;
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.pagination(rows, count, Number(page), Number(pageSize)));
};

export const getAvailableRiders = async (req: Request, res: Response) => {
  const riders = await User.findAll({
    where: {
      role: UserRole.DELIVERY_RIDER,
      status: 'active'
    },
    attributes: ['id', 'username', 'realName', 'phone']
  });

  res.json(ResponseUtil.success(riders));
};

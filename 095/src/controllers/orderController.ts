import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import sequelize from '../config/database';
import { Order, OrderItem, OrderLog, User, Product, Category, StockLock, Ledger } from '../models';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError, NotFoundError, ValidationError } from '../middleware/errorHandler';
import { OrderStatus, CategoryStatus, StockLockReason, OperationType, LogModule, LedgerStatus } from '../types';
import { Op } from 'sequelize';
import logger from '../config/logger';
import { createOperationLog } from '../middleware/operationLog';

export const createOrderValidation = [
  body('companyName').notEmpty().withMessage('公司名称不能为空').trim().isLength({ min: 1, max: 200 }).withMessage('公司名称长度应在1-200字符之间'),
  body('contactPerson').notEmpty().withMessage('联系人不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('联系人长度应在1-50字符之间'),
  body('contactPhone').notEmpty().withMessage('联系电话不能为空').trim().isLength({ min: 1, max: 20 }).withMessage('联系电话长度应在1-20字符之间'),
  body('depositAmount').optional().isFloat({ min: 0 }).withMessage('订金金额必须为非负数字'),
  body('shippingAddress').optional().isLength({ max: 500 }).withMessage('收货地址长度不能超过500字符'),
  body('items').isArray({ min: 1 }).withMessage('订单至少包含一个产品'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('产品ID必须为正整数'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('产品数量必须为正整数'),
  body('items.*.customFee').optional().isFloat({ min: 0 }).withMessage('定制费用必须为非负数字'),
  body('items.*.materialCost').optional().isFloat({ min: 0 }).withMessage('材料成本必须为非负数字'),
  body('logoDesign').optional().isArray().withMessage('LOGO设计必须为数组格式'),
  body('customRequirements').optional().isLength({ max: 2000 }).withMessage('定制要求长度不能超过2000字符'),
  body('remarks').optional().isLength({ max: 2000 }).withMessage('备注长度不能超过2000字符'),
];

export const updateOrderStatusValidation = [
  param('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
  body('status').isIn(Object.values(OrderStatus)).withMessage('状态值无效，有效值：' + Object.values(OrderStatus).join(', ')),
  body('remarks').optional().isLength({ max: 1000 }).withMessage('备注长度不能超过1000字符'),
];

const statusTransitionRules: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.EXPIRED],
  [OrderStatus.PAID]: [OrderStatus.PENDING_PAYMENT, OrderStatus.PRODUCING, OrderStatus.CANCELLED, OrderStatus.REFUNDING, OrderStatus.RETURNING],
  [OrderStatus.PRODUCING]: [OrderStatus.PAID, OrderStatus.QUALITY_CHECKING, OrderStatus.CANCELLED, OrderStatus.REFUNDING, OrderStatus.RETURNING],
  [OrderStatus.QUALITY_CHECKING]: [OrderStatus.PRODUCING, OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDING, OrderStatus.RETURNING],
  [OrderStatus.SHIPPED]: [OrderStatus.QUALITY_CHECKING, OrderStatus.COMPLETED, OrderStatus.REFUNDING, OrderStatus.RETURNING],
  [OrderStatus.COMPLETED]: [OrderStatus.SHIPPED, OrderStatus.REFUNDING, OrderStatus.RETURNING],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDING]: [OrderStatus.REFUNDED, OrderStatus.PAID],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.EXPIRED]: [],
  [OrderStatus.RETURNING]: [OrderStatus.RETURNED, OrderStatus.PARTIAL_RETURNED, OrderStatus.PAID, OrderStatus.COMPLETED],
  [OrderStatus.RETURNED]: [],
  [OrderStatus.PARTIAL_RETURNED]: [OrderStatus.COMPLETED, OrderStatus.RETURNING],
};

const generateOrderNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `PO${date.getFullYear()}${timestamp}${random}`;
};

const validateStatusTransition = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  const allowedTransitions = statusTransitionRules[currentStatus];
  return allowedTransitions.includes(newStatus);
};

const createOrderLog = async (
  orderId: number,
  operatorId: number,
  operatorName: string,
  previousStatus: OrderStatus | null,
  newStatus: OrderStatus,
  action: string,
  remarks?: string
) => {
  await OrderLog.create({
    orderId,
    operatorId,
    operatorName,
    previousStatus,
    newStatus,
    action,
    remarks,
  });
};

const getStatusActionName = (status: OrderStatus): string => {
  const actionMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING_PAYMENT]: '待付款',
    [OrderStatus.PAID]: '已付款',
    [OrderStatus.PRODUCING]: '开始生产',
    [OrderStatus.QUALITY_CHECKING]: '质检中',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDING]: '退款中',
    [OrderStatus.REFUNDED]: '已退款',
    [OrderStatus.EXPIRED]: '已过期',
    [OrderStatus.RETURNING]: '退货中',
    [OrderStatus.RETURNED]: '已退货',
    [OrderStatus.PARTIAL_RETURNED]: '部分退货',
  };
  return actionMap[status];
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { companyName, contactPerson, contactPhone, depositAmount, logoDesign, customRequirements, sizeStatistics, items, remarks, shippingAddress } = req.body;

    const orderNo = generateOrderNo();
    let totalAmount = 0;

    const orderItemsData = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return next(new AppError(`产品ID ${item.productId} 不存在`, 404));
      }

      if (!product.isActive) {
        await transaction.rollback();
        return next(new AppError(`产品"${product.name}"已停用，无法下单`, 400));
      }

      const category = await Category.findByPk(product.categoryId, { transaction });
      if (category?.status === CategoryStatus.DISCONTINUED) {
        await transaction.rollback();
        return next(new AppError(`产品"${product.name}"所属类目"${category.name}"已停产，无法下单`, 400));
      }

      const unitPrice = Number(product.basePrice) + Number(item.customFee || 0);
      const totalPrice = unitPrice * Number(item.quantity);
      totalAmount += totalPrice;

      orderItemsData.push({
        productId: item.productId,
        productName: product.name,
        productCode: product.code,
        quantity: item.quantity,
        unitPrice: product.basePrice,
        customFee: item.customFee || 0,
        materialCost: item.materialCost || 0,
        totalPrice,
        sizeDetails: item.sizeDetails || {},
        remarks: item.remarks,
      });
    }

    const order = await Order.create(
      {
        orderNo,
        companyName,
        contactPerson,
        contactPhone,
        totalAmount,
        depositAmount: depositAmount || 0,
        status: OrderStatus.PENDING_PAYMENT,
        logoDesign: logoDesign || [],
        customRequirements,
        sizeStatistics: sizeStatistics || {},
        shippingAddress,
        remarks,
        createdBy: req.user!.userId,
      },
      { transaction }
    );

    for (const itemData of orderItemsData) {
      await OrderItem.create(
        {
          orderId: order.id,
          ...itemData,
        },
        { transaction }
      );
    }

    const user = await User.findByPk(req.user!.userId, { transaction });
    await createOrderLog(
      order.id,
      req.user!.userId,
      user?.realName || req.user!.username,
      null,
      OrderStatus.PENDING_PAYMENT,
      '创建订单',
      remarks
    );

    await transaction.commit();

    const result = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderLog, as: 'logs', order: [['createdAt', 'DESC']] },
      ],
    });

    logger.info(`订单创建成功: ${orderNo}, 客户: ${companyName}, 创建人: ${user?.realName || req.user!.username}`);
    res.json(successResponse(result, '订单创建成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getOrderList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, orderNo, companyName, status, startDate, endDate, createdBy } = req.query;

    const where: any = {};
    if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
    if (companyName) where.companyName = { [Op.like]: `%${companyName}%` };
    if (status) where.status = status;
    if (createdBy) where.createdBy = createdBy;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'creator', attributes: ['id', 'realName', 'username'] },
      ],
    });

    const statusCounts = await Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    res.json({
      ...successResponse(rows),
      data: {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderLog, as: 'logs', order: [['createdAt', 'DESC']], include: [{ model: User, as: 'operator', attributes: ['id', 'realName'] }] },
        { model: User, as: 'creator', attributes: ['id', 'realName', 'username'] },
      ],
    });

    if (!order) {
      return next(new AppError('订单不存在', 404));
    }

    const allowedTransitions = statusTransitionRules[order.status];

    res.json(successResponse({
      ...order.toJSON(),
      allowedTransitions,
    }));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { id } = req.params;
    const { status, remarks, trackingNumber, shippingAddress, productionEndDate, qualityCheckDate, shipDate } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return next(new AppError('订单不存在', 404));
    }

    const previousStatus = order.status;

    if (!validateStatusTransition(previousStatus, status)) {
      await transaction.rollback();
      return next(new AppError(`订单状态不允许从"${getStatusActionName(previousStatus)}"变更为"${getStatusActionName(status)}"`, 400));
    }

    const updateData: any = { status };

    if (status === OrderStatus.PRODUCING && !order.productionStartDate) {
      updateData.productionStartDate = new Date();
    }
    if (productionEndDate) {
      updateData.productionEndDate = new Date(productionEndDate);
    }
    if (qualityCheckDate) {
      updateData.qualityCheckDate = new Date(qualityCheckDate);
    }
    if (shipDate) {
      updateData.shipDate = new Date(shipDate);
    }
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;

    await order.update(updateData, { transaction });

    const user = await User.findByPk(req.user!.userId, { transaction });
    await createOrderLog(
      order.id,
      req.user!.userId,
      user?.realName || req.user!.username,
      previousStatus,
      status,
      getStatusActionName(status),
      remarks
    );

    await transaction.commit();

    logger.info(`订单状态变更: ${order.orderNo}, ${previousStatus} -> ${status}, 操作人: ${user?.realName || req.user!.username}`);

    const result = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderLog, as: 'logs', order: [['createdAt', 'DESC']] },
      ],
    });

    res.json(successResponse(result, '订单状态更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { companyName, contactPerson, contactPhone, depositAmount, logoDesign, customRequirements, sizeStatistics, items, remarks, shippingAddress } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return next(new AppError('订单不存在', 404));
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      await transaction.rollback();
      return next(new AppError('只能编辑待付款状态的订单', 400));
    }

    let totalAmount = order.totalAmount;
    if (items && items.length > 0) {
      await OrderItem.destroy({ where: { orderId: id }, transaction });
      totalAmount = 0;

      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) {
          await transaction.rollback();
          return next(new AppError(`产品ID ${item.productId} 不存在`, 404));
        }

        if (!product.isActive) {
          await transaction.rollback();
          return next(new AppError(`产品"${product.name}"已停用，无法下单`, 400));
        }

        const unitPrice = Number(product.basePrice) + Number(item.customFee || 0);
        const totalPrice = unitPrice * Number(item.quantity);
        totalAmount += totalPrice;

        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            productName: product.name,
            productCode: product.code,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            customFee: item.customFee || 0,
            materialCost: item.materialCost || 0,
            totalPrice,
            sizeDetails: item.sizeDetails || {},
            remarks: item.remarks,
          },
          { transaction }
        );
      }
    }

    await order.update(
      {
        companyName: companyName !== undefined ? companyName : order.companyName,
        contactPerson: contactPerson !== undefined ? contactPerson : order.contactPerson,
        contactPhone: contactPhone !== undefined ? contactPhone : order.contactPhone,
        totalAmount,
        depositAmount: depositAmount !== undefined ? depositAmount : order.depositAmount,
        logoDesign: logoDesign !== undefined ? logoDesign : order.logoDesign,
        customRequirements: customRequirements !== undefined ? customRequirements : order.customRequirements,
        sizeStatistics: sizeStatistics !== undefined ? sizeStatistics : order.sizeStatistics,
        shippingAddress: shippingAddress !== undefined ? shippingAddress : order.shippingAddress,
        remarks: remarks !== undefined ? remarks : order.remarks,
      },
      { transaction }
    );

    const user = await User.findByPk(req.user!.userId, { transaction });
    await createOrderLog(
      order.id,
      req.user!.userId,
      user?.realName || req.user!.username,
      order.status,
      order.status,
      '编辑订单',
      remarks
    );

    await transaction.commit();

    const result = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderLog, as: 'logs', order: [['createdAt', 'DESC']] },
      ],
    });

    logger.info(`订单编辑成功: ${order.orderNo}, 操作人: ${user?.realName || req.user!.username}`);
    res.json(successResponse(result, '订单更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return next(new AppError('订单不存在', 404));
    }

    if (![OrderStatus.PENDING_PAYMENT, OrderStatus.PAID].includes(order.status)) {
      await transaction.rollback();
      return next(new AppError('当前订单状态不允许取消', 400));
    }

    const previousStatus = order.status;
    await order.update({ status: OrderStatus.CANCELLED }, { transaction });

    const user = await User.findByPk(req.user!.userId, { transaction });
    await createOrderLog(
      order.id,
      req.user!.userId,
      user?.realName || req.user!.username,
      previousStatus,
      OrderStatus.CANCELLED,
      '取消订单',
      remarks
    );

    await transaction.commit();

    logger.info(`订单取消成功: ${order.orderNo}, 操作人: ${user?.realName || req.user!.username}`);
    res.json(successResponse(null, '订单取消成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getOrderLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const { count, rows } = await OrderLog.findAndCountAll({
      where: { orderId: id },
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'operator', attributes: ['id', 'realName', 'username'] }],
    });

    res.json(paginatedResponse(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const statusCounts = await Order.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const totalAmount = await Order.sum('totalAmount', { where });
    const totalDeposit = await Order.sum('depositAmount', { where });
    const totalOrders = await Order.count({ where });

    const recentOrders = await Order.findAll({
      where,
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'realName'] }],
    });

    res.json(successResponse({
      overview: {
        totalOrders,
        totalAmount: totalAmount || 0,
        totalDeposit: totalDeposit || 0,
      },
      statusCounts,
      recentOrders,
    }));
  } catch (error) {
    next(error);
  }
};

export const scheduleProductionValidation = [
  param('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
  body('materialAllocations').isArray({ min: 1 }).withMessage('物料分配不能为空'),
  body('materialAllocations.*.materialId').isInt({ min: 1 }).withMessage('材料ID必须为正整数'),
  body('materialAllocations.*.quantity').isFloat({ min: 0.01 }).withMessage('分配数量必须大于0'),
  body('remarks').optional().isLength({ max: 500 }).withMessage('备注长度不能超过500字符'),
];

export const scheduleProduction = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new ValidationError('参数验证失败'));
    }

    const { id } = req.params;
    const { materialAllocations, remarks } = req.body;

    const order = await Order.findByPk(id, {
      transaction,
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundError('订单不存在'));
    }

    if (order.status !== OrderStatus.PAID) {
      await transaction.rollback();
      return next(new AppError('只有已付款的订单才能安排生产', 400));
    }

    for (const allocation of materialAllocations) {
      const material = await (sequelize.models.Material as any).findByPk(allocation.materialId, { transaction });
      if (!material) {
        await transaction.rollback();
        return next(new NotFoundError(`材料ID ${allocation.materialId} 不存在`));
      }

      const availableQuantity = Number(material.stockQuantity) - Number(material.lockedQuantity);
      if (availableQuantity < Number(allocation.quantity)) {
        await transaction.rollback();
        return next(new AppError(`材料"${material.name}"可用库存不足，当前可用: ${availableQuantity}${material.unit}，需要: ${allocation.quantity}${material.unit}`, 400));
      }

      await (sequelize.models.StockLock as any).create({
        materialId: allocation.materialId,
        orderId: id,
        lockQuantity: allocation.quantity,
        lockReason: StockLockReason.ORDER_PRODUCTION,
        lockedBy: req.user!.userId,
        lockedByName: req.user!.realName || req.user!.username,
        remarks: allocation.remarks || remarks,
      }, { transaction });

      await material.update(
        { lockedQuantity: Number(material.lockedQuantity) + Number(allocation.quantity) },
        { transaction }
      );
    }

    await order.update({
      status: OrderStatus.PRODUCING,
      productionStartDate: new Date(),
    }, { transaction });

    await createOrderLog(
      order.id,
      req.user!.userId,
      req.user!.realName || req.user!.username,
      OrderStatus.PAID,
      OrderStatus.PRODUCING,
      '安排生产',
      remarks
    );

    await transaction.commit();

    await createOperationLog(req, res, LogModule.ORDER, OperationType.STATUS_CHANGE, order.id, 
      `安排订单生产: ${order.orderNo}, 锁定${materialAllocations.length}种物料`
    );

    logger.info(`订单${order.orderNo}安排生产成功，锁定${materialAllocations.length}种物料，操作人: ${req.user?.username}`);
    res.json(successResponse(null, '生产安排成功，物料已锁定'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const returnApplicationValidation = [
  param('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
  body('returnItems').isArray({ min: 1 }).withMessage('退货商品不能为空'),
  body('returnItems.*.orderItemId').isInt({ min: 1 }).withMessage('订单项ID必须为正整数'),
  body('returnItems.*.returnQuantity').isInt({ min: 1 }).withMessage('退货数量必须大于0'),
  body('returnReason').notEmpty().withMessage('退货原因不能为空').isLength({ max: 500 }).withMessage('退货原因长度不能超过500字符'),
  body('returnMaterial').optional().isBoolean().withMessage('是否退回物料必须是布尔值'),
  body('refundAmount').optional().isFloat({ min: 0 }).withMessage('退款金额必须为非负数字'),
  body('remarks').optional().isLength({ max: 500 }).withMessage('备注长度不能超过500字符'),
];

export const createReturnApplication = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new ValidationError('参数验证失败'));
    }

    const { id } = req.params;
    const { returnItems, returnReason, returnMaterial = true, refundAmount, remarks } = req.body;

    const order = await Order.findByPk(id, {
      transaction,
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundError('订单不存在'));
    }

    if (![OrderStatus.PRODUCING, OrderStatus.SHIPPED, OrderStatus.COMPLETED].includes(order.status)) {
      await transaction.rollback();
      return next(new AppError('当前订单状态不支持退货', 400));
    }

    let totalRefundAmount = 0;
    for (const returnItem of returnItems) {
      const orderItem = order.items.find((item: any) => item.id === returnItem.orderItemId);
      if (!orderItem) {
        await transaction.rollback();
        return next(new NotFoundError(`订单项ID ${returnItem.orderItemId} 不存在`));
      }

      const remainingQuantity = Number(orderItem.quantity) - Number(orderItem.returnedQuantity);
      if (remainingQuantity < Number(returnItem.returnQuantity)) {
        await transaction.rollback();
        return next(new AppError(`商品"${orderItem.productName}"退货数量超过可退数量，当前可退: ${remainingQuantity}`, 400));
      }

      const itemRefundAmount = Number(orderItem.unitPrice) * Number(returnItem.returnQuantity);
      totalRefundAmount += itemRefundAmount;

      await orderItem.update(
        { returnedQuantity: Number(orderItem.returnedQuantity) + Number(returnItem.returnQuantity) },
        { transaction }
      );
    }

    const finalRefundAmount = refundAmount !== undefined ? Number(refundAmount) : totalRefundAmount;

    const ledger = await Ledger.findOne({
      where: { orderId: id },
      transaction,
    });

    if (ledger && ledger.status === LedgerStatus.FINALIZED) {
      const newFinalProfit = Number(ledger.finalProfit) - finalRefundAmount;
      await ledger.update(
        {
          returnLoss: Number(ledger.returnLoss || 0) + finalRefundAmount,
          finalProfit: newFinalProfit,
        },
        { transaction }
      );
    }

    if (returnMaterial) {
      const activeLocks = await (sequelize.models.StockLock as any).findAll({
        where: { orderId: id, isActive: true },
        transaction,
      });

      for (const lock of activeLocks) {
        const material = await (sequelize.models.Material as any).findByPk(lock.materialId, { transaction });
        if (material) {
          const returnRatio = finalRefundAmount / Number(order.totalAmount);
          const returnQuantity = Number(lock.lockQuantity) * returnRatio;
          
          const newLockedQuantity = Math.max(0, Number(material.lockedQuantity) - returnQuantity);
          await material.update({ lockedQuantity: newLockedQuantity }, { transaction });

          await lock.update(
            { isActive: false, unlockedAt: new Date(), unlockedBy: req.user!.userId },
            { transaction }
          );
        }
      }
    }

    const previousStatus = order.status;
    await order.update(
      { status: OrderStatus.RETURNING },
      { transaction }
    );

    await createOrderLog(
      order.id,
      req.user!.userId,
      req.user!.realName || req.user!.username,
      previousStatus,
      OrderStatus.RETURNING,
      '申请退货',
      `退货原因: ${returnReason}, 预估退款金额: ${finalRefundAmount}, ${remarks || ''}`
    );

    await transaction.commit();

    await createOperationLog(req, res, LogModule.ORDER, OperationType.RETURN, order.id, 
      `订单退货申请: ${order.orderNo}, 预估退款: ${finalRefundAmount}`
    );

    logger.info(`订单${order.orderNo}退货申请成功，预估退款: ${finalRefundAmount}，操作人: ${req.user?.username}`);
    res.json(successResponse({
      orderId: id,
      orderNo: order.orderNo,
      totalRefundAmount: finalRefundAmount,
      returnMaterial,
    }, '退货申请已提交'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const approveReturnValidation = [
  param('id').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
  body('actualRefundAmount').optional().isFloat({ min: 0 }).withMessage('实际退款金额必须为非负数字'),
  body('auditNotes').optional().isLength({ max: 500 }).withMessage('审核备注长度不能超过500字符'),
];

export const approveReturn = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new ValidationError('参数验证失败'));
    }

    const { id } = req.params;
    const { actualRefundAmount, auditNotes } = req.body;

    const order = await Order.findByPk(id, {
      transaction,
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      await transaction.rollback();
      return next(new NotFoundError('订单不存在'));
    }

    if (order.status !== OrderStatus.RETURNING) {
      await transaction.rollback();
      return next(new AppError('只有退货中的订单才能审核', 400));
    }

    const finalRefundAmount = actualRefundAmount !== undefined ? Number(actualRefundAmount) : Number(order.totalAmount);

    const ledger = await Ledger.findOne({
      where: { orderId: id },
      transaction,
    });

    if (ledger) {
      const newFinalProfit = Number(ledger.finalProfit) - finalRefundAmount;
      await ledger.update(
        {
          returnLoss: Number(ledger.returnLoss || 0) + finalRefundAmount,
          finalProfit: newFinalProfit,
          status: LedgerStatus.ADJUSTED,
        },
        { transaction }
      );
    }

    await order.update(
      { status: OrderStatus.RETURNED },
      { transaction }
    );

    await createOrderLog(
      order.id,
      req.user!.userId,
      req.user!.realName || req.user!.username,
      OrderStatus.RETURNING,
      OrderStatus.RETURNED,
      '退货完成',
      `实际退款金额: ${finalRefundAmount}, ${auditNotes || ''}`
    );

    await transaction.commit();

    await createOperationLog(req, res, LogModule.ORDER, OperationType.RETURN, order.id, 
      `订单退货完成: ${order.orderNo}, 实际退款: ${finalRefundAmount}`
    );

    logger.info(`订单${order.orderNo}退货完成，实际退款: ${finalRefundAmount}，审核人: ${req.user?.username}`);
    res.json(successResponse({
      orderId: id,
      orderNo: order.orderNo,
      actualRefundAmount: finalRefundAmount,
    }, '退货审核完成'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
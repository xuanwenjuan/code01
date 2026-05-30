import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import {
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  Store,
  Material,
  User,
  Inventory,
  InventoryLog
} from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { PurchaseStatus, InventoryOperationType, UserRole } from '../types';

export const createPurchaseOrderValidation = [
  body('supplierId').isInt({ min: 1 }).withMessage('供应商ID必须大于0'),
  body('storeId').optional().isInt({ min: 1 }).withMessage('门店ID必须大于0'),
  body('items').isArray({ min: 1 }).withMessage('至少添加一个原料'),
  body('items.*.materialId').isInt({ min: 1 }).withMessage('原料ID必须大于0'),
  body('items.*.quantity').isFloat({ gt: 0 }).withMessage('数量必须大于0'),
  body('items.*.unitPrice').isFloat({ gt: 0 }).withMessage('单价必须大于0'),
  body('items.*.remark').optional().isString().withMessage('备注必须是字符串'),
  body('expectedDeliveryDate').optional().isISO8601().withMessage('请输入有效的预计交货日期'),
  body('remark').optional().isString().withMessage('备注必须是字符串')
];

export const reviewPurchaseOrderValidation = [
  body('status').isIn([PurchaseStatus.APPROVED, PurchaseStatus.REJECTED]).withMessage('审核状态无效'),
  body('rejectReason').if((value: any, { req }: any) => req.body.status === PurchaseStatus.REJECTED).notEmpty().withMessage('驳回原因不能为空')
];

export const receivePurchaseOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('收货明细不能为空'),
  body('items.*.id').isInt({ min: 1 }).withMessage('订单项ID无效'),
  body('items.*.receivedQuantity').isFloat({ gt: 0 }).withMessage('收货数量必须大于0'),
  body('items.*.batchNo').optional().isString().withMessage('批次号必须是字符串'),
  body('items.*.expireDate').optional().isISO8601().withMessage('请输入有效的有效期')
];

export const getPurchaseOrderListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间'),
  query('status').optional().isIn(Object.values(PurchaseStatus)).withMessage('订单状态无效'),
  query('storeId').optional().isInt().withMessage('门店ID必须是数字'),
  query('supplierId').optional().isInt().withMessage('供应商ID必须是数字')
];

export const createPurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supplierId, items, expectedDeliveryDate, remark } = req.body;
    const userId = req.user!.userId;
    const storeId = req.user!.role === UserRole.STORE ? req.user!.storeId : req.body.storeId;

    if (!storeId) {
      throw new BadRequestException('请选择门店');
    }

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      throw new BadRequestException('供应商不存在');
    }

    if (supplier.cooperationStatus !== 'active') {
      throw new BadRequestException('该供应商非合作状态，无法下单');
    }

    const store = await Store.findByPk(storeId);
    if (!store || !store.isActive) {
      throw new BadRequestException('门店不存在或已禁用');
    }

    const materialIds = items.map((item: any) => item.materialId);
    const materials = await Material.findAll({ where: { id: { [Op.in]: materialIds } } });
    if (materials.length !== materialIds.length) {
      throw new BadRequestException('存在无效的原料ID');
    }

    const inactiveMaterials = materials.filter((m: any) => !m.isActive);
    if (inactiveMaterials.length > 0) {
      throw new BadRequestException(`原料 ${inactiveMaterials.map((m: any) => m.materialName).join(', ')} 已禁用`);
    }

    let totalAmount = 0;
    for (const item of items) {
      item.amount = item.quantity * item.unitPrice;
      totalAmount += item.amount;
    }

    const orderNo = `PO${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = await sequelize.transaction(async (t: Transaction) => {
      const purchaseOrder = await PurchaseOrder.create(
        {
          orderNo,
          storeId,
          supplierId,
          status: PurchaseStatus.PENDING,
          createdBy: userId,
          totalAmount,
          expectedDeliveryDate,
          remark
        },
        { transaction: t }
      );

      const orderItems = items.map((item: any) => ({
        purchaseOrderId: purchaseOrder.id,
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        remark: item.remark
      }));

      await PurchaseOrderItem.bulkCreate(orderItems, { transaction: t });

      return purchaseOrder;
    });

    ResponseUtil.success(res, { id: order.id, orderNo: order.orderNo }, '采购订单创建成功，等待审核');
  } catch (error) {
    next(error);
  }
};

export const reviewPurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;
    const userId = req.user!.userId;

    if (req.user!.role !== UserRole.HEADQUARTERS) {
      throw new ForbiddenException('只有总部人员可以审核采购订单');
    }

    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    if (order.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException(`当前订单状态为「${order.status}」，不允许审核`);
    }

    await order.update({
      status,
      reviewedBy: userId,
      reviewedAt: new Date(),
      rejectReason: status === PurchaseStatus.REJECTED ? rejectReason : null
    });

    ResponseUtil.success(res, order, status === PurchaseStatus.APPROVED ? '订单审核通过，待供应商发货' : '订单已驳回');
  } catch (error) {
    next(error);
  }
};

export const shipPurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    if (order.status !== PurchaseStatus.APPROVED) {
      throw new BadRequestException(`当前订单状态为「${order.status}」，不允许发货`);
    }

    await order.update({
      status: PurchaseStatus.SHIPPED
    });

    ResponseUtil.success(res, order, '订单已发货，待门店收货');
  } catch (error) {
    next(error);
  }
};

export const receivePurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const userId = req.user!.userId;

    const order = await PurchaseOrder.findByPk(id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' }
      ]
    });

    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    if (order.status !== PurchaseStatus.SHIPPED) {
      throw new BadRequestException(`当前订单状态为「${order.status}」，不允许收货`);
    }

    if (req.user!.role === UserRole.STORE && req.user!.storeId !== order.storeId) {
      throw new ForbiddenException('只能操作本门店的订单');
    }

    for (const item of items) {
      const orderItem = (order as any).items.find(
        (i: PurchaseOrderItem) => i.id === item.id
      );
      if (!orderItem) {
        throw new BadRequestException(`订单项ID ${item.id} 不存在`);
      }
      if (item.receivedQuantity > orderItem.quantity) {
        throw new BadRequestException(`原料收货数量不能超过采购数量（采购：${orderItem.quantity}，收货：${item.receivedQuantity}）`);
      }
    }

    await sequelize.transaction(async (t: Transaction) => {
      for (const item of items) {
        const orderItem = (order as any).items.find(
          (i: PurchaseOrderItem) => i.id === item.id
        );

        await orderItem.update(
          {
            receivedQuantity: item.receivedQuantity,
            batchNo: item.batchNo,
            expireDate: item.expireDate
          },
          { transaction: t }
        );

        let inventory = await Inventory.findOne({
          where: { storeId: order.storeId, materialId: orderItem.materialId },
          transaction: t
        });

        const beforeQuantity = inventory ? inventory.quantity : 0;
        const afterQuantity = beforeQuantity + (item.receivedQuantity || 0);

        if (inventory) {
          await inventory.update(
            {
              quantity: afterQuantity,
              availableQuantity: afterQuantity - inventory.lockedQuantity,
              lastInDate: new Date()
            },
            { transaction: t }
          );
        } else {
          inventory = await Inventory.create(
            {
              storeId: order.storeId,
              materialId: orderItem.materialId,
              quantity: afterQuantity,
              lockedQuantity: 0,
              availableQuantity: afterQuantity,
              lastInDate: new Date()
            },
            { transaction: t }
          );
        }

        await InventoryLog.create(
          {
            storeId: order.storeId,
            materialId: orderItem.materialId,
            operationType: InventoryOperationType.PURCHASE_IN,
            beforeQuantity,
            changeQuantity: item.receivedQuantity || 0,
            afterQuantity,
            batchNo: item.batchNo,
            expireDate: item.expireDate,
            operatorId: userId,
            relatedOrderNo: order.orderNo,
            remark: `采购入库，订单号：${order.orderNo}`
          },
          { transaction: t }
        );
      }

      await order.update(
        {
          status: PurchaseStatus.RECEIVED,
          receivedBy: userId,
          receivedAt: new Date()
        },
        { transaction: t }
      );
    });

    ResponseUtil.success(res, null, '订单已完成收货，库存已更新');
  } catch (error) {
    next(error);
  }
};

export const cancelPurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const order = await PurchaseOrder.findByPk(id);
    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    if (![PurchaseStatus.PENDING, PurchaseStatus.REJECTED].includes(order.status as any)) {
      throw new BadRequestException(`当前订单状态为「${order.status}」，不允许取消`);
    }

    if (req.user!.role === UserRole.STORE && req.user!.storeId !== order.storeId) {
      throw new ForbiddenException('只能取消本门店的订单');
    }

    await order.update({
      status: 'cancelled'
    });

    ResponseUtil.success(res, null, '订单已取消');
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, status, storeId, supplierId, startDate, endDate } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (req.user!.role === UserRole.STORE) {
      where.storeId = req.user!.storeId;
    }

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      include: [
        { model: Store, attributes: ['id', 'storeName', 'storeCode'] },
        { model: Supplier, attributes: ['id', 'supplierName', 'supplierCode'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    ResponseUtil.paginated(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const order = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Store, attributes: ['id', 'storeName', 'storeCode', 'address'] },
        { model: Supplier, attributes: ['id', 'supplierName', 'supplierCode', 'contactPerson', 'contactPhone'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'reviewer', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'realName'] },
        {
          model: PurchaseOrderItem,
          as: 'items',
          include: [{ model: Material, attributes: ['id', 'materialName', 'materialCode', 'unit'] }]
        }
      ]
    });

    if (!order) {
      throw new NotFoundException('采购订单不存在');
    }

    ResponseUtil.success(res, order);
  } catch (error) {
    next(error);
  }
};
